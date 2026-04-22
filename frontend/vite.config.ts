import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }

          if (id.includes('react-router') || id.includes('@remix-run')) {
            return 'router'
          }

          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms'
          }

          if (id.includes('axios')) {
            return 'http'
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
