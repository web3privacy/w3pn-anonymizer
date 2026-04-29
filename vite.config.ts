import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7865',
        changeOrigin: true,
        // Forward the request as-is (path already starts with /api)
      },
    },
  },
})
