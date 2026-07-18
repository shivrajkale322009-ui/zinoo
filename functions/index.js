const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');

const app = initializeApp();
const db = getFirestore(app, 'default');
const callableOptions = {
  region: 'us-central1',
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://druvio.web.app',
    'https://druvio.firebaseapp.com'
  ]
};

const getPermissions = (profile = {}) => {
  const source = profile.permissions || profile;

  if (source.role === 'admin') return { buyer: true, seller: true, admin: true };
  if (source.role === 'seller') return { buyer: true, seller: true, admin: false };

  return {
    buyer: Boolean(source.buyer),
    seller: Boolean(source.seller),
    admin: Boolean(source.admin)
  };
};

const isApprovedSeller = (profile = {}) => {
  const permissions = getPermissions(profile);
  const statuses = [profile.status, profile.sellerStatus, profile.approvalStatus, profile.reviewStatus]
    .map((value) => String(value || '').trim().toLowerCase());
  return permissions.seller && !permissions.admin
    && !statuses.some((status) => ['pending', 'rejected', 'suspended', 'disabled', 'inactive', 'revoked'].includes(status));
};

const assertValidProjectPayload = (project = {}) => {
  if (!project || typeof project !== 'object' || Array.isArray(project)) {
    throw new HttpsError('invalid-argument', 'A project payload is required.');
  }
  if (typeof project.name !== 'string' || project.name.trim().length < 2) {
    throw new HttpsError('invalid-argument', 'A valid project name is required.');
  }
  const latitude = Number(project.latitude);
  const longitude = Number(project.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new HttpsError('invalid-argument', 'A valid project location is required.');
  }
  const totalPlots = Number(project.totalPlots);
  const remainingPlots = Number(project.remainingPlots);
  if (!Number.isFinite(totalPlots) || totalPlots < 0 || !Number.isFinite(remainingPlots) || remainingPlots < 0 || remainingPlots > totalPlots) {
    throw new HttpsError('invalid-argument', 'Available plots must be between zero and total plots.');
  }
};

exports.createProjectForSeller = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in to create a project for a Seller.');
  const { sellerUid, projectData } = request.data || {};
  if (typeof sellerUid !== 'string' || !sellerUid || sellerUid.includes('/')) {
    throw new HttpsError('invalid-argument', 'A valid Seller is required.');
  }
  assertValidProjectPayload(projectData);

  const adminRef = db.collection('users').doc(request.auth.uid);
  const sellerRef = db.collection('users').doc(sellerUid);
  const projectRef = db.collection('projects').doc();

  await db.runTransaction(async (transaction) => {
    const [adminSnapshot, sellerSnapshot] = await Promise.all([transaction.get(adminRef), transaction.get(sellerRef)]);
    if (!adminSnapshot.exists || !getPermissions(adminSnapshot.data()).admin) {
      throw new HttpsError('permission-denied', 'Only Admin users can create projects for Sellers.');
    }
    if (!sellerSnapshot.exists || !isApprovedSeller(sellerSnapshot.data())) {
      throw new HttpsError('failed-precondition', 'This Seller is not approved to own projects.');
    }

    const { ownerId, sellerUid: ignoredSellerUid, createdBy, createdByRole, createdByAdmin, createdForSellerUid,
      createdOnBehalfOfSeller, status, approvalStatus, reviewStatus, reviewedBy, reviewedAt, approvedAt,
      publishedAt, isApproved, isPublished, ...safeProjectData } = projectData;
    const now = FieldValue.serverTimestamp();
    transaction.create(projectRef, {
      ...safeProjectData,
      name: safeProjectData.name.trim(),
      ownerId: sellerUid,
      sellerUid,
      createdBy: request.auth.uid,
      createdByRole: 'admin',
      createdByAdmin: true,
      createdByAdminUid: request.auth.uid,
      createdForSellerUid: sellerUid,
      createdOnBehalfOfSeller: true,
      status: 'approved',
      approvalStatus: 'approved',
      reviewStatus: 'approved',
      isApproved: true,
      isPublished: true,
      reviewedBy: request.auth.uid,
      reviewedAt: now,
      approvedAt: now,
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    });
  });

  return { projectId: projectRef.id, status: 'approved' };
});

exports.reviewSellerRequest = onCall(callableOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to review seller requests.');
  }

  const { requestId, decision } = request.data || {};
  if (typeof requestId !== 'string' || requestId.length === 0 || requestId.includes('/')) {
    throw new HttpsError('invalid-argument', 'A valid seller request ID is required.');
  }
  if (!['approved', 'rejected'].includes(decision)) {
    throw new HttpsError('invalid-argument', 'The review decision must be approved or rejected.');
  }

  const reviewerRef = db.collection('users').doc(request.auth.uid);
  const requestRef = db.collection('sellerRequests').doc(requestId);

  await db.runTransaction(async (transaction) => {
    const reviewerSnap = await transaction.get(reviewerRef);
    if (!reviewerSnap.exists || !getPermissions(reviewerSnap.data()).admin) {
      throw new HttpsError('permission-denied', 'Only Admin users can review seller requests.');
    }

    const sellerRequestSnap = await transaction.get(requestRef);
    if (!sellerRequestSnap.exists) {
      throw new HttpsError('not-found', 'This seller request no longer exists.');
    }

    const sellerRequest = sellerRequestSnap.data();
    if (sellerRequest.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'This seller request has already been reviewed.');
    }

    const reviewedAt = FieldValue.serverTimestamp();
    const reviewUpdate = {
      status: decision,
      reviewedBy: request.auth.uid,
      reviewedAt,
      updatedAt: reviewedAt
    };

    if (decision === 'approved') {
      const sellerUserId = sellerRequest.userId || requestId;
      const sellerRef = db.collection('users').doc(sellerUserId);
      const sellerSnap = await transaction.get(sellerRef);
      const existingProfile = sellerSnap.exists ? sellerSnap.data() : {};
      const existingPermissions = getPermissions(existingProfile);

      transaction.set(sellerRef, {
        uid: existingProfile.uid || sellerUserId,
        displayName: existingProfile.displayName || sellerRequest.userName || sellerRequest.contactPerson || sellerRequest.businessName || '',
        email: existingProfile.email || sellerRequest.userEmail || sellerRequest.contactEmail || '',
        phoneNumber: existingProfile.phoneNumber || sellerRequest.userPhone || sellerRequest.contactPhone || '',
        businessName: sellerRequest.businessName || existingProfile.businessName || '',
        businessType: sellerRequest.businessType || existingProfile.businessType || '',
        businessAddress: sellerRequest.businessAddress || existingProfile.businessAddress || '',
        permissions: {
          buyer: true,
          seller: true,
          admin: existingPermissions.admin
        },
        updatedAt: reviewedAt,
        ...(sellerSnap.exists ? {} : { createdAt: reviewedAt })
      }, { merge: true });
    }

    transaction.update(requestRef, reviewUpdate);
  });

  return { requestId, status: decision };
});

exports.reviewProject = onCall(callableOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to review projects.');
  }

  const { projectId, decision } = request.data || {};
  if (typeof projectId !== 'string' || projectId.length === 0 || projectId.includes('/')) {
    throw new HttpsError('invalid-argument', 'A valid project ID is required.');
  }
  if (!['approved', 'rejected'].includes(decision)) {
    throw new HttpsError('invalid-argument', 'The review decision must be approved or rejected.');
  }

  const reviewerRef = db.collection('users').doc(request.auth.uid);
  const projectRef = db.collection('projects').doc(projectId);

  await db.runTransaction(async (transaction) => {
    const reviewerSnap = await transaction.get(reviewerRef);
    if (!reviewerSnap.exists || !getPermissions(reviewerSnap.data()).admin) {
      throw new HttpsError('permission-denied', 'Only Admin users can review projects.');
    }

    const projectSnap = await transaction.get(projectRef);
    if (!projectSnap.exists) {
      throw new HttpsError('not-found', 'This project no longer exists.');
    }

    const currentStatus = projectSnap.data().status;
    if (!['pending', 'pending_review'].includes(currentStatus)) {
      throw new HttpsError('failed-precondition', 'This project has already been reviewed.');
    }

    const reviewedAt = FieldValue.serverTimestamp();
    transaction.update(projectRef, {
      status: decision,
      reviewedBy: request.auth.uid,
      reviewedAt,
      updatedAt: reviewedAt
    });
  });

  return { projectId, status: decision };
});
