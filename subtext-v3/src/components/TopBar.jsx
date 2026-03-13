import { C } from '../theme'

export default function TopBar({ label, labelColor, progress, done, onNext, nextLabel }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#07070DF0', backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${C.bd}`, padding: '10px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.4em', color: C.mu, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>SUBTEXT</span>
        <span style={{ width: 1, height: 14, background: C.bd, display: 'inline-block' }} />
        <span style={{ fontSize: 11, color: labelColor || C.mu, fontFamily: 'DM Mono, monospace' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {progress && (
          <span style={{ fontSize: 11, color: done ? C.gr : C.mu, fontFamily: 'DM Mono, monospace' }}>{progress}</span>
        )}
        {done && onNext && (
          <button onClick={onNext} style={{ padding: '6px 20px', borderRadius: 20, border: 'none', background: C.gr, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            {nextLabel || '下一步 →'}
          </button>
        )}
      </div>
    </div>
  )
}
