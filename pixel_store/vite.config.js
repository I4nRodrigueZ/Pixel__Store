import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    fs: {
      strict: false
    }
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: './', // ¡CAMBIADO AQUÍ!
  optimizeDeps: {
    entries: ['index.html']
  }
})
