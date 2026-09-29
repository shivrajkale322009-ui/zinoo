// Restores clean inline filenames for existing Firebase Storage PDFs.
// Run without --apply to inspect changes; add --apply to update metadata.
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

const app = initializeApp({
  credential: applicationDefault(),
  projectId: 'druvio',
  storageBucket: 'druvio.firebasestorage.app'
});
const bucket = getStorage(app).bucket();
const apply = process.argv.includes('--apply');

const displayNameFromPath = (path) => {
  const name = path.split('/').pop() || 'document.pdf';
  // Storage objects use an asset id prefix so they cannot collide. It should
  // never be shown to a buyer in the browser's native PDF viewer.
  return name.replace(/^[0-9a-f]{8}-[0-9a-f-]{8,}-/i, '') || 'document.pdf';
};

async function main() {
  const [files] = await bucket.getFiles({ prefix: 'project-documents/' });
  let changed = 0;
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.pdf')) continue;
    const [metadata] = await file.getMetadata();
    const filename = displayNameFromPath(file.name);
    // Some legacy uploads contain only non-Latin characters in their object
    // name. Do not replace those with the unhelpful fallback ".pdf".
    if (filename.replace(/[^a-zA-Z0-9]/g, '') === 'pdf') continue;
    const contentDisposition = `inline; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, '-')}"`;
    if (metadata.contentDisposition === contentDisposition) continue;
    changed += 1;
    console.log(JSON.stringify({ path: file.name, contentDisposition }));
    if (apply) await file.setMetadata({ contentDisposition });
  }
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', changed }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
