import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import androidRuntime from './updates/android-runtime.json';

export default defineConfig({
  plugins: [react(), {
    name: 'zinoo-native-runtime',
    // Vite blocks .pem URLs in development. Expose only this public key as a
    // module, keeping the default protection for private keys and other files.
    resolveId(id) {
      if (id === 'virtual:zinoo-update-public-key') return '\0zinoo-update-public-key';
    },
    load(id) {
      if (id !== '\0zinoo-update-public-key') return;
      const publicKey = readFileSync(new URL('./updates/public-key.pem', import.meta.url), 'utf8');
      if (!publicKey.trim().startsWith('-----BEGIN PUBLIC KEY-----')) {
        throw new Error('Update verification requires a public key.');
      }
      return `export default ${JSON.stringify(publicKey)};`;
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'zinoo-runtime.json', source: JSON.stringify(androidRuntime) });
    }
  }],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('leaflet') || id.includes('googlemaps')) {
              return 'vendor-maps';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-misc';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
