export default function IntroScreen({ scenario, onBegin }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black overflow-hidden">
      {/* Subtle room background hint */}
      <div className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, #c8aa82 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-8 px-8 max-w-xl text-center anim-fadeIn">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <span
            className="font-pixel tracking-[0.4em]"
            style={{ fontSize: '22px', color: '#7ab0e8', textShadow: '0 0 30px rgba(122,176,232,0.5)' }}
          >
            MIRROR
          </span>
          <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7ab0e8, transparent)' }} />
          <span className="font-mono text-[11px] tracking-[0.2em] text-white/30">
            DYADIC REFLECTION SYSTEM
          </span>
        </div>

        {/* Scenario card */}
        <div className="glass rounded-xl px-8 py-6 flex flex-col gap-4 w-full border border-white/8">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">Scenario</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <div>
            <p className="text-lg font-medium text-white/90 mb-1">{scenario.title}</p>
            <p className="font-mono text-[11px] text-white/40 italic">{scenario.subtitle}</p>
          </div>

          <p className="text-sm text-white/55 leading-relaxed">
            以下是一段被 AI 重构的真实冲突场景。<br/>
            两位伙伴的<span style={{ color: '#7ab0e8' }}>内心想法</span>与
            <span style={{ color: '#e87a7a' }}>对话</span>将同时呈现。<br/>
            观察你们之间发生了什么。
          </p>

          {/* Partner indicators */}
          <div className="flex gap-4 mt-1">
            {Object.values(scenario.personas).map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                <span className="font-mono text-[10px]" style={{ color: p.color }}>{p.name}</span>
                <span className="font-mono text-[9px] text-white/25">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls hint */}
        <div className="flex gap-6 font-mono text-[9px] text-white/20 tracking-wider">
          <span>SPACE — 播放 / 暂停</span>
          <span>→ — 下一幕</span>
          <span>T — 切换内心独白</span>
        </div>

        {/* Begin button */}
        <button
          onClick={onBegin}
          className="group relative font-mono text-sm tracking-[0.2em] px-10 py-3.5 rounded-lg border transition-all duration-300 overflow-hidden"
          style={{
            color: '#7ab0e8',
            borderColor: 'rgba(122,176,232,0.4)',
            background: 'rgba(122,176,232,0.06)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(122,176,232,0.14)'; e.currentTarget.style.borderColor = 'rgba(122,176,232,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(122,176,232,0.06)'; e.currentTarget.style.borderColor = 'rgba(122,176,232,0.4)' }}
        >
          开始模拟 / BEGIN SIMULATION
        </button>

      </div>
    </div>
  )
}
