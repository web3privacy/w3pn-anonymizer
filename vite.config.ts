import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    headers: isolationHeaders,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7865',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: isolationHeaders,
  },
  envPrefix: ['VITE_', 'TAURI_'],
})
