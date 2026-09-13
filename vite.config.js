import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, cached separately
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Framer Motion is large — isolate so it can be cached
          'vendor-framer': ['framer-motion'],
          // Email + YouTube — loaded lazily anyway
          'vendor-libs': ['@emailjs/browser', 'react-youtube', 'lenis'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
})