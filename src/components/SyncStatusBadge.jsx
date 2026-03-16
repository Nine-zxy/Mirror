import { useSyncContext } from '../sync/SyncContext'

// ─────────────────────────────────────────────────────────────
//  SyncStatusBadge — Small header indicator for Together mode
// ─────────────────────────────────────────────────────────────

export default function SyncStatusBadge() {
  const sync = useSyncContext()
  if (sync.mode !== 'together') return null

  const color = sync.partnerConnected ? '#60c880' : '#e87a7a'

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded"
      style={{ background: `${color}0e`, border: `1px solid ${color}22` }}>
      <div className="w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
      <span className="font-mono text-[7px] tracking-wider" style={{ color: `${color}cc` }}>
        {sync.partnerConnected ? '已同步' : '断开'}
      </span>
      {sync.roomCode && (
        <span className="font-mono text-[7px] text-white/20 ml-0.5">
          {sync.roomCode}
        </span>
      )}
    </div>
  )
}
