import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Art-mis/',
  server: {
    port: 5173,
    proxy: {
      // Proxy WebSocket para o backend em modo dev (fora do Docker)
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    }
  }
})

