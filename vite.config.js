import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const BACKEND_TARGET =
    env.VITE_DEV_PROXY_TARGET ||
    (env.VITE_API_BASE_URL ? env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : '') ||
    'https://api.gateuae.com';

  return {
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
  };
});
