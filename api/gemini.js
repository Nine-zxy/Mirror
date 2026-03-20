// ─────────────────────────────────────────────────────────────
//  Vercel Serverless Function — Gemini API Proxy
//
//  Forwards requests from /api/gemini/* to the Google
//  Generative Language API, injecting the API key server-side
//  so it never reaches the client bundle.
//
//  Env var required: GEMINI_API_KEY
// ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' })
  }

  // Extract the path after /api/gemini/
  // req.url will be something like /api/gemini/v1beta/models/gemini-2.5-flash:generateContent
  const geminiPath = req.url.replace(/^\/api\/gemini\/?/, '')

  if (!geminiPath) {
    return res.status(400).json({ error: 'Missing API path. Expected /api/gemini/<path>' })
  }

  const targetUrl = `https://generativelanguage.googleapis.com/${geminiPath}${
    geminiPath.includes('?') ? '&' : '?'
  }key=${apiKey}`

  try {
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    const data = await upstream.text()

    // Forward status and content-type from upstream
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.send(data)
  } catch (err) {
    console.error('[Gemini proxy] Upstream error:', err.message)
    return res.status(502).json({ error: 'Failed to reach Gemini API', detail: err.message })
  }
}
