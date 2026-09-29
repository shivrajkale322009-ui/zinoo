const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const { parseLeadCsv } = await import('../src/utils/leadCsv.js');
  const source = parseLeadCsv(fs.readFileSync(path.join(__dirname, '../zinoo-whatsapp-leads-import.csv'), 'utf8'), '2026-09-23');
  const byPhone = new Map(source.map(row => [row.phone, row]));
  initializeApp({ credential: applicationDefault(), projectId: 'druvio' });
  const db = getFirestore('default');
  const snapshot = await db.collection('leads').get();
  const changes = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const digits = String(data.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    const row = byPhone.get(`+91${digits}`);
    if (!row || data.source !== 'manual_import' || data.date !== '2026-09-23') continue;
    const patch = { date: row.date, importTime: row.importTime, sourceLot: row.sourceLot };
    if (data.name === `"${row.name}"` || data.name === '""') patch.name = row.name;
    changes.push({ id: doc.id, before: Object.fromEntries(Object.keys(patch).map(key => [key, data[key] ?? null])), patch, updateTime: doc.updateTime });
  }
  console.log(JSON.stringify({ matched: changes.length, mode: process.argv.includes('--apply') ? 'apply' : 'preview', examples: changes.slice(0,3).map(({before,patch})=>({beforeDate:before.date,beforeTime:before.importTime,date:patch.date,time:patch.importTime})) }));
  if (!process.argv.includes('--apply') || !changes.length) return;
  fs.writeFileSync(path.join(__dirname, `lead-timestamp-backup-${Date.now()}.json`), JSON.stringify(changes, null, 2));
  for (let i=0;i<changes.length;i+=400) {
    const batch = db.batch();
    changes.slice(i,i+400).forEach(change => batch.update(db.collection('leads').doc(change.id), change.patch, {lastUpdateTime: change.updateTime}));
    await batch.commit();
  }
  let verified=0;
  for (const change of changes) {
    const data=(await db.collection('leads').doc(change.id).get()).data();
    if (!Object.entries(change.patch).every(([key,value]) => data[key]===value)) throw new Error('Repair verification failed');
    verified++;
  }
  console.log(JSON.stringify({verified}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
