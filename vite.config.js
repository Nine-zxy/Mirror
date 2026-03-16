import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────
//  Vite config with Gemini API proxy
//
//  To enable AI scenario generation:
//    1. Create .env.local in the project root
//    2. Add:  VITE_GEMINI_API_KEY=AIzaSy...
//    3. The proxy forwards /api/gemini → generativelanguage.googleapis.com
//       with the API key injected server-side (never in bundle)
// ─────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const geminiKey = env.VITE_GEMINI_API_KEY

  return {
    plugins: [react()],
    server: {
      proxy: geminiKey
        ? {
            '/api/gemini': {
              target:       'https://generativelanguage.googleapis.com',
              changeOrigin: true,
              rewrite:      (path) => {
                const rewritten = path.replace(/^\/api\/gemini/, '')
                return rewritten + (rewritten.includes('?') ? '&' : '?') + `key=${geminiKey}`
              },
            },
          }
        : {},
    },
  }
})
