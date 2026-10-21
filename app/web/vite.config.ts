import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/study/',
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/study/api': {
        target: process.env.STUDY_API_ORIGIN ?? 'http://127.0.0.1:4173',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
