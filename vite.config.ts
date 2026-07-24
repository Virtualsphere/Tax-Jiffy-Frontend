import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
        target: 'https://api.taxjiffy.com',
        changeOrigin: true,
        secure: false,
        timeout: 600000,
        proxyTimeout: 600000,
      },
      '/uploads': {
        target: 'https://api.taxjiffy.com',
        changeOrigin: true,
        secure: false,
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
});
