const { createHash } = require('node:crypto');

const DATASET_ID = '2252404462242027';
const API_VERSION = 'v26.0';
const STAGES = Object.freeze({ New: 'Lead', Contacted: 'Contacted', 'Projects Suggested': 'ProjectsSuggested', 'Visit Scheduled': 'VisitScheduled', 'Visit Completed': 'QualifiedLead', 'Closed Won': 'ConvertedLead', 'Closed Lost': 'ClosedLost' });
const hash = (value) => createHash('sha256').update(value).digest('hex');
const epoch = (value) => value?.toMillis?.() || (value?.seconds ? value.seconds * 1000 : new Date(value || 0).getTime());
function metaId(value) {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return '';
  const id = String(value || '').trim();
  return /^\d{15,17}$/.test(id) ? id : '';
}
function userData(lead) {
  const data = {};
  const id = metaId(lead.metaLeadId || lead.lead_id);
  if (id) data.lead_id = id;
  const email = String(lead.email || '').trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) data.em = [hash(email)];
  let phone = String(lead.phone || lead.phoneNumber || '').replace(/\D/g, '');
  if (/^[6-9]\d{9}$/.test(phone)) phone = `91${phone}`;
  if (/^00/.test(phone)) phone = phone.slice(2);
  if (/^[1-9]\d{10,14}$/.test(phone)) data.ph = [hash(phone)];
  if (/^fb\.\d+\.\d{13}\.[A-Za-z0-9_-]+$/.test(lead.fbc || '')) data.fbc = lead.fbc;
  return data;
}
function buildStageEvent({ before, after, changeId, changedAt, enabledAt, now = Date.now() }) {
  if (!after || after.metaCapiOptOut === true || after.isDemo || after.isTest || !changeId) return null;
  const stage = after.stage || 'New';
  if (!STAGES[stage] || (before && (before.stage || 'New') === stage)) return null;
  const when = epoch(changedAt);
  if (!Number.isFinite(when) || when < epoch(enabledAt) || when > now + 60000 || when < now - 6 * 86400000) return null;
  // Importing an old record is not a new conversion. Future real stage changes remain eligible.
  if (!before && (after.importBatchId || after.source === 'manual_import' || (epoch(after.createdAt) && epoch(after.createdAt) < when - 300000))) return null;
  const data = userData(after);
  const source = String(after.source || '').trim().toLowerCase();
  if (!data.lead_id && !data.fbc && !['meta ads', 'facebook', 'facebook ads', 'instagram', 'instagram ads'].includes(source)) return null;
  if (!Object.keys(data).length) return null;
  return { event_name: STAGES[stage], event_time: Math.floor(when / 1000), event_id: hash(`${DATASET_ID}:${changeId}`), action_source: 'system_generated', custom_data: { event_source: 'crm', lead_event_source: 'Druvio' }, user_data: data };
}
async function sendEvent({ event, token, testCode, fetchImpl = fetch }) {
  const body = { data: [event] };
  if (testCode) body.test_event_code = testCode;
  let response;
  try {
    response = await fetchImpl(`https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  } catch { const error = new Error('Meta connection failed.'); error.retryable = true; throw error; }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error || result.events_received !== 1) {
    // Never persist or log Meta's raw response: it may echo matching data.
    const error = new Error(`Meta rejected delivery (HTTP ${response.status}, code ${Number(result.error?.code) || 0}).`);
    error.retryable = response.status === 429 || response.status >= 500 || result.error?.is_transient === true;
    throw error;
  }
  return { eventsReceived: result.events_received, traceId: String(result.fbtrace_id || '').slice(0, 150) };
}
module.exports = { DATASET_ID, API_VERSION, STAGES, epoch, userData, buildStageEvent, sendEvent };
