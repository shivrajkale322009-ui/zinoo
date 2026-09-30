const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { randomUUID } = require('node:crypto');
const { createHmac, timingSafeEqual } = require('node:crypto');
const { PROPERTY_STATUS } = require('./propertyStatus');
const { deletePropertyResources } = require('./propertyDeletion');
const { TEMPLATE_ID, ASSISTANT_TEMPLATE_ID, invokeProjectAnalysisTemplate, invokeProjectAssistantTemplate, projectFingerprint } = require('./aiService');
const { detectNearestHighway } = require('./highwayDetection');
const { validateDeveloperProfileUpdate } = require('./developerProfile');
const { createPublicProjectSeoHandler } = require('./publicProjectSeo');
const { createPublicProjectProjectionHandler } = require('./publicProjectProjection');
const { sendTemplate, sendText, toE164, normalizeE164, buildTemplateComponents, uploadTemplateImage } = require('./whatsappService');

const app = initializeApp();
// Enterprise stores the marketplace and lead directory. Standard isolates
// WhatsApp templates and delivery records.
const db = getFirestore(app, 'default');
const marketingDb = getFirestore(app, '(default)');
const storage = getStorage(app);
const ALLOWED_ORIGINS = Object.freeze([
  'https://zinoo.in',
  'https://www.zinoo.in',
  'https://flinok.in',
  'https://druvio.web.app',
  'http://localhost:3000',
  'http://localhost:5173'
]);
const callableOptions = {
  region: 'us-central1',
  cors: ALLOWED_ORIGINS
};
Object.assign(exports, require('./metaCapiFunctions')({ db, marketingDb, callableOptions }));
exports.publicProjectSeo = onRequest({ region: 'us-central1', timeoutSeconds: 30, memory: '256MiB' }, createPublicProjectSeoHandler(db));
exports.projectPublicProjection = onDocumentWritten({
  document: 'projects/{projectId}',
  database: 'default',
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB'
}, createPublicProjectProjectionHandler(db));
const googleMapsServerApiKey = defineSecret('GOOGLE_MAPS_SERVER_API_KEY');
const whatsappAccessToken = defineSecret('WHATSAPP_ACCESS_TOKEN');
const whatsappPhoneNumberId = defineSecret('WHATSAPP_PHONE_NUMBER_ID');
const whatsappBusinessAccountId = defineString('WHATSAPP_BUSINESS_ACCOUNT_ID', { default: '2012034352785770' });
const whatsappVerifyToken = defineSecret('WHATSAPP_VERIFY_TOKEN');
const metaAppSecret = defineSecret('META_APP_SECRET');
const REVIEW_FIELDS = new Set(['status', 'reviewedAt', 'reviewedBy', 'approvedAt', 'approvedBy', 'activatedAt', 'activatedBy', 'rejectedAt', 'rejectedBy', 'rejectionReason']);

// The AI module is authored in TypeScript and compiled to lib/ before deploy.
exports.askBusinessAI = require('./lib/ai').askBusinessAI;

const permissionsOf = (profile = {}) => {
  const source = profile.permissions || profile;
  return { buyer: source.role === 'admin' || source.role === 'seller' || Boolean(source.buyer), seller: source.role === 'admin' || source.role === 'seller' || Boolean(source.seller), admin: source.role === 'admin' || Boolean(source.admin) };
};
const isValidSeller = (profile = {}) => {
  const status = [profile.status, profile.sellerStatus, profile.approvalStatus, profile.reviewStatus].map((v) => String(v || '').toLowerCase());
  return permissionsOf(profile).seller && !permissionsOf(profile).admin && !profile.deleted && !profile.disabled && !status.some((v) => ['pending', 'rejected', 'suspended', 'disabled', 'inactive', 'revoked', 'deleted'].includes(v));
};

exports.detectNearestHighway = onCall({ ...callableOptions, secrets: [googleMapsServerApiKey], timeoutSeconds: 60 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const profile = await db.collection('users').doc(request.auth.uid).get();
  if (!profile.exists || !permissionsOf(profile.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can calculate highway distance.');
  const latitude = Number(request.data?.latitude), longitude = Number(request.data?.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new HttpsError('invalid-argument', 'Valid latitude and longitude are required.');
  }
  try {
    const result = await detectNearestHighway({ latitude, longitude, apiKey: googleMapsServerApiKey.value() });
    return { ...result, lastCalculatedAt: new Date().toISOString() };
  } catch (error) {
    console.error('Highway detection failed', { latitude, longitude, message: error?.message });
    // Highway data is an optional editor convenience. Keep the property form
    // usable when the Roads/Geocoding APIs are unavailable or rate-limited.
    return { found: false, unavailable: true };
  }
});
const assertId = (id, label) => { if (typeof id !== 'string' || !id || id.includes('/')) throw new HttpsError('invalid-argument', `A valid ${label} is required.`); };
const assertProject = (project = {}) => {
  if (typeof project.name !== 'string' || project.name.trim().length < 2) throw new HttpsError('invalid-argument', 'A valid property name is required.');
  if (!(project.thumbnail || project.heroImage || project.coverImage)) throw new HttpsError('failed-precondition', 'A cover or hero image is required before publishing.');
  const lat = Number(project.latitude ?? project.location?.lat);
  const lng = Number(project.longitude ?? project.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || (lat === 0 && lng === 0)) throw new HttpsError('failed-precondition', 'Valid latitude and longitude are required before publishing.');
  if (!Number.isFinite(Number(project.startingPrice ?? project.priceFrom)) || Number(project.startingPrice ?? project.priceFrom) <= 0) throw new HttpsError('failed-precondition', 'A valid starting price is required before publishing.');
};
const removeUndefinedValues = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined).map(removeUndefinedValues);
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefinedValues(item)]));
  }
  return value;
};
const cleanChanges = (changes = {}) => removeUndefinedValues(Object.fromEntries(Object.entries(changes).filter(([key]) => key !== 'id' && !REVIEW_FIELDS.has(key))));
const audit = (propertyId, action, by, previousStatus, newStatus, notes = '') => ({ propertyId, action, performedBy: by, performedAt: FieldValue.serverTimestamp(), previousStatus, newStatus, ...(notes ? { notes } : {}) });

exports.manageFeedBannerAsset = onCall({ ...callableOptions, memory: '512MiB' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  console.info('[Zinoo Feed Function] Authenticated request.', {
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
    console.info('[Zinoo Feed Function] Banner deleted.', { uid: request.auth.uid, storagePath });
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
  console.info('[Zinoo Feed Function] Banner uploaded.', {
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

const assertAdmin = async (uid) => {
  const profile = await db.collection('users').doc(uid).get();
  if (!profile.exists || !permissionsOf(profile.data()).admin) {
    throw new HttpsError('permission-denied', 'Only Admin users may perform this action.');
  }
};

const CAMPAIGN_STATUSES = new Set(['DRAFT', 'QUEUED', 'SENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);
const RECIPIENT_STATUSES = new Set(['PENDING', 'SENT', 'DELIVERED', 'FAILED']);
const safeCampaignName = (value) => typeof value === 'string' ? value.trim().slice(0, 120) : '';

// Standard database rules cannot read Enterprise user profiles. This callable
// verifies the Enterprise role, then grants the signed-in admin read access to
// Standard WhatsApp records without copying account details or lead data.
exports.ensureWhatsAppMarketingAccess = onCall({ ...callableOptions }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  await marketingDb.collection('whatsapp_admins').doc(request.auth.uid).set({
    grantedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  return { granted: true };
});

exports.getWhatsAppTemplatePreview = onCall({ ...callableOptions, secrets: [whatsappAccessToken], timeoutSeconds: 30 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const templateId = request.data?.templateId;
  if (typeof templateId !== 'string' || !templateId || templateId.includes('/')) throw new HttpsError('invalid-argument', 'Choose a template.');
  const saved = await marketingDb.collection('whatsapp_templates').doc(templateId).get();
  if (!saved.exists) throw new HttpsError('not-found', 'Template not found.');
  const template = saved.data();
  const url = new URL(`https://graph.facebook.com/v25.0/${encodeURIComponent(whatsappBusinessAccountId.value())}/message_templates`);
  url.searchParams.set('name', template.metaTemplateName);
  url.searchParams.set('fields', 'name,language,status,components');
  url.searchParams.set('limit', '100');
  let payload;
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${whatsappAccessToken.value()}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Meta request failed');
    payload = await response.json();
  } catch {
    throw new HttpsError('unavailable', 'Unable to load the message preview from Meta. Please retry.');
  }
  const match = payload.data?.find((item) => item.name === template.metaTemplateName && item.language === template.language);
  if (!match) throw new HttpsError('not-found', 'This template language was not found in Meta.');
  return { name: match.name, language: match.language, status: match.status, components: match.components || [] };
});

exports.syncWhatsAppTemplates = onCall({ ...callableOptions, secrets: [whatsappAccessToken], timeoutSeconds: 30 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const url = new URL(`https://graph.facebook.com/v25.0/${encodeURIComponent(whatsappBusinessAccountId.value())}/message_templates`);
  url.searchParams.set('fields', 'name,language,status,category,components');
  url.searchParams.set('limit', '100');
  let payload;
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${whatsappAccessToken.value()}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Meta request failed');
    payload = await response.json();
  } catch { throw new HttpsError('unavailable', 'Unable to refresh templates from Meta.'); }
  const templates = payload.data || [];
  const batch = marketingDb.batch();
  templates.forEach((item) => {
    const ref = marketingDb.collection('whatsapp_templates').doc(`${item.name}__${item.language}`.replace(/[^a-zA-Z0-9_-]/g, '_'));
    batch.set(ref, { name: item.name, metaTemplateName: item.name, language: item.language, status: item.status, category: item.category || null, components: item.components || [], syncedFromMetaAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
  if (templates.length) await batch.commit();
  return { count: templates.length };
});

exports.createWhatsAppCampaign = onCall({ ...callableOptions, timeoutSeconds: 120, memory: '512MiB' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const data = request.data || {};
  const name = safeCampaignName(data.name);
  const templateId = typeof data.templateId === 'string' ? data.templateId : '';
  const audience = data.audience || {};
  if (!name || !templateId) throw new HttpsError('invalid-argument', 'Campaign name and an approved template are required.');
  const templateRef = marketingDb.collection('whatsapp_templates').doc(templateId);
  const templateSnapshot = await templateRef.get();
  if (!templateSnapshot.exists || templateSnapshot.data().status !== 'APPROVED') throw new HttpsError('failed-precondition', 'Choose an approved WhatsApp template.');
  const headerMediaUrl = typeof data.headerMediaUrl === 'string' ? data.headerMediaUrl.trim() : '';
  try { buildTemplateComponents(templateSnapshot.data(), 'Sir/Madam', headerMediaUrl); }
  catch (error) { throw new HttpsError('invalid-argument', error.message); }
  let leadQuery = db.collection('leads');
  if (audience.type === 'project' && typeof audience.projectId === 'string') leadQuery = leadQuery.where('projectId', '==', audience.projectId);
  if (audience.type === 'stage' && typeof audience.stage === 'string') leadQuery = leadQuery.where('stage', '==', audience.stage);
  const leadSnapshot = audience.type === 'custom'
    ? await Promise.all((Array.isArray(audience.leadIds) ? audience.leadIds.slice(0, 2000) : []).map((id) => db.collection('leads').doc(id).get()))
    : (await leadQuery.get()).docs;
  const eligible = leadSnapshot
    .map((lead) => ({ id: lead.id, ...lead.data(), phoneNumber: toE164(lead.data().phone) }))
    .filter((lead) => lead.phoneNumber && lead.whatsappOptIn === true);
  if (!eligible.length) throw new HttpsError('failed-precondition', 'This audience has no opted-in leads with a valid phone number.');
  if (eligible.length > 2000) throw new HttpsError('resource-exhausted', 'V1 campaigns are limited to 2,000 recipients.');
  const campaignRef = marketingDb.collection('whatsapp_campaigns').doc();
  await campaignRef.set({ name, templateId, headerMediaUrl, templateName: templateSnapshot.data().name, audience: { type: audience.type || 'all', projectId: audience.projectId || null, stage: audience.stage || null }, status: 'QUEUED', totalRecipients: eligible.length, sentCount: 0, deliveredCount: 0, failedCount: 0, createdBy: request.auth.uid, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  for (let offset = 0; offset < eligible.length; offset += 400) {
    const batch = marketingDb.batch();
    eligible.slice(offset, offset + 400).forEach((lead) => batch.set(campaignRef.collection('recipients').doc(), { leadId: lead.id, leadName: String(lead.name || '').slice(0, 100), phoneNumber: lead.phoneNumber, status: 'PENDING', whatsappMessageId: null, errorMessage: null, sentAt: null, deliveredAt: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }));
    await batch.commit();
  }
  return { campaignId: campaignRef.id, recipientCount: eligible.length };
});

exports.replyToWhatsAppConversation = onCall({ ...callableOptions, secrets: [whatsappAccessToken, whatsappPhoneNumberId] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const conversationId = typeof request.data?.conversationId === 'string' ? request.data.conversationId : '';
  const body = typeof request.data?.body === 'string' ? request.data.body.trim().slice(0, 4096) : '';
  if (!conversationId || !body) throw new HttpsError('invalid-argument', 'A conversation and reply are required.');
  const conversationRef = marketingDb.collection('whatsapp_conversations').doc(conversationId);
  const conversation = await conversationRef.get();
  const phoneNumber = normalizeE164(conversation.data()?.phoneNumber);
  if (!conversation.exists || !phoneNumber) throw new HttpsError('not-found', 'The WhatsApp conversation no longer exists.');
  try {
    const messageId = await sendText({ accessToken: whatsappAccessToken.value(), phoneNumberId: whatsappPhoneNumberId.value(), recipient: phoneNumber, body });
    await conversationRef.collection('messages').doc(messageId || undefined).set({ direction: 'outbound', body, messageType: 'text', whatsappMessageId: messageId, sentBy: request.auth.uid, createdAt: FieldValue.serverTimestamp() });
    await conversationRef.set({ lastMessage: body, lastMessageDirection: 'outbound', lastMessageAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { messageId };
  } catch (error) {
    throw new HttpsError('failed-precondition', String(error.message || 'Meta did not accept this reply. The 24-hour customer service window may have expired.'));
  }
});

exports.markWhatsAppConversationRead = onCall({ ...callableOptions }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const conversationId = typeof request.data?.conversationId === 'string' ? request.data.conversationId : '';
  if (!conversationId) throw new HttpsError('invalid-argument', 'A conversation is required.');
  await marketingDb.collection('whatsapp_conversations').doc(conversationId).set({ unreadCount: 0, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { markedRead: true };
});

const processCampaign = async (campaignSnapshot) => {
  const campaign = campaignSnapshot.data();
  if (!['QUEUED', 'SENDING'].includes(campaign.status)) return;
  const templateSnapshot = await marketingDb.collection('whatsapp_templates').doc(campaign.templateId).get();
  if (!templateSnapshot.exists || templateSnapshot.data().status !== 'APPROVED') { await campaignSnapshot.ref.update({ status: 'FAILED', updatedAt: FieldValue.serverTimestamp() }); return; }
  const pending = await campaignSnapshot.ref.collection('recipients').where('status', '==', 'PENDING').limit(25).get();
  if (pending.empty) { await campaignSnapshot.ref.update({ status: 'COMPLETED', updatedAt: FieldValue.serverTimestamp() }); return; }
  if (!campaign.headerMediaId && templateSnapshot.data().components?.some(part => part.type === 'HEADER' && part.format === 'IMAGE')) {
    try {
      campaign.headerMediaId = await uploadTemplateImage({ accessToken: whatsappAccessToken.value(), phoneNumberId: whatsappPhoneNumberId.value(), url: campaign.headerMediaUrl });
      await campaignSnapshot.ref.update({ headerMediaId: campaign.headerMediaId, updatedAt: FieldValue.serverTimestamp() });
    } catch (error) {
      await campaignSnapshot.ref.update({ status: 'FAILED', errorMessage: String(error.message || 'Unable to prepare header image.').slice(0, 500), updatedAt: FieldValue.serverTimestamp() });
      return;
    }
  }
  await campaignSnapshot.ref.update({ status: 'SENDING', updatedAt: FieldValue.serverTimestamp() });
  for (const recipientSnapshot of pending.docs) {
    const recipient = recipientSnapshot.data();
    try {
      const messageId = await sendTemplate({ accessToken: whatsappAccessToken.value(), phoneNumberId: whatsappPhoneNumberId.value(), recipient: recipient.phoneNumber, leadName: recipient.leadName, template: templateSnapshot.data(), headerMediaUrl: campaign.headerMediaUrl, headerMediaId: campaign.headerMediaId });
      await recipientSnapshot.ref.update({ status: 'SENT', whatsappMessageId: messageId, sentAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      await campaignSnapshot.ref.update({ sentCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
    } catch (error) {
      await recipientSnapshot.ref.update({ status: 'FAILED', errorMessage: String(error.message || 'Unable to send message.').slice(0, 500), updatedAt: FieldValue.serverTimestamp() });
      await campaignSnapshot.ref.update({ failedCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
    }
  }
};

// Bounded background worker: never sends an entire campaign in one HTTP call.
exports.processWhatsAppCampaigns = onSchedule({ schedule: 'every 1 minutes', region: 'us-central1', secrets: [whatsappAccessToken, whatsappPhoneNumberId], timeoutSeconds: 540, memory: '512MiB' }, async () => {
  const campaigns = await marketingDb.collection('whatsapp_campaigns').where('status', 'in', ['QUEUED', 'SENDING']).limit(4).get();
  for (const campaign of campaigns.docs) await processCampaign(campaign);
});

exports.whatsappWebhook = onRequest({ region: 'us-central1', secrets: [whatsappVerifyToken, metaAppSecret], timeoutSeconds: 30 }, async (request, response) => {
  if (request.method === 'GET') {
    if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === whatsappVerifyToken.value()) return response.status(200).send(request.query['hub.challenge']);
    return response.sendStatus(403);
  }
  const signature = request.get('x-hub-signature-256');
  const expected = `sha256=${createHmac('sha256', metaAppSecret.value()).update(request.rawBody).digest('hex')}`;
  if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    console.warn('WhatsApp webhook signature rejected');
    return response.sendStatus(401);
  }
  const statuses = request.body?.entry?.flatMap((entry) => entry.changes || []).flatMap((change) => change.value?.statuses || []) || [];
  for (const status of statuses) {
    const messageId = status.id;
    const nextStatus = status.status === 'delivered' ? 'DELIVERED' : status.status === 'failed' ? 'FAILED' : status.status === 'sent' ? 'SENT' : null;
    if (!messageId || !nextStatus) continue;
    const matches = await marketingDb.collectionGroup('recipients').where('whatsappMessageId', '==', messageId).limit(1).get();
    if (matches.empty) continue;
    const recipientRef = matches.docs[0].ref;
    const campaignRef = recipientRef.parent.parent;
    await marketingDb.runTransaction(async (transaction) => {
      const current = await transaction.get(recipientRef); const currentStatus = current.data()?.status;
      if (!current.exists || currentStatus === 'DELIVERED' || currentStatus === nextStatus) return;
      const update = { status: nextStatus, updatedAt: FieldValue.serverTimestamp() };
      if (nextStatus === 'DELIVERED') update.deliveredAt = FieldValue.serverTimestamp();
      if (nextStatus === 'FAILED') {
        const failure = status.errors?.[0];
        update.errorMessage = [failure?.code && `Meta ${failure.code}`, failure?.title || 'Meta delivery failed.', failure?.error_data?.details].filter(Boolean).join(' · ').slice(0, 500);
      }
      transaction.update(recipientRef, update);
      transaction.update(campaignRef, { ...(nextStatus === 'DELIVERED' ? { deliveredCount: FieldValue.increment(1) } : nextStatus === 'FAILED' && currentStatus !== 'FAILED' ? { failedCount: FieldValue.increment(1) } : {}), updatedAt: FieldValue.serverTimestamp() });
    });
  }
  const values = request.body?.entry?.flatMap((entry) => entry.changes || []).map((change) => change.value || {}) || [];
  let inboundStored = 0;
  for (const value of values) {
    const contacts = new Map((value.contacts || []).map((contact) => [contact.wa_id, contact]));
    for (const message of value.messages || []) {
      const phoneNumber = normalizeE164(message.from);
      if (!phoneNumber || !message.id) continue;
      const contact = contacts.get(message.from);
      const body = String(message.text?.body || message.button?.text || message.interactive?.button_reply?.title || `[${message.type || 'message'}]`).slice(0, 4096);
      const conversationRef = marketingDb.collection('whatsapp_conversations').doc(phoneNumber.replace(/^\+/, ''));
      await conversationRef.collection('messages').doc(message.id).set({ direction: 'inbound', body, messageType: String(message.type || 'unknown').slice(0, 50), whatsappMessageId: message.id, createdAt: FieldValue.serverTimestamp() }, { merge: true });
      await conversationRef.set({ phoneNumber, displayName: String(contact?.profile?.name || phoneNumber).slice(0, 120), lastMessage: body, lastMessageDirection: 'inbound', lastMessageAt: FieldValue.serverTimestamp(), unreadCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      inboundStored += 1;
    }
  }
  console.log('WhatsApp webhook processed', { statusUpdates: statuses.length, inboundStored });
  return response.sendStatus(200);
});

exports.analyzeProject = onCall({ ...callableOptions, timeoutSeconds: 120, memory: '512MiB' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const projectId = request.data?.projectId;
  assertId(projectId, 'project ID');

  const projectSnapshot = await db.collection('projects').doc(projectId).get();
  if (!projectSnapshot.exists) throw new HttpsError('not-found', 'The selected project no longer exists.');

  const project = { id: projectSnapshot.id, ...projectSnapshot.data() };
  const fingerprint = projectFingerprint(project);
  const analysisRef = db.collection('ai_analysis').doc(projectId);
  const cachedSnapshot = await analysisRef.get();
  const cached = cachedSnapshot.exists ? cachedSnapshot.data() : null;

  if (cached?.projectFingerprint === fingerprint && cached?.analysis) {
    return {
      analysis: cached.analysis,
      analyzedAt: cached.analyzedAt?.toDate?.().toISOString() || null,
      cached: true
    };
  }

  try {
    const analysis = await invokeProjectAnalysisTemplate(project);
    await analysisRef.set({
      projectId,
      projectFingerprint: fingerprint,
      templateId: TEMPLATE_ID,
      analysis,
      analyzedAt: FieldValue.serverTimestamp(),
      analyzedBy: request.auth.uid
    });
    return { analysis, analyzedAt: new Date().toISOString(), cached: false };
  } catch (error) {
    console.error('Firebase AI Logic project analysis failed.', { projectId, templateId: TEMPLATE_ID, message: error?.message });
    throw new HttpsError('internal', 'Project analysis is temporarily unavailable. Please try again.');
  }
});

const sanitizeConversation = (value) => {
  if (!Array.isArray(value)) throw new HttpsError('invalid-argument', 'Conversation history must be an array.');
  return value.slice(-20).map((message) => {
    const role = message?.role === 'assistant' ? 'assistant' : message?.role === 'user' ? 'user' : null;
    const content = typeof message?.content === 'string' ? message.content.trim().slice(0, 4000) : '';
    if (!role || !content) throw new HttpsError('invalid-argument', 'Conversation messages must contain a valid role and content.');
    return { role, content };
  });
};

const chunkText = (text, size = 48) => {
  const chunks = [];
  for (let offset = 0; offset < text.length; offset += size) chunks.push(text.slice(offset, offset + size));
  return chunks;
};

exports.chatWithProjectAssistant = onCall({ ...callableOptions, timeoutSeconds: 120, memory: '512MiB' }, async (request, response) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);

  const projectId = request.data?.projectId;
  const question = typeof request.data?.question === 'string' ? request.data.question.trim().slice(0, 4000) : '';
  assertId(projectId, 'project ID');
  if (!question) throw new HttpsError('invalid-argument', 'A question is required.');
  const conversation = sanitizeConversation(request.data?.conversation || []);

  const projectSnapshot = await db.collection('projects').doc(projectId).get();
  if (!projectSnapshot.exists) throw new HttpsError('not-found', 'The selected project no longer exists.');
  const project = { id: projectSnapshot.id, ...projectSnapshot.data() };
  const fingerprint = projectFingerprint(project);
  const requestFingerprint = projectFingerprint({ fingerprint, conversation, question, templateId: ASSISTANT_TEMPLATE_ID });
  const cacheRef = db.collection('ai_analysis').doc(projectId).collection('chat_responses').doc(requestFingerprint);
  const cachedSnapshot = await cacheRef.get();

  try {
    const answer = cachedSnapshot.exists
      ? cachedSnapshot.data().answer
      : await invokeProjectAssistantTemplate(project, conversation, question);

    if (!cachedSnapshot.exists) {
      await cacheRef.set({
        answer,
        projectFingerprint: fingerprint,
        templateId: ASSISTANT_TEMPLATE_ID,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid
      });
    }

    if (request.acceptsStreaming) {
      for (const delta of chunkText(answer)) await response.sendChunk({ delta });
    }
    return {
      answer,
      projectId,
      projectName: project.name || 'Untitled Property',
      cached: cachedSnapshot.exists
    };
  } catch (error) {
    const upstreamResponse = error?.response?.data || error?.aiLogicResponse || null;
    const upstreamMessage = upstreamResponse?.error?.message || error?.message || String(error);
    console.error('Firebase AI Logic project assistant failed.', {
      projectId,
      templateId: ASSISTANT_TEMPLATE_ID,
      message: upstreamMessage,
      code: error?.code || upstreamResponse?.error?.status || null,
      status: error?.response?.status || upstreamResponse?.error?.code || null,
      response: upstreamResponse,
      stack: error?.stack || null
    });
    // Keep the complete original exception in Cloud Functions logs while
    // returning the precise upstream rejection through the callable protocol.
    console.error(error);
    throw new HttpsError('internal', upstreamMessage, {
      templateId: ASSISTANT_TEMPLATE_ID,
      upstreamStatus: error?.response?.status || upstreamResponse?.error?.code || null,
      upstreamCode: upstreamResponse?.error?.status || error?.code || null,
      upstreamResponse
    });
  }
});

exports.manageFeaturedDeveloperLogo = onCall({ ...callableOptions, memory: '256MiB' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const { action, storagePath, contentType, data } = request.data || {};
  const bucket = storage.bucket();
  if (action === 'delete') {
    if (typeof storagePath !== 'string' || !/^developer-logos\/[a-f0-9-]+\.(jpg|png|webp)$/.test(storagePath)) throw new HttpsError('invalid-argument', 'Invalid logo path.');
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
    return { deleted: true };
  }
  if (action !== 'upload' || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) throw new HttpsError('invalid-argument', 'Logo must be PNG, JPG, or WEBP.');
  const buffer = Buffer.from(String(data || ''), 'base64');
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new HttpsError('invalid-argument', 'Logo must be 5 MB or smaller.');
  const extension = contentType === 'image/webp' ? 'webp' : contentType === 'image/png' ? 'png' : 'jpg';
  const uniquePath = `developer-logos/${randomUUID()}.${extension}`;
  const downloadToken = randomUUID();
  await bucket.file(uniquePath).save(buffer, { resumable: false, contentType, metadata: { cacheControl: 'public,max-age=31536000,immutable', metadata: { firebaseStorageDownloadTokens: downloadToken, uploadedBy: request.auth.uid } } });
  return { storagePath: uniquePath, imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniquePath)}?alt=media&token=${downloadToken}` };
});

exports.createSellerAccount = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  await assertAdmin(request.auth.uid);
  const name = String(request.data?.name || '').trim();
  const email = String(request.data?.email || '').trim().toLowerCase();
  const phone = String(request.data?.phone || '').trim();
  if (name.length < 2 || name.length > 100) throw new HttpsError('invalid-argument', 'Seller name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpsError('invalid-argument', 'A valid seller email is required.');
  const account = await getAuth(app).createUser({ email, displayName: name });
  await db.collection('users').doc(account.uid).set({
    uid: account.uid, name, displayName: name, email, phone,
    permissions: { buyer: true, seller: true, admin: false },
    role: 'seller', status: 'active', createdAt: FieldValue.serverTimestamp(), createdBy: request.auth.uid
  });
  return { sellerId: account.uid, sellerName: name, email };
});

exports.listFeaturedDevelopers = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const snapshot = await db.collection('featuredDevelopers').where('isActive', '==', true).orderBy('sortIndex', 'asc').get();
  const records = await Promise.all(snapshot.docs.map(async (item) => {
    const data = item.data();
    const seller = await db.collection('users').doc(data.sellerId).get();
    if (!seller.exists || !isValidSeller(seller.data()) || seller.data().developerProfileVisible === false) return null;
    return { id: item.id, ...data, sellerName: seller.data().businessName || seller.data().displayName || seller.data().name || 'Zinoo Developer' };
  }));
  return { developers: records.filter(Boolean) };
});

exports.getDeveloperProfile = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const sellerId = request.data?.sellerId;
  assertId(sellerId, 'Seller');
  const [sellerSnapshot, featuredSnapshot, activeSnapshot, completedSnapshot] = await Promise.all([
    db.collection('users').doc(sellerId).get(),
    db.collection('featuredDevelopers').doc(sellerId).get(),
    db.collection('projects').where('ownerId', '==', sellerId).where('status', '==', PROPERTY_STATUS.ACTIVE).count().get(),
    db.collection('projects').where('ownerId', '==', sellerId).where('status', '==', PROPERTY_STATUS.SOLD).count().get()
  ]);
  if (!sellerSnapshot.exists || !isValidSeller(sellerSnapshot.data())) throw new HttpsError('not-found', 'Developer profile not found.');
  const seller = sellerSnapshot.data();
  if (seller.developerProfileVisible === false && request.auth.uid !== sellerId) {
    const viewer = await db.collection('users').doc(request.auth.uid).get();
    if (!viewer.exists || !permissionsOf(viewer.data()).admin) throw new HttpsError('not-found', 'Developer profile not found.');
  }
  const featured = featuredSnapshot.exists && featuredSnapshot.data().isActive === true ? featuredSnapshot.data() : null;
  const publicWebsite = typeof seller.publicWebsite === 'string' && /^https:\/\//.test(seller.publicWebsite) ? seller.publicWebsite.slice(0, 1000) : '';
  return { profile: {
    sellerId,
    name: String(seller.businessName || seller.displayName || seller.name || 'Zinoo Developer').slice(0, 120),
    logo: String(seller.publicLogo || featured?.logo || '').slice(0, 2000),
    verified: featured?.verified === true,
    yearsInBusiness: Number.isFinite(Number(seller.yearsInBusiness ?? featured?.experienceYears)) ? Math.max(0, Number(seller.yearsInBusiness ?? featured?.experienceYears)) : null,
    description: String(seller.publicDescription || '').slice(0, 600),
    officeLocation: String(seller.publicOfficeLocation || '').slice(0, 200),
    publicPhone: String(seller.publicPhone || '').slice(0, 30),
    publicWebsite,
    visible: seller.developerProfileVisible !== false,
    activeProjects: activeSnapshot.data().count,
    completedProjects: Math.max(completedSnapshot.data().count, Number(featured?.completedProjects) || 0)
  } };
});

exports.updateDeveloperProfile = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const sellerRef = db.collection('users').doc(request.auth.uid);
  const sellerSnapshot = await sellerRef.get();
  if (!sellerSnapshot.exists || !isValidSeller(sellerSnapshot.data())) {
    throw new HttpsError('permission-denied', 'Only approved sellers can update a developer profile.');
  }
  let changes;
  try {
    changes = validateDeveloperProfileUpdate(request.data);
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message);
  }
  await sellerRef.update({ ...changes, updatedAt: FieldValue.serverTimestamp() });
  return { profile: changes };
});

exports.createProjectForSeller = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { sellerUid, projectData } = request.data || {}; assertId(sellerUid, 'Seller');
  if (!projectData || typeof projectData.name !== 'string' || projectData.name.trim().length < 2) throw new HttpsError('invalid-argument', 'A valid property name is required.');
  const adminRef = db.collection('users').doc(request.auth.uid), sellerRef = db.collection('users').doc(sellerUid), projectRef = db.collection('projects').doc(), auditRef = db.collection('propertyAuditLogs').doc();
  try {
    await db.runTransaction(async (tx) => {
      const [adminSnap, sellerSnap] = await Promise.all([tx.get(adminRef), tx.get(sellerRef)]);
      if (!adminSnap.exists || !permissionsOf(adminSnap.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can create properties for Sellers.');
      if (!sellerSnap.exists || !isValidSeller(sellerSnap.data())) throw new HttpsError('failed-precondition', 'Seller association missing. This property cannot be submitted.');
      const now = FieldValue.serverTimestamp();
      const cleanedProject = cleanChanges(projectData);
      if (cleanedProject.highwayName) cleanedProject.lastCalculatedAt = now;
      tx.create(projectRef, { ...cleanedProject, ownerId: sellerUid, sellerId: sellerUid, sellerUid, createdBy: request.auth.uid, createdByRole: 'admin', status: PROPERTY_STATUS.PENDING, createdAt: now, updatedAt: now });
      tx.create(auditRef, audit(projectRef.id, 'property_submitted', request.auth.uid, null, PROPERTY_STATUS.PENDING));
    });
  } catch (error) {
    console.error('[createProjectForSeller] failed', {
      code: error?.code || null,
      message: error?.message || String(error),
      adminUid: request.auth.uid,
      sellerUid,
      projectId: projectRef.id
    });
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'The property could not be created. Please retry.', { projectId: projectRef.id });
  }
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
  const rejectionReason = String(reason || '').trim();
  if (decision === PROPERTY_STATUS.REJECTED && rejectionReason.length < 10) throw new HttpsError('invalid-argument', 'A meaningful rejection reason of at least 10 characters is required.');
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
      ...(decision === PROPERTY_STATUS.APPROVED
        ? { approvedAt: now, approvedBy: request.auth.uid, rejectionReason: FieldValue.delete(), rejectedAt: FieldValue.delete(), rejectedBy: FieldValue.delete() }
        : { rejectionReason, rejectedAt: now, rejectedBy: request.auth.uid })
    };
    const action = decision === PROPERTY_STATUS.APPROVED ? 'property_approved' : 'property_rejected';
    tx.update(projectRef, update); tx.create(auditRef, audit(projectId, action, request.auth.uid, previousStatus, update.status, rejectionReason));
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

exports.deleteProperty = onCall({ ...callableOptions, invoker: 'public', timeoutSeconds: 120, memory: '512MiB' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, confirmation } = request.data || {};
  assertId(projectId, 'property ID');
  if (typeof confirmation !== 'string' || confirmation.trim() !== 'DELETE') {
    throw new HttpsError('invalid-argument', 'Type DELETE to confirm permanent property deletion.');
  }

  const adminProfile = await db.collection('users').doc(request.auth.uid).get();
  if (!adminProfile.exists || !permissionsOf(adminProfile.data()).admin) {
    throw new HttpsError('permission-denied', 'Only authorized Admin users can delete properties.');
  }

  console.info('[Zinoo Property Delete] Started', { projectId, actorId: request.auth.uid });
  const result = await deletePropertyResources({
    db,
    bucket: storage.bucket(),
    projectId,
    actorId: request.auth.uid
  });
  console.info('[Zinoo Property Delete] Completed', { ...result, actorId: request.auth.uid });
  return result;
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
  const rejectionReason = cleanText(request.data?.reason, 500);
  if (decision === 'rejected' && rejectionReason.length < 10) throw new HttpsError('invalid-argument', 'A meaningful rejection reason of at least 10 characters is required.');
  const reviewer = await db.collection('users').doc(request.auth.uid).get(); if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can review seller requests.');
  const requestRef = db.collection('sellerRequests').doc(requestId); const sellerRequest = await requestRef.get(); if (!sellerRequest.exists) throw new HttpsError('not-found', 'This seller request no longer exists.');
  const application = sellerRequest.data();
  if (application.status !== 'pending') throw new HttpsError('failed-precondition', 'Only pending seller applications can be reviewed.');
  const batch = db.batch(), now = FieldValue.serverTimestamp();
  batch.update(requestRef, {
    status: decision, reviewedBy: request.auth.uid, reviewedAt: now, updatedAt: now,
    ...(decision === 'approved' ? { approvedBy: request.auth.uid, approvedAt: now, rejectionReason: FieldValue.delete(), rejectedBy: FieldValue.delete(), rejectedAt: FieldValue.delete() } : { rejectionReason, rejectedBy: request.auth.uid, rejectedAt: now })
  });
  if (decision === 'approved') {
    batch.set(db.collection('users').doc(application.userId || requestId), {
      permissions: { buyer: true, seller: true, admin: false }, businessName: application.businessName || '', sellerStatus: 'approved', sellerApprovedBy: request.auth.uid, sellerApprovedAt: now, updatedAt: now
    }, { merge: true });
  }
  batch.create(db.collection('sellerAuditLogs').doc(), { requestId, sellerId: application.userId || requestId, action: decision === 'approved' ? 'seller_approved' : 'seller_rejected', fromStatus: application.status, toStatus: decision, actorId: request.auth.uid, reason: rejectionReason || null, createdAt: now });
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
