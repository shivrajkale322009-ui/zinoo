const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { publicLayoutPolygon } = require('./publicProjectProjection');
const db = getFirestore(initializeApp({ credential: applicationDefault(), projectId: 'druvio' }), 'default');
const apply = process.argv.includes('--apply');

async function main() {
  const publicDocs = await db.collection('publicProjects').select('projectName', 'publicVisibility', 'status', 'layoutPolygon').get();
  let changed = 0;
  for (const item of publicDocs.docs) {
    const result = await db.runTransaction(async (tx) => {
      const sourceRef = db.collection('projects').doc(item.id);
      const [sourceDoc, publicDoc] = await Promise.all([tx.get(sourceRef), tx.get(item.ref)]);
      const source = sourceDoc.data();
      const published = publicDoc.data();
      if (!source || !published || source.status !== 'active' || published.status !== 'active' || published.publicVisibility !== true) return null;
      const boundary = publicLayoutPolygon(source.layoutPolygon);
      if (JSON.stringify(boundary) === JSON.stringify(published.layoutPolygon ?? null)) return null;
      if (apply) tx.update(item.ref, { layoutPolygon: boundary });
      return { id: item.id, name: source.name, points: boundary?.points.length || 0 };
    });
    if (result) { changed += 1; console.log(JSON.stringify(result)); }
  }
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', changed }));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => db.terminate());
