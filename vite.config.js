import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Universal Vite Configuration for Vercel & Cloudflare
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2020',
    cssTarget: 'safari14',
    sourcemap: false
  }
});