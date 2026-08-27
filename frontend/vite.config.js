import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Art-mis/',
  server: {
    port: 5173,
    // proxy se fosse rodar backend remoto em dev
  }
})
