import { readFile, writeFile, readdir } from 'node:fs/promises';

// Capacitor regenerates this module during update/sync. Only remove its
// default repository when no local AAR dependency could require it.
const root = new URL('../android/capacitor-cordova-android-plugins/', import.meta.url);
for (const directory of ['src/main/libs/', 'libs/']) {
  const files = await readdir(new URL(directory, root)).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  if (files.some((name) => name.endsWith('.aar'))) {
    console.log('Keeping local Android repository: AAR libraries are present.');
    process.exit(0);
  }
}
const file = new URL('build.gradle', root);
const source = await readFile(file, 'utf8').catch((error) => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
if (source !== null) {
  const updated = source.replace(/\s*flatDir\s*\{\s*dirs 'src\/main\/libs', 'libs'\s*\}/g, '');
  if (updated !== source) await writeFile(file, updated);
}
