// ─────────────────────────────────────────────────────────────
//  SyncContext — React context for Aside multi-device sync
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useMemo } from 'react'
import useSync from './useSync'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const [mode, setMode] = useState('solo')  // 'solo' | 'together'
  const sync = useSync(mode)

  const value = useMemo(() => ({
    ...sync,
    setMode,
  }), [sync, setMode])

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSyncContext() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSyncContext must be used within SyncProvider')
  return ctx
}
