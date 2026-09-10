const { applicationDefault, getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { inspectProjectProjection, projectPublicProjection } = require('./publicProjectProjection');

const apply = process.argv.includes('--apply');
const deploymentConfirmed = process.env.ZINOO_PUBLIC_MIGRATION_CONFIRMED === 'corrected-trigger-deployed';
const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: process.env.GCLOUD_PROJECT || 'druvio' });
const db = getFirestore(app, 'default');

async function main() {
  if (apply && !deploymentConfirmed) {
    throw new Error('Apply refused. Deploy rules/indexes and the corrected projection trigger, complete the dry run/review, then set ZINOO_PUBLIC_MIGRATION_CONFIRMED=corrected-trigger-deployed for the controlled migration window.');
  }
  const [sourceSnapshot, publicSnapshot, registrySnapshot] = await Promise.all([
    db.collection('projects').get(),
    db.collection('publicProjects').get(),
    db.collection('publicProjectSlugs').get()
  ]);
  const projectIds = new Set(sourceSnapshot.docs.map((doc) => doc.id));
  publicSnapshot.docs.forEach((doc) => projectIds.add(doc.data().projectId || doc.id));
  registrySnapshot.docs.forEach((doc) => { if (doc.data().projectId) projectIds.add(doc.data().projectId); });
  const candidates = [...projectIds].sort().map((id) => ({ id }));
  console.log(`[public-project migration] ${apply ? 'APPLY' : 'DRY RUN'}: ${candidates.length} source/public identity record(s).`);
  if (apply) {
    await db.collection('publicLocations').doc('chakan').set({
      id: 'chakan', slug: 'chakan', name: 'Chakan', taluka: 'Khed', district: 'Pune', state: 'Maharashtra', country: 'India',
      description: 'Explore currently published plot projects around Chakan and nearby localities.',
      identityKey: 'pune|khed|chakan', curated: true
    }, { merge: true });
  }
  const locationOwners = new Map();
  let unsafe = false;
  for (const document of candidates) {
    const inspection = await inspectProjectProjection({ db, projectId: document.id });
    const priorLocation = inspection.locationSlug ? locationOwners.get(inspection.locationSlug) : null;
    const datasetLocationCollision = priorLocation && priorLocation.identityKey !== inspection.locationIdentityKey
      ? `${inspection.locationSlug}: ${priorLocation.projectId}/${priorLocation.identityKey} conflicts with ${document.id}/${inspection.locationIdentityKey}` : 'none';
    if (inspection.locationSlug && !priorLocation) locationOwners.set(inspection.locationSlug, { projectId: document.id, identityKey: inspection.locationIdentityKey });
    const collision = inspection.locationCollision !== 'none' ? inspection.locationCollision : datasetLocationCollision;
    if (collision !== 'none') unsafe = true;
    console.log([
      `Project: ${document.id}`,
      `Source slug: ${inspection.sourceSlug || '(none)'}`,
      `Public slug: ${inspection.publicSlug || '(none)'}`,
      `Proposed: ${inspection.proposedSlug || '(none)'}`,
      `Collision: ${inspection.collisionResolution || 'none'}`,
      `Location ID: ${inspection.locationId || '(none)'}`,
      `Location slug: ${inspection.locationSlug || '(none)'}`,
      `Location collision: ${collision || 'none'}`,
      `Registry owner: ${inspection.existingRegistryOwner || '(unclaimed)'}`,
      `Owned registry slugs: ${inspection.ownedRegistrySlugs?.join(', ') || '(none)'}`,
      `Action: ${inspection.intendedAction}`
    ].join('\n  '));
    if (!apply) continue;
    if (collision !== 'none') throw new Error(`Unsafe location collision detected: ${collision}`);
    const result = await projectPublicProjection({ db, projectId: document.id });
    console.log(`${document.id}: ${result.action}${result.slug ? ` (${result.slug})` : ''}`);
  }
  if (!apply && unsafe) {
    throw new Error('Dry run found location identity collisions. Resolve them before applying the migration.');
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error('[public-project migration] failed', error);
  process.exit(1);
});
