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
  // 👇 esta parte es la más importante para rutas en React Router
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: '/',
  // 👇 esto redirige cualquier ruta a index.html (para React Router)
  optimizeDeps: {
    entries: ['index.html']
  }
})
