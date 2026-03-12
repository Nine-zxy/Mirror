import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────
//  Vite config with optional Anthropic API proxy
//
//  To enable AI scenario generation:
//    1. Create .env.local in the project root
//    2. Add:  VITE_ANTHROPIC_API_KEY=sk-ant-...
//    3. The proxy forwards /api/claude → api.anthropic.com
//       with the API key injected server-side (never in bundle)
// ─────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: env.VITE_ANTHROPIC_API_KEY
        ? {
            '/api/claude': {
              target:       'https://api.anthropic.com',
              changeOrigin: true,
              rewrite:      path => path.replace(/^\/api\/claude/, ''),
              headers: {
                'x-api-key':         env.VITE_ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type':      'application/json',
              },
            },
          }
        : {},
    },
  }
})
