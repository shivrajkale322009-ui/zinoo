const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { inspectProjectProjection, projectPublicProjection } = require('./publicProjectProjection');
const db = getFirestore(initializeApp({ credential: applicationDefault(), projectId: 'druvio' }), 'default');

async function main() {
  const targets = ['vwFZcYay5s0HkxCQavuS', '48ZSqEVZ4vu4z8Sxgci9'];
  for (const projectId of targets) {
    const item = await db.collection('projects').doc(projectId).get();
    const source = item.data();
    const expected = projectId === targets[0] ? { name: 'Mauli Park', price: 700000 } : { name: 'Veershree Enclave', price: 2000000 };
    if (source?.name !== expected.name || source.startingPrice !== expected.price || source.status !== 'active') throw new Error(`Source changed for ${projectId}; review before repair.`);
    const inspection = await inspectProjectProjection({ db, projectId });
    if (inspection.collisionResolution !== 'none' || inspection.locationCollision !== 'none' || inspection.proposedSlug !== inspection.publicSlug) throw new Error(`Identity review required for ${projectId}.`);
    if (process.argv.includes('--repair')) await projectPublicProjection({ db, projectId });
    const publicDoc = await db.collection('publicProjects').doc(item.id).get();
    const published = publicDoc.data() || {};
    if (process.argv.includes('--repair') && (published.projectName !== expected.name || published.startingPrice !== expected.price)) throw new Error(`Verification failed for ${projectId}.`);
    console.log(JSON.stringify({ id: item.id, source: { name: source.name, startingPrice: source.startingPrice }, public: { projectName: published.projectName, startingPrice: published.startingPrice, slug: published.slug, locationSlug: published.locationSlug }, inspection }));
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => db.terminate());
