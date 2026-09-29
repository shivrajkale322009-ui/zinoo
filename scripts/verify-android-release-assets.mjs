import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const androidPublicDir = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'public');
const pluginRegistryPath = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');
const androidBuildFile = path.join(root, 'android', 'app', 'build.gradle');
const allowedCapacitorFiles = new Set(['cordova.js', 'cordova_plugins.js']);
const failures = [];

const fail = (message) => failures.push(message);

const listFiles = (directory, prefix = '') => {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute, relative) : [relative];
  }).sort();
};

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

if (!existsSync(path.join(distDir, 'index.html'))) {
  fail('dist/index.html is missing; the web build did not complete.');
}
if (!existsSync(path.join(androidPublicDir, 'index.html'))) {
  fail('android/app/src/main/assets/public/index.html is missing; Capacitor did not copy the web build.');
}

const distFiles = listFiles(distDir);
const androidFiles = listFiles(androidPublicDir);
const distSet = new Set(distFiles);

for (const relative of distFiles) {
  const androidFile = path.join(androidPublicDir, ...relative.split('/'));
  if (!existsSync(androidFile)) {
    fail(`Android assets are missing dist file: ${relative}`);
    continue;
  }
  if (sha256(path.join(distDir, ...relative.split('/'))) !== sha256(androidFile)) {
    fail(`Android asset differs from dist: ${relative}`);
  }
}

for (const relative of androidFiles) {
  if (!distSet.has(relative) && !allowedCapacitorFiles.has(relative)) {
    fail(`Unexpected stale Android web asset: ${relative}`);
  }
}

const loginBundles = androidFiles.filter((file) => /^assets\/LoginScreen-[^/]+\.js$/.test(file));
if (loginBundles.length !== 1) {
  fail(`Expected exactly one current LoginScreen bundle, found ${loginBundles.length}: ${loginBundles.join(', ') || 'none'}`);
}
const obsoleteLandingBundles = androidFiles.filter((file) => /^assets\/PublicLandingPage-[^/]+\.js$/.test(file));
if (obsoleteLandingBundles.length) {
  fail(`Obsolete landing-page bundles are present: ${obsoleteLandingBundles.join(', ')}`);
}

const searchableFiles = androidFiles.filter((file) => /\.(?:html|js|json)$/i.test(file));
const searchableText = searchableFiles.map((relative) => {
  const file = path.join(androidPublicDir, ...relative.split('/'));
  return statSync(file).size <= 5_000_000 ? readFileSync(file, 'utf8') : '';
}).join('\n');

if (!/authDomain\s*:\s*["']druvio\.firebaseapp\.com["']/.test(searchableText)) {
  fail('Expected Firebase authDomain druvio.firebaseapp.com was not found in Android web assets.');
}
if (/authDomain\s*:\s*["']zinoo\.in["']/.test(searchableText)) {
  fail('Obsolete Firebase authDomain zinoo.in is present in Android web assets.');
}
if (searchableText.includes('This domain is not authorized for Zinoo mobile sign-in.')) {
  fail('Obsolete mobile sign-in domain error message is present in Android web assets.');
}
if (!searchableText.includes('GUEST_BUYER_APP') || !searchableText.includes('zinooPendingAuthenticatedAction')) {
  fail('Guest-entry and post-login action-resume markers were not found in Android web assets.');
}

const androidBuildText = existsSync(androidBuildFile) ? readFileSync(androidBuildFile, 'utf8') : '';
const versionCode = Number(androidBuildText.match(/versionCode\s+(\d+)/)?.[1] || 0);
const versionName = androidBuildText.match(/versionName\s+["']([^"']+)["']/)?.[1] || '';
const runtimePath = path.join(root, 'updates', 'android-runtime.json');
const runtime = existsSync(runtimePath) ? JSON.parse(readFileSync(runtimePath, 'utf8')) : {};
if (String(versionCode) !== runtime.nativeBuild || versionName !== runtime.versionName) {
  fail(`Android version ${versionName} (${versionCode}) differs from the captured update runtime.`);
}

if (!existsSync(pluginRegistryPath)) {
  fail('Capacitor plugin registry is missing: android/app/src/main/assets/capacitor.plugins.json');
} else {
  try {
    const plugins = JSON.parse(readFileSync(pluginRegistryPath, 'utf8'));
    const firebaseAuthRegistered = Array.isArray(plugins) && plugins.some((plugin) =>
      plugin?.pkg === '@capacitor-firebase/authentication'
      && plugin?.classpath === 'io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin'
    );
    if (!firebaseAuthRegistered) fail('FirebaseAuthentication plugin is not registered in capacitor.plugins.json.');
    for (const pkg of ['@capgo/capacitor-updater', '@capawesome/capacitor-app-update']) {
      if (!plugins.some((plugin) => plugin.pkg === pkg)) fail(`Update plugin is not registered: ${pkg}`);
    }
  } catch (error) {
    fail(`Could not parse capacitor.plugins.json: ${error.message}`);
  }
}

const nativeConfigPath = path.join(root, 'android/app/src/main/assets/capacitor.config.json');
if (existsSync(nativeConfigPath)) {
  const nativeConfig = JSON.parse(readFileSync(nativeConfigPath, 'utf8'));
  if (nativeConfig.server?.url) fail('Release configuration must not load a development server.');
  const updater = nativeConfig.plugins?.CapacitorUpdater;
  if (updater?.autoUpdate !== false || updater?.directUpdate !== false || updater?.autoDeletePrevious !== false
      || updater?.resetWhenUpdate !== true || !(updater?.appReadyTimeout > 0) || updater?.statsUrl !== '') {
    fail('Native live-update safeguards are missing from the copied configuration.');
  }
}

if (failures.length) {
  console.error('\nANDROID ASSET VERIFICATION FAILED');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Verified ${distFiles.length} web build files against Android assets.`);
console.log(`Current LoginScreen bundle: ${loginBundles[0]}`);
console.log(`Android release version: ${versionName} (${versionCode})`);
console.log('Guest entry flow: bundled and verified');
console.log('Firebase authDomain: druvio.firebaseapp.com');
console.log('FirebaseAuthentication plugin: registered');
console.log('ANDROID ASSET VERIFICATION SUCCESSFUL');
