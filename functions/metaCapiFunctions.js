const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const { randomUUID } = require('node:crypto');
const { DATASET_ID, STAGES, epoch, buildStageEvent, userData, sendEvent } = require('./metaCapi');

module.exports = function createMetaCapiFunctions({ db, marketingDb, callableOptions }) {
  // Secret requirement temporarily relaxed so deployment does not fail when Secret Manager
  // lacks META_CAPI_ACCESS_TOKEN. Reads from process.env.META_CAPI_ACCESS_TOKEN if configured.
  const getCapiToken = () => process.env.META_CAPI_ACCESS_TOKEN || '';
  const configRef = marketingDb.doc('meta_capi/config');
  const queue = marketingDb.collection('meta_capi_events');
  const metaCapiAdmin = onCall({ ...callableOptions, timeoutSeconds: 60 }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
    const profile = (await db.doc(`users/${request.auth.uid}`).get()).data() || {};
    if (!(profile.role === 'admin' || profile.admin === true || profile.permissions?.admin === true)) throw new HttpsError('permission-denied', 'Admin access required.');
    const config = (await configRef.get()).data() || {};
    const action = request.data?.action || 'status';
    if (action === 'test') {
      const code = String(request.data?.testCode || '').trim();
      if (!/^[A-Za-z0-9_-]{4,100}$/.test(code)) throw new HttpsError('invalid-argument', 'Enter the test event code from Meta Events Manager.');
      const token = getCapiToken();
      if (!token) throw new HttpsError('failed-precondition', 'META_CAPI_ACCESS_TOKEN is not configured.');
      const event = { event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: `druvio-test-${randomUUID()}`, action_source: 'system_generated', custom_data: { event_source: 'crm', lead_event_source: 'Druvio' }, user_data: userData({ email: 'capi-test@example.com' }) };
      let result;
      try { result = await sendEvent({ event, token, testCode: code }); }
      catch (error) { throw new HttpsError('failed-precondition', error.message); }
      await configRef.set({ lastTestAt: Timestamp.now(), lastTestTraceId: result.traceId, datasetId: DATASET_ID }, { merge: true });
      return { tested: true, ...result };
    }
    if (action === 'enable') {
      if (Date.now() - epoch(config.lastTestAt) > 86400000) throw new HttpsError('failed-precondition', 'Send a successful test event first.');
      if (config.mode !== 'production') await configRef.set({ mode: 'production', enabledAt: Timestamp.now(), updatedBy: request.auth.uid }, { merge: true });
    } else if (action === 'disable') await configRef.set({ mode: 'disabled', updatedBy: request.auth.uid }, { merge: true });
    else if (action !== 'status') throw new HttpsError('invalid-argument', 'Unknown action.');
    const latest = (await configRef.get()).data() || {};
    const recent = await queue.orderBy('createdAt', 'desc').limit(10).get();
    return { datasetId: DATASET_ID, mode: latest.mode || 'disabled', tested: Boolean(latest.lastTestAt), stages: STAGES, recent: recent.docs.map((doc) => { const item = doc.data(); return { id: doc.id, eventName: item.eventName, status: item.status, attempts: item.attempts, error: item.error || '', createdAt: epoch(item.createdAt) }; }) };
  });

  const queueMetaLeadEvent = onDocumentWritten({ document: 'leads/{leadId}', database: 'default', region: 'us-central1', retry: true, timeoutSeconds: 60 }, async (change) => {
    if (!change.data?.after.exists) return;
    const config = (await configRef.get()).data() || {};
    if (config.mode !== 'production') return;
    const event = buildStageEvent({ before: change.data.before.exists ? change.data.before.data() : null, after: change.data.after.data(), changeId: change.id, changedAt: change.data.after.updateTime, enabledAt: config.enabledAt });
    if (!event) return;
    try {
      await queue.doc(event.event_id).create({ event, eventName: event.event_name, status: 'pending', attempts: 0, createdAt: Timestamp.now(), readyAt: Timestamp.now() });
    } catch (error) { if (error.code !== 6 && error.code !== 'already-exists') throw error; }
  });

  const deliverMetaLeadEvents = onSchedule({ schedule: 'every 1 minutes', region: 'us-central1', timeoutSeconds: 300, maxInstances: 1 }, async () => {
    const config = (await configRef.get()).data() || {};
    if (config.mode !== 'production') return;
    const token = getCapiToken();
    if (!token) return;
    const pending = await queue.where('readyAt', '<=', Timestamp.now()).orderBy('readyAt').limit(10).get();
    for (const doc of pending.docs) {
      const item = await marketingDb.runTransaction(async (transaction) => {
        const record = (await transaction.get(doc.ref)).data();
        if (!record || !record.readyAt || epoch(record.readyAt) > Date.now()) return null;
        transaction.update(doc.ref, { status: 'sending', readyAt: Timestamp.fromMillis(Date.now() + 360000), attempts: record.attempts + 1 });
        return record;
      });
      if (!item) continue;
      if (item.event.event_time * 1000 < epoch(config.enabledAt) || Date.now() - item.event.event_time * 1000 > 6 * 86400000) {
        await doc.ref.update({ status: 'expired', readyAt: FieldValue.delete(), event: FieldValue.delete() });
        continue;
      }
      try {
        const result = await sendEvent({ event: item.event, token });
        await doc.ref.update({ status: 'sent', sentAt: Timestamp.now(), readyAt: FieldValue.delete(), event: FieldValue.delete(), error: FieldValue.delete(), traceId: result.traceId });
      } catch (error) {
        const retry = error.retryable && item.attempts < 11;
        await doc.ref.update({ status: retry ? 'retrying' : 'failed', error: error.message, readyAt: retry ? Timestamp.fromMillis(Date.now() + Math.min(3600000, 60000 * 2 ** item.attempts)) : FieldValue.delete(), ...(!retry ? { event: FieldValue.delete() } : {}) });
      }
    }
  });
  return { metaCapiAdmin, queueMetaLeadEvent, deliverMetaLeadEvents };
};
