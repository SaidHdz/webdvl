import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // Bind to 0.0.0.0 so other devices on the LAN (and tunnels) can reach it.
    host: true,
    port: 5173,
    strictPort: false,
    // Accept any Host header (needed for tunnel domains like *.ngrok-free.app).
    allowedHosts: true,
    // Proxy API calls to the Express server so the frontend can use relative
    // "/api/..." paths. The proxy runs on the host, so exposing only the Vite
    // port is enough; the backend stays internal.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
