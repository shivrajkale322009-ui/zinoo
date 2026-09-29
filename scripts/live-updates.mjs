import { createHash, generateKeyPairSync, sign, verify } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync, copyFileSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const root = fileURLToPath(new URL('../', import.meta.url));
const at = (...parts) => path.join(root, ...parts);
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, data) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`); };
const sha = (value) => createHash('sha256').update(value).digest('hex');
const config = readJson(at('updates/config.json'));
const args = process.argv.slice(2);
const option = (name) => { const index = args.indexOf(`--${name}`); return index < 0 ? undefined : args[index + 1]; };
const privateKeyPath = process.env.ZINOO_UPDATE_SIGNING_KEY || at('updates/private/signing-key.pem');
const publicKeyPath = at('updates/public-key.pem');
const manifestPath = at('updates/android.json');

function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed: ${relative}`);
    return entry.isDirectory() ? files(path.join(directory, entry.name), relative) : [relative];
  }).sort();
}

function nativeRuntime() {
  const gradle = readFileSync(at('android/app/build.gradle'), 'utf8');
  const nativeBuild = gradle.match(/versionCode\s+(\d+)/)?.[1];
  const versionName = gradle.match(/versionName\s+"([^"]+)"/)?.[1];
  if (!nativeBuild || !versionName) throw new Error('Android release version missing');
  const inputs = ['capacitor.config.js', 'android/app/build.gradle', 'android/app/proguard-rules.pro',
    'android/build.gradle', 'android/variables.gradle', 'android/gradle.properties', 'android/settings.gradle',
    'android/gradle/wrapper/gradle-wrapper.properties', 'updates/public-key.pem', 'updates/config.json',
    ...files(at('android/app/src/main')).filter((name) => !name.startsWith('assets/')).map((name) => `android/app/src/main/${name}`),
    ...files(at('patches')).map((name) => `patches/${name}`)];
  const lock = readJson(at('package-lock.json'));
  const nativePackages = Object.entries(lock.packages || {}).filter(([name]) => /^node_modules\/@(?:capacitor|capacitor-firebase|capgo|capawesome)\//.test(name));
  const hash = createHash('sha256');
  for (const name of [...new Set(inputs)].sort()) hash.update(name).update('\0').update(readFileSync(at(name), 'utf8').replace(/\r\n/g, '\n')).update('\0');
  hash.update(JSON.stringify(nativePackages.map(([name, pkg]) => [name, pkg.version, pkg.integrity])));
  return { nativeBuild, versionName, fingerprint: hash.digest('hex') };
}

function signed(payload) {
  if (!existsSync(privateKeyPath)) throw new Error(`Signing key missing: ${privateKeyPath}`);
  const text = JSON.stringify(payload);
  const signature = sign('RSA-SHA256', Buffer.from(text), readFileSync(privateKeyPath)).toString('base64');
  if (!verify('RSA-SHA256', Buffer.from(text), readFileSync(publicKeyPath), Buffer.from(signature, 'base64'))) {
    throw new Error('Signing key does not match the public key installed in Zinoo');
  }
  return { payload: text, signature };
}

function currentManifest() {
  const envelope = readJson(manifestPath);
  if (!verify('RSA-SHA256', Buffer.from(envelope.payload), readFileSync(publicKeyPath), Buffer.from(envelope.signature, 'base64'))) {
    throw new Error('Existing manifest signature is invalid');
  }
  return JSON.parse(envelope.payload);
}

function publishManifest(payload) {
  const revision = Math.max(Date.now(), existsSync(manifestPath) ? currentManifest().revision + 1 : 1);
  writeJson(manifestPath, signed({ ...payload, revision, expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000 }));
}

function checkedRuntime() {
  const runtime = readJson(at('updates/android-runtime.json'));
  if (JSON.stringify(runtime) !== JSON.stringify(nativeRuntime())) {
    throw new Error('Native code/configuration changed. Ship a new Android version and capture a new runtime; do not publish this as a web-only update.');
  }
  return runtime;
}

const command = args[0];
if (command === 'init') {
  if (!existsSync(publicKeyPath)) {
    if (existsSync(privateKeyPath)) throw new Error('Private key exists without public key. Recover the matching public key; do not overwrite.');
    const keys = generateKeyPairSync('rsa', { modulusLength: 3072,
      publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    mkdirSync(path.dirname(privateKeyPath), { recursive: true });
    writeFileSync(privateKeyPath, keys.privateKey, { flag: 'wx', mode: 0o600 });
    writeFileSync(publicKeyPath, keys.publicKey, { flag: 'wx' });
  }
  if (!existsSync(manifestPath)) publishManifest({ schema: 1, enabled: false, rolloutPercent: 0 });
  console.log('Signing initialized. Back up updates/private/signing-key.pem securely; never upload it.');
} else if (command === 'runtime') {
  const runtime = nativeRuntime();
  if (existsSync(at('updates/android-runtime.json'))) {
    const old = readJson(at('updates/android-runtime.json'));
    if (old.fingerprint !== runtime.fingerprint && Number(runtime.nativeBuild) <= Number(old.nativeBuild)) {
      throw new Error('Increase Android versionCode before capturing a changed native runtime.');
    }
  }
  writeJson(at('updates/android-runtime.json'), runtime);
  console.log(`Captured Android ${runtime.versionName} (${runtime.nativeBuild}) compatibility.`);
} else if (command === 'release') {
  const runtime = checkedRuntime();
  const builtRuntime = readJson(at('dist/zinoo-runtime.json'));
  if (JSON.stringify(runtime) !== JSON.stringify(builtRuntime)) throw new Error('Rebuild the web app for this native runtime first.');
  const version = option('version');
  if (!version || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(version)) throw new Error('Provide a unique --version, e.g. 1.0.6-live.1');
  const releaseDir = at('updates/releases');
  if (existsSync(path.join(releaseDir, `${version}.json`))) throw new Error('Release versions are immutable. Use a new version.');
  const entries = {};
  for (const name of files(at('dist'))) {
    if (name.startsWith('app-updates/') || name === 'sw.js') continue;
    if (/\.(pem|key|jks|map)$/i.test(name) || name.startsWith('.')) throw new Error(`Unexpected private/debug asset: ${name}`);
    entries[name] = new Uint8Array(readFileSync(at('dist', name)));
  }
  if (!entries['index.html']) throw new Error('Missing built index.html');
  const zip = zipSync(entries, { level: 6 });
  const checksum = sha(zip);
  const archive = `${version}-${checksum.slice(0, 16)}.zip`;
  mkdirSync(path.join(releaseDir, 'bundles'), { recursive: true });
  writeFileSync(path.join(releaseDir, 'bundles', archive), zip, { flag: 'wx' });
  const release = { version, checksum, url: new URL(archive, config.bundleBaseUrl).href };
  const payload = { schema: 1, enabled: true, nativeBuild: runtime.nativeBuild, runtime: runtime.fingerprint,
    rolloutPercent: config.defaultRolloutPercent, release };
  writeJson(path.join(releaseDir, `${version}.json`), payload);
  publishManifest(payload);
  console.log(`Prepared ${version} for ${payload.rolloutPercent}% of Android ${runtime.versionName} installs. Not deployed.`);
} else if (command === 'rollout' || command === 'pause' || command === 'rollback') {
  const payload = command === 'rollback'
    ? (() => {
      const version = option('version');
      if (!version || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(version)) throw new Error('Provide --version for a retained release');
      return readJson(at('updates/releases', `${version}.json`));
    })() : currentManifest();
  const percent = command === 'pause' ? 0 : Number(option('percent') ?? (command === 'rollback' ? 100 : NaN));
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error('--percent must be between 0 and 100');
  if (command !== 'pause' && !payload.release) throw new Error('Prepare a release first');
  publishManifest({ ...payload, rolloutPercent: percent, enabled: command !== 'pause' });
  console.log(`Prepared ${command}: ${percent}%. Not deployed.`);
} else if (command === 'stage-hosting') {
  const payload = currentManifest();
  if (!existsSync(at('dist/index.html'))) throw new Error('Build the website before staging hosting files.');
  if (payload.release) {
    const archive = path.basename(new URL(payload.release.url).pathname);
    const archivePath = at('updates/releases/bundles', archive);
    if (!existsSync(archivePath) || sha(readFileSync(archivePath)) !== payload.release.checksum) {
      throw new Error('Release archive missing or altered. Restore updates/releases before deploying hosting.');
    }
  }
  mkdirSync(at('dist/app-updates'), { recursive: true });
  copyFileSync(manifestPath, at('dist/app-updates/android.json'));
  if (existsSync(at('updates/releases/bundles'))) cpSync(at('updates/releases/bundles'), at('dist/app-updates/bundles'), { recursive: true });
  console.log('Staged signed update manifest and retained bundles for Firebase Hosting.');
} else {
  throw new Error('Use init, runtime, release --version NAME, rollout --percent N, pause, rollback --version NAME, or stage-hosting');
}
