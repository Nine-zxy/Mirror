import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  const staticSite = mode === 'pages'
  const apiKey = staticSite ? undefined : env.GEMINI_API_KEY
  const proxy = {
    '/ws': { target: 'ws://127.0.0.1:3001', ws: true },
    '/logs': { target: 'http://127.0.0.1:3001' },
    ...(apiKey ? {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/gemini/, ''),
        headers: { 'x-goog-api-key': apiKey },
      },
    } : {}),
  }
  return {
    plugins: [react()],
    base: staticSite ? '/Mirror/' : '/',
    // Only a boolean reaches the browser, never the API key.
    define: {
      __ASIDE_AI_ENABLED__: JSON.stringify(Boolean(apiKey)),
      __ASIDE_STATIC_SITE__: JSON.stringify(staticSite),
      ...(staticSite ? { 'import.meta.env.VITE_ENABLE_LOGGING': JSON.stringify('false') } : {}),
    },
    build: { target: ['es2015', 'safari12'] },
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
  }
})
