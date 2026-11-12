import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves api/chat.js during `vite dev` (on Vercel it runs as a serverless function).
const devApiPlugin = (mode) => ({
  name: 'dev-api-chat',
  configureServer(server) {
    const env = loadEnv(mode, process.cwd(), '');
    for (const [key, value] of Object.entries(env)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
    server.middlewares.use('/api/chat', async (req, res) => {
      try {
        const { default: handler } = await server.ssrLoadModule('/api/chat.js');
        await handler(req, res);
      } catch (error) {
        console.error('[dev-api] chat handler error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Chat handler crashed' }));
      }
    });
  },
});
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApiPlugin(mode)],
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
}))
