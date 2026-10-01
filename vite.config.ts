/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// PVGIS does not send CORS headers, so the browser cannot call it directly.
// In development (and `vite preview`) requests to /api/pvgis are proxied to the JRC server.
const pvgisProxy = {
  '/api/pvgis': {
    target: 'https://re.jrc.ec.europa.eu',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/pvgis/, '/api'),
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173, proxy: pvgisProxy },
  preview: { port: 4173, proxy: pvgisProxy },
  worker: { format: 'es' },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          charts: ['recharts'],
          pdf: ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
