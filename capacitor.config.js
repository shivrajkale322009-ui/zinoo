import os from 'node:os';

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

const isDev = process.env.CAP_DEV === 'true' || Boolean(process.env.CAP_SERVER_URL);
const devPort = process.env.CAP_PORT || '3000';
const devUrl = process.env.CAP_SERVER_URL || `http://${getLocalIp()}:${devPort}`;

const config = {
  appId: 'com.druvio.app',
  appName: 'Zinoo',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnVirtualKeyboardShown: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: [
        'google.com',
        'phone'
      ]
    }
  }
};

if (isDev) {
  config.server = {
    url: devUrl,
    cleartext: true
  };
  console.log(`[Capacitor Config] DEV mode active. Server URL: ${devUrl}`);
} else {
  console.log('[Capacitor Config] PROD mode active. Bundled dist assets will be used.');
}

export const appId = config.appId;
export const appName = config.appName;
export const webDir = config.webDir;
export const plugins = config.plugins;
export const server = config.server;

export default config;
