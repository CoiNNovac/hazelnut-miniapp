import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 6092,
    host: true,
    // Allow requests from Cloudflare tunnel and ngrok
    allowedHosts: [
      'vcr-despite-forest-hampshire.trycloudflare.com',
      '.trycloudflare.com',
      '.ngrok.app',
      '.ngrok.io',
      '.starkpump.meme',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
