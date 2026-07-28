const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { randomUUID } = require('node:crypto');
const { PROPERTY_STATUS } = require('./propertyStatus');

const app = initializeApp();
const db = getFirestore(app, 'default');
const storage = getStorage(app);
const ALLOWED_ORIGINS = Object.freeze([
  'https://druvio.web.app',
  'http://localhost:3000',
  'http://localhost:5173'
]);
const callableOptions = {
  region: 'us-central1',
  cors: ALLOWED_ORIGINS
};
const REVIEW_FIELDS = new Set(['status', 'reviewedAt', 'reviewedBy', 'approvedAt', 'approvedBy', 'activatedAt', 'activatedBy']);

const permissionsOf = (profile = {}) => {
  const source = profile.permissions || profile;
  return { buyer: source.role === 'admin' || source.role === 'seller' || Boolean(source.buyer), seller: source.role === 'admin' || source.role === 'seller' || Boolean(source.seller), admin: source.role === 'admin' || Boolean(source.admin) };
};
const isValidSeller = (profile = {}) => {
  const status = [profile.status, profile.sellerStatus, profile.approvalStatus, profile.reviewStatus].map((v) => String(v || '').toLowerCase());
  return permissionsOf(profile).seller && !permissionsOf(profile).admin && !profile.deleted && !profile.disabled && !status.some((v) => ['pending', 'rejected', 'suspended', 'disabled', 'inactive', 'revoked', 'deleted'].includes(v));
};
const assertId = (id, label) => { if (typeof id !== 'string' || !id || id.includes('/')) throw new HttpsError('invalid-argument', `A valid ${label} is required.`); };
const assertProject = (project = {}) => {
  if (typeof project.name !== 'string' || project.name.trim().length < 2) throw new HttpsError('invalid-argument', 'A valid property name is required.');
  if (!(project.thumbnail || project.heroImage || project.coverImage)) throw new HttpsError('failed-precondition', 'A cover or hero image is required before publishing.');
  const lat = Number(project.latitude ?? project.location?.lat);
  const lng = Number(project.longitude ?? project.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || (lat === 0 && lng === 0)) throw new HttpsError('failed-precondition', 'Valid latitude and longitude are required before publishing.');
  if (!Number.isFinite(Number(project.startingPrice ?? project.priceFrom)) || Number(project.startingPrice ?? project.priceFrom) <= 0) throw new HttpsError('failed-precondition', 'A valid starting price is required before publishing.');
};
const cleanChanges = (changes = {}) => Object.fromEntries(Object.entries(changes).filter(([key]) => key !== 'id' && !REVIEW_FIELDS.has(key)));
const audit = (propertyId, action, by, previousStatus, newStatus, notes = '') => ({ propertyId, action, performedBy: by, performedAt: FieldValue.serverTimestamp(), previousStatus, newStatus, ...(notes ? { notes } : {}) });

exports.manageFeedBannerAsset = onCall({ ...callableOptions, memory: '512MiB' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  console.info('[Druvio Feed Function] Authenticated request.', {
    uid: request.auth.uid,
    action: request.data?.action || null,
    databaseId: 'default',
    bucket: storage.bucket().name
  });
  const profile = await db.collection('users').doc(request.auth.uid).get();
  if (!profile.exists || !permissionsOf(profile.data()).admin) {
    throw new HttpsError('permission-denied', 'Only Admin users can manage feed banners.');
  }

  const { action, storagePath, contentType, data } = request.data || {};
  const bucket = storage.bucket();
  if (action === 'delete') {
    if (typeof storagePath !== 'string' || !/^feed-banners\/[a-f0-9-]+\.(jpg|png|webp)$/.test(storagePath)) {
      throw new HttpsError('invalid-argument', 'A valid feed banner path is required.');
    }
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
    console.info('[Druvio Feed Function] Banner deleted.', { uid: request.auth.uid, storagePath });
    return { deleted: true };
  }

  if (action !== 'upload') throw new HttpsError('invalid-argument', 'Unsupported feed banner action.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
    throw new HttpsError('invalid-argument', 'Feed banners must be JPG, PNG, or WebP images.');
  }
  if (typeof data !== 'string') throw new HttpsError('invalid-argument', 'Banner image data is required.');
  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length || buffer.length > 10 * 1024 * 1024) {
    throw new HttpsError('invalid-argument', 'Feed banners must be 10 MB or smaller.');
  }

  const extension = contentType === 'image/webp' ? 'webp' : contentType === 'image/png' ? 'png' : 'jpg';
  const uniquePath = `feed-banners/${randomUUID()}.${extension}`;
  const downloadToken = randomUUID();
  await bucket.file(uniquePath).save(buffer, {
    resumable: false,
    contentType,
    metadata: {
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
        uploadedBy: request.auth.uid
      }
    }
  });
  console.info('[Druvio Feed Function] Banner uploaded.', {
    uid: request.auth.uid,
    storagePath: uniquePath,
    size: buffer.length,
    contentType,
    bucket: bucket.name
  });
  return {
    storagePath: uniquePath,
    imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniquePath)}?alt=media&token=${downloadToken}`
  };
});

exports.createProjectForSeller = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { sellerUid, projectData } = request.data || {}; assertId(sellerUid, 'Seller');
  if (!projectData || typeof projectData.name !== 'string' || projectData.name.trim().length < 2) throw new HttpsError('invalid-argument', 'A valid property name is required.');
  const adminRef = db.collection('users').doc(request.auth.uid), sellerRef = db.collection('users').doc(sellerUid), projectRef = db.collection('projects').doc(), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [adminSnap, sellerSnap] = await Promise.all([tx.get(adminRef), tx.get(sellerRef)]);
    if (!adminSnap.exists || !permissionsOf(adminSnap.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can create properties for Sellers.');
    if (!sellerSnap.exists || !isValidSeller(sellerSnap.data())) throw new HttpsError('failed-precondition', 'Seller association missing. This property cannot be submitted.');
    const now = FieldValue.serverTimestamp();
    tx.create(projectRef, { ...cleanChanges(projectData), ownerId: sellerUid, sellerId: sellerUid, sellerUid, createdBy: request.auth.uid, createdByRole: 'admin', status: PROPERTY_STATUS.PENDING, createdAt: now, updatedAt: now });
    tx.create(auditRef, audit(projectRef.id, 'property_submitted', request.auth.uid, null, PROPERTY_STATUS.PENDING));
  });
  return { projectId: projectRef.id, status: PROPERTY_STATUS.PENDING };
});

exports.submitProjectChanges = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, changes } = request.data || {}; assertId(projectId, 'property ID');
  const ref = db.collection('projects').doc(projectId), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref); if (!snap.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const current = snap.data(); if (![current.ownerId, current.sellerId, current.sellerUid].includes(request.auth.uid)) throw new HttpsError('permission-denied', 'Only the associated Seller may submit changes.');
    tx.update(ref, { ...cleanChanges(changes), status: PROPERTY_STATUS.PENDING, changesSubmittedAt: FieldValue.serverTimestamp(), changesSubmittedBy: request.auth.uid, updatedAt: FieldValue.serverTimestamp() });
    tx.create(auditRef, audit(projectId, 'changes_submitted', request.auth.uid, current.status, PROPERTY_STATUS.PENDING));
  });
  return { projectId, status: PROPERTY_STATUS.PENDING };
});

exports.reviewProject = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, decision, reason = '' } = request.data || {}; assertId(projectId, 'property ID');
  if (![PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.REJECTED].includes(decision)) throw new HttpsError('invalid-argument', 'The review decision must be approved or rejected.');
  const reviewerRef = db.collection('users').doc(request.auth.uid), projectRef = db.collection('projects').doc(projectId), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const reviewer = await tx.get(reviewerRef); if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can review properties.');
    const snap = await tx.get(projectRef); if (!snap.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const project = snap.data(), previousStatus = project.status;
    const sellerId = project.sellerId || project.sellerUid || project.ownerId;
    if (!sellerId) throw new HttpsError('failed-precondition', 'Unable to publish property. Assign a valid seller before publishing.');
    const seller = await tx.get(db.collection('users').doc(sellerId));
    if (!seller.exists || !isValidSeller(seller.data())) throw new HttpsError('failed-precondition', 'Unable to publish property. Assign a valid seller before publishing.');
    if (previousStatus !== PROPERTY_STATUS.PENDING) throw new HttpsError('failed-precondition', 'Only pending properties can be reviewed.');
    if (decision === PROPERTY_STATUS.APPROVED) assertProject(project);
    const now = FieldValue.serverTimestamp();
    const update = {
      status: decision,
      reviewedAt: now,
      reviewedBy: request.auth.uid,
      updatedAt: now,
      ...(decision === PROPERTY_STATUS.APPROVED ? { approvedAt: now, approvedBy: request.auth.uid } : {})
    };
    const action = decision === PROPERTY_STATUS.APPROVED ? 'property_approved' : 'property_rejected';
    tx.update(projectRef, update); tx.create(auditRef, audit(projectId, action, request.auth.uid, previousStatus, update.status, reason));
  });
  return { projectId, status: decision };
});

exports.setProjectStatus = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, status } = request.data || {};
  assertId(projectId, 'property ID');
  if (![PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD].includes(status)) {
    throw new HttpsError('invalid-argument', 'Listing status must be active, inactive, or sold.');
  }
  const reviewerRef = db.collection('users').doc(request.auth.uid);
  const projectRef = db.collection('projects').doc(projectId);
  const auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [reviewer, snapshot] = await Promise.all([tx.get(reviewerRef), tx.get(projectRef)]);
    if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can change listing status.');
    if (!snapshot.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const project = snapshot.data();
    const allowedTransitions = {
      [PROPERTY_STATUS.APPROVED]: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD],
      [PROPERTY_STATUS.ACTIVE]: [PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD],
      [PROPERTY_STATUS.INACTIVE]: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.SOLD]
    };
    if (!allowedTransitions[project.status]?.includes(status)) {
      throw new HttpsError('failed-precondition', `Cannot change property status from ${project.status} to ${status}.`);
    }
    const now = FieldValue.serverTimestamp();
    tx.update(projectRef, {
      status,
      updatedAt: now,
      ...(status === PROPERTY_STATUS.ACTIVE ? { activatedAt: now, activatedBy: request.auth.uid } : {})
    });
    tx.create(auditRef, audit(projectId, `property_${status}`, request.auth.uid, project.status, status));
  });
  return { projectId, status };
});

exports.assignProjectSeller = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, sellerId } = request.data || {}; assertId(projectId, 'property ID'); assertId(sellerId, 'Seller');
  console.info('assignProjectSeller started', { projectId, sellerId, actorId: request.auth.uid });
  const reviewerRef = db.collection('users').doc(request.auth.uid), sellerRef = db.collection('users').doc(sellerId), projectRef = db.collection('projects').doc(projectId), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [reviewer, seller, project] = await Promise.all([tx.get(reviewerRef), tx.get(sellerRef), tx.get(projectRef)]);
    if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can assign property Sellers.');
    if (!seller.exists || !isValidSeller(seller.data())) throw new HttpsError('failed-precondition', 'Select a valid Seller account.');
    if (!project.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const data = project.data(); tx.update(projectRef, { ownerId: sellerId, sellerId, sellerUid: sellerId, updatedAt: FieldValue.serverTimestamp() });
    tx.create(auditRef, audit(projectId, 'seller_association_changed', request.auth.uid, data.status, data.status, `Seller changed from ${data.sellerId || data.sellerUid || data.ownerId || 'missing'} to ${sellerId}`));
  });
  console.info('assignProjectSeller completed', { projectId, sellerId, actorId: request.auth.uid });
  return { projectId, sellerId };
});

exports.reviewSellerRequest = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { requestId, decision } = request.data || {}; assertId(requestId, 'seller request ID');
  if (!['approved', 'rejected'].includes(decision)) throw new HttpsError('invalid-argument', 'The seller review decision is invalid.');
  const reviewer = await db.collection('users').doc(request.auth.uid).get(); if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can review seller requests.');
  const requestRef = db.collection('sellerRequests').doc(requestId); const sellerRequest = await requestRef.get(); if (!sellerRequest.exists) throw new HttpsError('not-found', 'This seller request no longer exists.');
  const batch = db.batch(), now = FieldValue.serverTimestamp(); batch.update(requestRef, { status: decision, reviewedBy: request.auth.uid, reviewedAt: now, updatedAt: now });
  if (decision === 'approved') { const data = sellerRequest.data(); batch.set(db.collection('users').doc(data.userId || requestId), { permissions: { buyer: true, seller: true, admin: false }, businessName: data.businessName || '', updatedAt: now }, { merge: true }); }
  await batch.commit(); return { requestId, status: decision };
});

const CASHBACK_STATUS = Object.freeze({
  PENDING_SELLER: 'Pending Seller Approval',
  PENDING_ADMIN: 'Pending Admin Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAYMENT_PENDING: 'Payment Pending',
  PAID: 'Paid'
});
const cleanText = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const cashbackAudit = (cashbackId, actorId, role, action, fromStatus, toStatus, details = {}) => ({
  cashbackId, actorId, role, action, fromStatus: fromStatus || null, toStatus,
  details, createdAt: FieldValue.serverTimestamp()
});
const notification = (recipientId, title, message, cashbackId, type) => ({
  recipientId, title, message, cashbackId, type, read: false,
  channels: { inApp: true, whatsapp: false, sms: false, push: false },
  createdAt: FieldValue.serverTimestamp()
});

exports.submitCashbackRequest = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const input = request.data || {};
  assertId(input.projectId, 'project ID');
  const area = Number(input.purchasedAreaSqFt);
  if (!Number.isFinite(area) || area <= 0) throw new HttpsError('invalid-argument', 'A valid purchased area is required.');
  if (!cleanText(input.proofUrl, 2000) || !cleanText(input.proofPath, 1000)) throw new HttpsError('invalid-argument', 'Booking proof is required.');
  const buyerRef = db.collection('users').doc(request.auth.uid);
  const projectRef = db.collection('projects').doc(input.projectId);
  const cashbackRef = db.collection('cashbacks').doc();
  const auditRef = db.collection('cashbackAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [buyerSnap, projectSnap] = await Promise.all([tx.get(buyerRef), tx.get(projectRef)]);
    if (!projectSnap.exists) throw new HttpsError('not-found', 'The selected property no longer exists.');
    const buyer = buyerSnap.exists ? buyerSnap.data() : {};
    const project = projectSnap.data();
    const sellerId = project.ownerId || project.sellerUid || project.sellerId;
    if (!sellerId) throw new HttpsError('failed-precondition', 'This property has no assigned seller.');
    const rate = Number(project.cashbackPerGuntha ?? project.cashbackAmount);
    if (!Number.isFinite(rate) || rate <= 0) throw new HttpsError('failed-precondition', 'Cashback is not available for this property.');
    const amount = Math.round((rate * area) / 900);
    const now = FieldValue.serverTimestamp();
    const cashbackRequestId = `CB-${cashbackRef.id.slice(0, 10).toUpperCase()}`;
    const data = {
      cashbackRequestId, createdBy: request.auth.uid,
      buyerName: cleanText(buyer.displayName || buyer.name || input.buyerName, 120),
      buyerPhone: cleanText(buyer.phoneNumber || buyer.phone || input.buyerPhone, 30),
      buyerEmail: cleanText(buyer.email || input.buyerEmail, 200),
      project: cleanText(project.name, 200), projectId: projectRef.id,
      projectOwnerId: sellerId, sellerName: cleanText(project.developer || project.sellerName, 200),
      purchasedAreaSqFt: area, purchasedAreaGuntha: area / 900,
      cashbackPerGuntha: rate, cashbackAmount: amount, commissionAmount: amount,
      proofUrl: cleanText(input.proofUrl, 2000), proofPath: cleanText(input.proofPath, 1000),
      documentName: cleanText(input.documentName, 250), documentType: cleanText(input.documentType, 100),
      status: CASHBACK_STATUS.PENDING_SELLER, createdAt: now, updatedAt: now
    };
    tx.create(cashbackRef, data);
    tx.create(auditRef, cashbackAudit(cashbackRef.id, request.auth.uid, 'buyer', 'submitted', null, data.status));
    tx.create(db.collection('notifications').doc(), notification(sellerId, 'New cashback request', 'A new cashback request has been submitted. Please review it.', cashbackRef.id, 'cashback_submitted'));
  });
  return { cashbackId: cashbackRef.id, cashbackRequestId: `CB-${cashbackRef.id.slice(0, 10).toUpperCase()}`, status: CASHBACK_STATUS.PENDING_SELLER };
});

exports.manageCashbackRequest = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { cashbackId, action } = request.data || {};
  assertId(cashbackId, 'cashback ID');
  if (!['approve', 'reject', 'mark_paid'].includes(action)) throw new HttpsError('invalid-argument', 'Unsupported cashback action.');
  const actorRef = db.collection('users').doc(request.auth.uid);
  const cashbackRef = db.collection('cashbacks').doc(cashbackId);
  await db.runTransaction(async (tx) => {
    const [actorSnap, cashbackSnap] = await Promise.all([tx.get(actorRef), tx.get(cashbackRef)]);
    if (!actorSnap.exists) throw new HttpsError('permission-denied', 'Account profile not found.');
    if (!cashbackSnap.exists) throw new HttpsError('not-found', 'Cashback request not found.');
    const actor = actorSnap.data(), claim = cashbackSnap.data(), perms = permissionsOf(actor);
    const isAdmin = perms.admin;
    const isAssignedSeller = perms.seller && !isAdmin && claim.projectOwnerId === request.auth.uid;
    const reason = cleanText(request.data.reason, 500);
    let nextStatus, role, update = {}, buyerMessage, adminNotice = false;
    if (action === 'approve' && isAssignedSeller && claim.status === CASHBACK_STATUS.PENDING_SELLER) {
      nextStatus = CASHBACK_STATUS.PENDING_ADMIN; role = 'seller';
      update.sellerReviewedAt = FieldValue.serverTimestamp(); update.sellerReviewedBy = request.auth.uid;
      buyerMessage = 'Your cashback request has been approved by the seller and is awaiting admin review.'; adminNotice = true;
    } else if (action === 'reject' && isAssignedSeller && claim.status === CASHBACK_STATUS.PENDING_SELLER) {
      if (!reason) throw new HttpsError('invalid-argument', 'A rejection reason is required.');
      nextStatus = CASHBACK_STATUS.REJECTED; role = 'seller'; update.sellerReviewedAt = FieldValue.serverTimestamp(); update.sellerReviewedBy = request.auth.uid; update.sellerRejectionReason = reason;
      buyerMessage = `Your cashback request has been rejected by the seller. Reason: ${reason}`;
    } else if (action === 'approve' && isAdmin && claim.status === CASHBACK_STATUS.PENDING_ADMIN) {
      nextStatus = CASHBACK_STATUS.PAYMENT_PENDING; role = 'admin'; update.adminReviewedAt = FieldValue.serverTimestamp(); update.adminReviewedBy = request.auth.uid; update.adminNotes = cleanText(request.data.adminNotes, 1000);
      buyerMessage = 'Your cashback request has been approved.';
    } else if (action === 'reject' && isAdmin && claim.status === CASHBACK_STATUS.PENDING_ADMIN) {
      if (!reason) throw new HttpsError('invalid-argument', 'A rejection reason is required.');
      nextStatus = CASHBACK_STATUS.REJECTED; role = 'admin'; update.adminReviewedAt = FieldValue.serverTimestamp(); update.adminReviewedBy = request.auth.uid; update.adminRejectionReason = reason;
      buyerMessage = `Your cashback request has been rejected. Reason: ${reason}`;
    } else if (action === 'mark_paid' && isAdmin && [CASHBACK_STATUS.APPROVED, CASHBACK_STATUS.PAYMENT_PENDING].includes(claim.status)) {
      const transactionReference = cleanText(request.data.transactionReference, 200);
      const paymentMethod = cleanText(request.data.paymentMethod, 100);
      const paymentDate = cleanText(request.data.paymentDate, 10);
      if (!transactionReference || !paymentMethod || !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) throw new HttpsError('invalid-argument', 'Payment date, method, and transaction reference are required.');
      nextStatus = CASHBACK_STATUS.PAID; role = 'admin'; update = { ...update, transactionReference, paymentMethod, paymentDate, paidAt: FieldValue.serverTimestamp(), paidBy: request.auth.uid };
      buyerMessage = `Your cashback has been transferred successfully. Amount: ₹${claim.cashbackAmount}. Reference: ${transactionReference}. Date: ${paymentDate}.`;
    } else {
      throw new HttpsError('failed-precondition', 'This action is not allowed for the current role or status.');
    }
    const now = FieldValue.serverTimestamp();
    tx.update(cashbackRef, { ...update, status: nextStatus, updatedAt: now });
    tx.create(db.collection('cashbackAuditLogs').doc(), cashbackAudit(cashbackId, request.auth.uid, role, action, claim.status, nextStatus, { reason: reason || null }));
    tx.create(db.collection('notifications').doc(), notification(claim.createdBy, 'Cashback request update', buyerMessage, cashbackId, `cashback_${action}`));
    if (adminNotice) tx.create(db.collection('notifications').doc(), notification('admins', 'Cashback ready for review', 'A cashback request is ready for review.', cashbackId, 'cashback_admin_review'));
  });
  return { cashbackId, action };
});
