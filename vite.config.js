import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const BACKEND_TARGET = process.env.VITE_DEV_PROXY_TARGET || 'https://api.gateuae.com';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/llms.txt': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/llms-full.txt': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/aeo.json': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/geo.json': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
