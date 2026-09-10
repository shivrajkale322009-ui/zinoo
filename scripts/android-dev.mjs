import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';
import process from 'node:process';

const args = process.argv.slice(2);
const isSyncOnly = args.includes('--sync-only');
const isNoOpen = args.includes('--no-open');

function getLocalIp() {
  if (process.env.CAP_IP) return process.env.CAP_IP;
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const devPort = process.env.CAP_PORT || '3000';
const devUrl = process.env.CAP_SERVER_URL || `http://${localIp}:${devPort}`;

console.log('====================================================');
console.log('🚀 Starting Capacitor Android Live Reload Dev Server');
console.log('====================================================');
console.log(`📍 Local Network IP:  ${localIp}`);
console.log(`🔗 Dev Server URL:   ${devUrl}`);
console.log('📱 Android Emulator: Connects via http://10.0.2.2:3000 or LAN IP');
console.log('📱 Physical Device:  Connects via LAN IP (same Wi-Fi)');
console.log('====================================================\n');

process.env.CAP_DEV = 'true';
process.env.CAP_SERVER_URL = devUrl;

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('[android:dev] Syncing Capacitor configuration with DEV server URL...');
const syncResult = spawnSync(npxCmd, ['cap', 'sync', 'android'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

if (syncResult.status !== 0) {
  console.error('[android:dev] Failed to sync Capacitor with Android.');
  process.exit(syncResult.status || 1);
}

if (isSyncOnly) {
  console.log('\n[android:dev] Sync completed successfully.');
  process.exit(0);
}

if (!isNoOpen) {
  console.log('\n[android:dev] Opening Android Studio...');
  spawn(npxCmd, ['cap', 'open', 'android'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
    detached: true
  });
}

console.log('\n[android:dev] Launching Vite development server (HMR active)...');
const viteProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

viteProcess.on('error', (err) => {
  console.error('[android:dev] Vite server error:', err);
  process.exit(1);
});
