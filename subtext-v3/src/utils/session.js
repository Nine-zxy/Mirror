// ─────────────────────────────────────────────────────────────────
//  session.js  —  Unified session layer (Firebase or localStorage)
//
//  If VITE_FIREBASE_API_KEY is set → uses Firestore (multi-device)
//  Otherwise                       → uses localStorage (demo mode,
//                                    both roles on same browser)
//
//  Session document shape:
//  {
//    code:       string,
//    script:     ScriptLine[],
//    personas:   { A: PersonaInfo, B: PersonaInfo },
//    createdAt:  number,
//    phase:      string,          // shared phase gate
//    ready:      { A: { annotate, selfcorrect }, B: { annotate, selfcorrect } },
//    annotations:{ A: { [id]: {val,note} }, B: { [id]: {val,note} } },
//    corrections:{ A: { [id]: {status,text} }, B: { [id]: {status,text} } },
//    negotiate:  { [id]: { aReply, bReply, insight } },
//  }
// ─────────────────────────────────────────────────────────────────

const USE_FIREBASE = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)

// ── lazy-init Firebase ─────────────────────────────────────────
let _db = null
async function db() {
  if (_db) return _db
  const { initializeApp, getApps } = await import('firebase/app')
  const { getFirestore }           = await import('firebase/firestore')
  const cfg = {
    apiKey:     import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  }
  const app = getApps().length ? getApps()[0] : initializeApp(cfg)
  _db = getFirestore(app)
  return _db
}

// ── Helpers ────────────────────────────────────────────────────
export function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function emptySession(code, script, personas) {
  return {
    code,
    script,
    personas,
    createdAt: Date.now(),
    phase: 'ready',
    // Presence: who has arrived
    joined:    { A: true, B: false },
    // Watch-time emoji tags (blind — each role's tags hidden until Compare)
    watchTags: { A: {}, B: {} },
    // Post-blind-phase readiness
    ready: {
      A: { annotate: false, selfcorrect: false },
      B: { annotate: false, selfcorrect: false },
    },
    annotations: { A: {}, B: {} },
    corrections:  { A: {}, B: {} },
    negotiate:    {},
  }
}

// ── localStorage helpers ───────────────────────────────────────
const lsKey = code => `subtext_v3_${code}`

function lsGet(code) {
  try { return JSON.parse(localStorage.getItem(lsKey(code))) } catch { return null }
}
function lsSet(code, data) {
  localStorage.setItem(lsKey(code), JSON.stringify(data))
  // Instantly notify other tabs — no need to wait for the 1.5s poll
  try { new BroadcastChannel(`subtext_v3_${code}`).postMessage('update') } catch {}
}

// ── Public API ─────────────────────────────────────────────────

/** Create session (called by role A, or in demo mode) */
export async function createSession(script, personas) {
  const code = generateCode()
  const data = emptySession(code, script, personas)

  if (USE_FIREBASE) {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(await db(), 'sessions', code), data)
  } else {
    lsSet(code, data)
  }
  return code
}

/** Fetch full session once */
export async function getSession(code) {
  if (USE_FIREBASE) {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(await db(), 'sessions', code))
    return snap.exists() ? snap.data() : null
  }
  return lsGet(code)
}

/** Subscribe to live session changes; returns unsubscribe fn */
export function subscribeSession(code, callback) {
  if (USE_FIREBASE) {
    let unsub
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      db().then(firestore => {
        unsub = onSnapshot(doc(firestore, 'sessions', code), snap => {
          if (snap.exists()) callback(snap.data())
        })
      })
    })
    return () => unsub?.()
  } else {
    // localStorage mode: BroadcastChannel for instant cross-tab sync + polling fallback
    let channel
    try {
      channel = new BroadcastChannel(`subtext_v3_${code}`)
      channel.onmessage = () => { const d = lsGet(code); if (d) callback(d) }
    } catch {}
    // Also poll every 1.5s as fallback (e.g. if BroadcastChannel not supported)
    const id = setInterval(() => { const d = lsGet(code); if (d) callback(d) }, 1500)
    return () => { channel?.close(); clearInterval(id) }
  }
}

/** Generic deep-merge update */
async function updateSession(code, updates) {
  if (USE_FIREBASE) {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(await db(), 'sessions', code), flattenObj(updates))
  } else {
    const current = lsGet(code) || {}
    lsSet(code, deepMerge(current, updates))
  }
}

/** Save all annotations for a role */
export async function saveAnnotations(code, role, annotations) {
  await updateSession(code, { annotations: { [role]: annotations } })
}

/** Mark annotation phase done; returns updated ready state */
export async function markAnnotateDone(code, role) {
  await updateSession(code, { ready: { [role]: { annotate: true } } })
}

/** Save all corrections for a role */
export async function saveCorrections(code, role, corrections) {
  await updateSession(code, { corrections: { [role]: corrections } })
}

/** Mark self-correct phase done */
export async function markSelfCorrectDone(code, role) {
  await updateSession(code, { ready: { [role]: { selfcorrect: true } } })
}

/** Update a single negotiate beat */
export async function saveNegotiateBeat(code, beatId, data) {
  await updateSession(code, { negotiate: { [beatId]: data } })
}

/** Update shared phase marker */
export async function setSharedPhase(code, phase) {
  await updateSession(code, { phase })
}

/** Mark a role as having arrived in the lobby */
export async function joinSession(code, role) {
  await updateSession(code, { joined: { [role]: true } })
}

/** Save watch-time emoji tags for a role (called when leaving WatchPhase) */
export async function saveWatchTags(code, role, tags) {
  await updateSession(code, { watchTags: { [role]: tags } })
}

// ── Utilities ──────────────────────────────────────────────────

/** Flatten nested object to dot-notation keys (for Firestore updateDoc) */
function flattenObj(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flattenObj(v, key, out)
    } else {
      out[key] = v
    }
  }
  return out
}

/** Deep merge (for localStorage mode) */
function deepMerge(target, source) {
  const out = { ...target }
  for (const [k, v] of Object.entries(source)) {
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && typeof target[k] === 'object') {
      out[k] = deepMerge(target[k], v)
    } else {
      out[k] = v
    }
  }
  return out
}

export { USE_FIREBASE }
