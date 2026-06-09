import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
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
  },
  preview: {
    headers: isolationHeaders,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor'
          }
          if (id.includes('node_modules/onnxruntime-web')) {
            return 'onnx'
          }
          if (id.includes('node_modules/jszip')) {
            return 'zip'
          }
        },
      },
    },
  },
})
