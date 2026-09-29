const encoder = new TextEncoder();

const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export async function verifyManifest(envelope, publicKey, cryptoApi = globalThis.crypto) {
  if (typeof envelope?.payload !== 'string' || envelope.payload.length > 16384 || typeof envelope.signature !== 'string') {
    throw new Error('Invalid update manifest');
  }
  const key = await cryptoApi.subtle.importKey('spki', fromBase64(publicKey.replace(/-----[^-]+-----|\s/g, '')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await cryptoApi.subtle.verify('RSASSA-PKCS1-v1_5', key, fromBase64(envelope.signature), encoder.encode(envelope.payload))) {
    throw new Error('Update signature did not match');
  }
  return JSON.parse(envelope.payload);
}

export async function rolloutBucket(deviceId, cryptoApi = globalThis.crypto) {
  const hash = await cryptoApi.subtle.digest('SHA-256', encoder.encode(`zinoo-live-updates:${deviceId}`));
  return new DataView(hash).getUint32(0) % 10000;
}

export function isEligibleRelease(manifest, { nativeBuild, runtime, bucket, now = Date.now(), bundleBaseUrl }) {
  if (manifest?.schema !== 1 || manifest.enabled !== true || !Number.isSafeInteger(manifest.revision)) return false;
  if (String(manifest.nativeBuild) !== String(nativeBuild) || manifest.runtime !== runtime) return false;
  if (!Number.isFinite(manifest.expiresAt) || manifest.expiresAt <= now) return false;
  if (!Number.isFinite(manifest.rolloutPercent) || manifest.rolloutPercent < 0 || manifest.rolloutPercent > 100) return false;
  if (!Number.isInteger(bucket) || bucket < 0 || bucket >= manifest.rolloutPercent * 100) return false;
  const release = manifest.release;
  if (!release || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(release.version)) return false;
  if (!/^[a-f0-9]{64}$/.test(release.checksum)) return false;
  try {
    const url = new URL(release.url);
    const base = new URL(bundleBaseUrl);
    return url.protocol === 'https:' && url.origin === base.origin && url.pathname.startsWith(base.pathname)
      && !url.username && !url.password && !url.search && !url.hash && url.pathname.endsWith('.zip');
  } catch { return false; }
}
