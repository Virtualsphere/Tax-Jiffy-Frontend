import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Loaded with an empty prefix so API_PROXY_TARGET stays server-side only and is never
  // inlined into the client bundle the way a VITE_-prefixed var would be.
  const dotenv = loadEnv(mode, process.cwd(), '');
  const proxyTarget = dotenv.API_PROXY_TARGET ?? 'https://api.taxjiffy.com';
  const wsProxyTarget = proxyTarget.replace(/^http/, 'ws');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          timeout: 600000,
          proxyTimeout: 600000,
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: wsProxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      sourcemap: !process.env.NETLIFY,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  };
});
