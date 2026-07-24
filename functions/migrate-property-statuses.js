/* Safe, idempotent status normalization. Dry-run by default; pass --apply to commit. */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const {
  PROPERTY_STATUSES,
  LEGACY_STATUS_MAP,
  normalizePropertyStatus
} = require('./propertyStatus');

initializeApp();
const db = getFirestore('default');
const apply = process.argv.includes('--apply');

async function main() {
  const snapshot = await db.collection('projects').get();
  const counts = {};
  const unknown = [];
  const candidates = [];

  for (const document of snapshot.docs) {
    const previousStatus = document.data().status;
    const token = String(previousStatus ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    counts[String(previousStatus ?? '<missing>')] = (counts[String(previousStatus ?? '<missing>')] || 0) + 1;
    if (!LEGACY_STATUS_MAP[token] && !PROPERTY_STATUSES.includes(token)) {
      unknown.push({ id: document.id, status: previousStatus ?? null });
      continue;
    }
    const status = normalizePropertyStatus(previousStatus);
    if (previousStatus !== status) candidates.push({ document, previousStatus, status });
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    total: snapshot.size,
    currentStatusCounts: counts,
    updates: candidates.length,
    unknown
  }, null, 2));

  if (!apply || candidates.length === 0) return;
  for (let offset = 0; offset < candidates.length; offset += 400) {
    const batch = db.batch();
    for (const { document, previousStatus, status } of candidates.slice(offset, offset + 400)) {
      batch.update(document.ref, { status });
      batch.set(db.collection('propertyAuditLogs').doc(), {
        propertyId: document.id,
        action: 'property_status_normalized',
        performedBy: 'migration',
        performedAt: FieldValue.serverTimestamp(),
        previousStatus: previousStatus ?? null,
        newStatus: status
      });
    }
    await batch.commit();
  }
  console.log(`Updated ${candidates.length} properties.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
