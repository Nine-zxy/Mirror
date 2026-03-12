import { useEffect, useState } from 'react'
import PixelChar      from './PixelChar'
import ThoughtBubble  from './ThoughtBubble'
import Subtitle       from './Subtitle'

// ─────────────────────────────────────────────────────────────
//  Theater — Front Stage (Goffman: front region)
//  Composes the full simulation view:
//    • Scene background (enclosed room OR outdoor)
//    • Proxemic divider between characters
//    • Character layer (pixel chars + thought bubbles)
//    • Subtitle bar
// ─────────────────────────────────────────────────────────────

// ── Enclosed: Apartment room ──────────────────────────────────
function RoomBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Ceiling */}
      <div className="absolute top-0 left-0 right-0 room-ceiling" style={{ height: '70px' }}>
        <div className="absolute" style={{ left: '50%', top: '16px', transform: 'translateX(-50%)' }}>
          <div style={{ width: '56px', height: '4px', background: '#2a1e14', margin: '0 auto' }} />
          <div style={{
            width: '26px', height: '18px', margin: '0 auto',
            background: 'linear-gradient(180deg,#fffbe0,#f0d890)',
            boxShadow: '0 0 28px rgba(255,210,90,0.5), 0 0 60px rgba(255,200,70,0.18)',
          }} />
        </div>
        <div className="absolute" style={{ right: '12%', top: '28px' }}>
          <div style={{ width: '3px', height: '26px', background: '#3a2a1a', margin: '0 auto' }} />
          <div style={{ width: '16px', height: '9px', background: '#4a3520', borderRadius: '3px 3px 0 0' }} />
        </div>
      </div>

      {/* Wall */}
      <div className="absolute left-0 right-0 room-wall" style={{ top: '70px', bottom: '98px' }}>
        <div className="absolute inset-0 room-ambient pointer-events-none" />
        {/* Window */}
        <div className="absolute" style={{
          left: '8%', top: '28px', width: '108px', height: '128px',
          background: 'linear-gradient(135deg,#c8e8ff,#a0c8f0 40%,#7ab0e0)',
          border: '4px solid #6a4a2a',
          boxShadow: 'inset 0 0 18px rgba(180,220,255,0.3),0 0 28px rgba(160,200,240,0.18)',
        }}>
          <div style={{ position:'absolute',left:'50%',top:0,bottom:0,width:'3px',background:'#6a4a2a',transform:'translateX(-50%)' }} />
          <div style={{ position:'absolute',top:'50%',left:0,right:0,height:'3px',background:'#6a4a2a',transform:'translateY(-50%)' }} />
          <div style={{ position:'absolute',left:'-13px',top:'-4px',width:'15px',height:'138px',
            background:'linear-gradient(90deg,#8a6040,#c89060 60%,#a87050)',borderRadius:'2px 0 0 2px' }} />
          <div style={{ position:'absolute',right:'-13px',top:'-4px',width:'15px',height:'138px',
            background:'linear-gradient(270deg,#8a6040,#c89060 60%,#a87050)',borderRadius:'0 2px 2px 0' }} />
        </div>
        {/* Wall frames */}
        {[
          { left:'28%',top:'18px',w:'62px',h:'78px',c:'#7a5a8a' },
          { left:'42%',top:'32px',w:'46px',h:'56px',c:'#4a6a8a' },
          { right:'20%',top:'16px',w:'76px',h:'92px',c:'#6a8a5a' },
          { right:'8%',top:'38px',w:'42px',h:'50px',c:'#8a6a4a' },
        ].map((f,i) => (
          <div key={i} className="absolute" style={{
            left:f.left,right:f.right,top:f.top,width:f.w,height:f.h,
            background:'#5a3a1a',padding:'5px',
            boxShadow:'2px 2px 8px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width:'100%',height:'100%',background:f.c,opacity:0.6 }} />
          </div>
        ))}
        {/* Credenza */}
        <div className="absolute" style={{
          left:'37%',bottom:'18px',width:'175px',height:'50px',
          background:'#5a3a1a',borderRadius:'3px 3px 0 0',boxShadow:'0 -2px 8px rgba(0,0,0,0.4)',
        }}>
          <div style={{ position:'absolute',top:'7px',left:'10px',display:'flex',gap:'3px' }}>
            {['#7a3a2a','#3a5a7a','#4a7a3a','#7a6a2a'].map((c,i) => (
              <div key={i} style={{ width:'7px',height:'26px',background:c,borderRadius:'1px' }} />
            ))}
          </div>
          <div style={{
            position:'absolute',top:'7px',right:'14px',width:'20px',height:'20px',
            borderRadius:'50%',background:'#9a8060',boxShadow:'0 0 6px rgba(200,160,80,0.4)',
          }} />
        </div>
        {/* Sofa */}
        <div className="absolute" style={{ right:'6%',bottom:'5px',width:'196px',height:'88px' }}>
          <div style={{
            position:'absolute',top:0,left:0,right:0,height:'54px',
            background:'linear-gradient(180deg,#3a2a4a,#2e2038)',borderRadius:'6px 6px 0 0',
            boxShadow:'0 -2px 10px rgba(0,0,0,0.3)',
          }}>
            <div style={{ position:'absolute',top:'6px',left:'50%',bottom:'6px',width:'2px',background:'rgba(0,0,0,0.25)' }} />
          </div>
          <div style={{
            position:'absolute',bottom:'15px',left:'-7px',right:'-7px',height:'35px',
            background:'linear-gradient(180deg,#4a3860,#382848)',borderRadius:'3px',
            boxShadow:'0 4px 8px rgba(0,0,0,0.5)',
          }} />
          <div style={{ position:'absolute',left:'-13px',top:'17px',width:'13px',height:'56px',background:'#3a2848',borderRadius:'4px 0 0 4px' }} />
          <div style={{ position:'absolute',right:'-13px',top:'17px',width:'13px',height:'56px',background:'#3a2848',borderRadius:'0 4px 4px 0' }} />
          <div style={{ position:'absolute',bottom:0,left:'9px',width:'5px',height:'15px',background:'#2a1a10' }} />
          <div style={{ position:'absolute',bottom:0,right:'9px',width:'5px',height:'15px',background:'#2a1a10' }} />
        </div>
        {/* Floor lamp */}
        <div className="absolute" style={{ right:'29%',bottom:'3px' }}>
          <div style={{ width:'3px',height:'76px',background:'#4a3010',margin:'0 auto' }} />
          <div style={{
            width:'26px',height:'16px',marginTop:'-3px',marginLeft:'-11px',
            background:'linear-gradient(135deg,#f0d890,#d0b060)',borderRadius:'50% 50% 0 0',
            boxShadow:'0 0 18px rgba(220,180,80,0.4)',
          }} />
          <div style={{ width:'12px',height:'3px',background:'#2a1a08',margin:'0 auto' }} />
        </div>
      </div>

      {/* Floor */}
      <div className="absolute left-0 right-0 bottom-0 room-floor" style={{ height: '98px' }}>
        <div style={{
          position:'absolute',top:0,left:'20%',right:'20%',height:'1px',
          background:'linear-gradient(90deg,transparent,rgba(200,170,120,0.18),transparent)',
        }} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 90% 80% at 50% 50%,transparent 38%,rgba(0,0,0,0.5) 100%)',
      }} />
    </div>
  )
}

// ── Open: Night park ──────────────────────────────────────────
function OutdoorBackground() {
  const stars = [
    [10,8],[18,15],[28,6],[35,20],[48,10],[55,5],
    [62,18],[70,8],[80,15],[88,6],[15,30],[40,25],[75,28],[92,18],[25,22],
  ]
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg,#080c1a 0%,#0f1535 50%,#1a2248 100%)',
      }} />

      {/* Moon */}
      <div className="absolute" style={{
        right: '14%', top: '10%', width: '36px', height: '36px', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%,#fffbe8,#f0d890)',
        boxShadow: '0 0 30px rgba(240,220,130,0.4),0 0 80px rgba(240,220,130,0.1)',
      }} />

      {/* Stars */}
      {stars.map(([x,y],i) => (
        <div key={i} className="absolute" style={{
          left:`${x}%`,top:`${y}%`,width:'2px',height:'2px',borderRadius:'50%',
          background:'rgba(255,255,255,0.75)',
          boxShadow:'0 0 4px rgba(255,255,255,0.4)',
          animation:`pulseSoft ${1.8+i*0.25}s ease-in-out infinite alternate`,
        }} />
      ))}

      {/* City silhouette */}
      {[
        {l:'3%',w:'45px',h:'55px'},{l:'10%',w:'28px',h:'38px'},
        {l:'76%',w:'52px',h:'48px'},{l:'86%',w:'32px',h:'32px'},
        {l:'92%',w:'22px',h:'42px'},
      ].map((b,i) => (
        <div key={i} className="absolute" style={{
          left:b.l, bottom:'98px', width:b.w, height:b.h,
          background:'#06080f',
        }}>
          <div style={{
            position:'absolute',top:'10px',left:'6px',width:'5px',height:'5px',
            background:'rgba(255,220,100,0.5)',boxShadow:'0 0 4px rgba(255,200,80,0.3)',
          }} />
        </div>
      ))}

      {/* Ground */}
      <div className="absolute" style={{
        left:0,right:0,bottom:'98px',height:'48px',
        background:'linear-gradient(180deg,#101828,#0c1220)',
        borderTop:'1px solid rgba(255,255,255,0.035)',
      }} />
      {/* Grass patches */}
      <div className="absolute" style={{ left:0,width:'20%',bottom:'98px',height:'20px',background:'#0c160c' }} />
      <div className="absolute" style={{ right:0,width:'20%',bottom:'98px',height:'20px',background:'#0c160c' }} />

      {/* Park bench */}
      <div className="absolute" style={{ right:'17%', bottom:'120px' }}>
        <div style={{ width:'72px',height:'5px',background:'#3a2810',marginBottom:'5px',borderRadius:'1px' }} />
        <div style={{ width:'72px',height:'8px',background:'#4a3418',marginBottom:'7px',borderRadius:'1px' }} />
        <div style={{ display:'flex',justifyContent:'space-between',padding:'0 8px' }}>
          {[0,1,2].map(k=>(
            <div key={k} style={{ width:'4px',height:'20px',background:'#3a2010' }} />
          ))}
        </div>
      </div>

      {/* Street lamp */}
      <div className="absolute" style={{ left:'12%', bottom:'98px' }}>
        <div style={{ width:'4px',height:'104px',background:'#252330',margin:'0 auto' }} />
        <div style={{ position:'absolute',top:0,right:'-24px',width:'28px',height:'4px',background:'#252330' }} />
        <div style={{
          position:'absolute',top:'-14px',right:'-34px',
          width:'14px',height:'10px',
          background:'linear-gradient(180deg,#fffbe0,#f0d070)',
          boxShadow:'0 0 22px rgba(240,200,80,0.55),0 0 60px rgba(240,200,80,0.12)',
          borderRadius:'2px',
        }} />
        <div style={{ width:'10px',height:'4px',background:'#1a1825',margin:'0 auto' }} />
      </div>

      {/* Floor */}
      <div className="absolute left-0 right-0 bottom-0 room-floor" style={{
        height:'98px',
        background:'linear-gradient(180deg,#0c1220,#080e18)',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 90% 80% at 50% 50%,transparent 38%,rgba(0,0,0,0.6) 100%)',
      }} />
    </div>
  )
}

// ── Proxemic divider ──────────────────────────────────────────
function ProxemicDivider({ proxemic, xA, xB }) {
  if (!proxemic?.divider) return null
  const midPct = (xA + xB) / 2
  const styles = {
    tension: { color:'rgba(200,140,50,0.20)', glow:'rgba(200,140,50,0.12)' },
    hot:     { color:'rgba(200,60,50,0.25)',  glow:'rgba(200,60,50,0.16)'  },
    cold:    { color:'rgba(100,150,220,0.22)',glow:'rgba(100,150,220,0.13)' },
  }
  const s = styles[proxemic.state] || { color:'transparent', glow:'transparent' }

  return (
    <div className="absolute pointer-events-none" style={{
      left:`${midPct}%`, top:'15%', bottom:'98px',
      width:'1px', transform:'translateX(-50%)',
      background:`linear-gradient(180deg,transparent,${s.color} 20%,${s.color} 80%,transparent)`,
      boxShadow:`0 0 18px 8px ${s.glow}`,
      zIndex:8, transition:'all 0.8s ease',
    }} />
  )
}

// ── Character layer ───────────────────────────────────────────
function CharacterLayer({ beat, personas, showThoughts }) {
  const { spatial, thoughts } = beat
  return (
    <div className="absolute inset-0">
      {['A','B'].map(id => {
        const sp = spatial[id]
        if (!sp?.visible) return null
        const persona  = personas[id]
        const thought  = thoughts?.[id]
        return (
          <div key={id} className="absolute" style={{
            left:`${sp.x}%`, bottom:'98px',
            transform:'translateX(-50%)',
            transition:'left 0.9s cubic-bezier(0.4,0,0.2,1)',
            zIndex:10,
          }}>
            <div className="relative" style={{ minHeight:'8px' }}>
              <ThoughtBubble thought={thought} personaId={id} visible={showThoughts} />
            </div>
            <PixelChar
              persona={persona}
              emotion={sp.pose    || 'neutral'}
              facing={sp.facing  || 'right'}
              lean={sp.lean      || 'none'}
              scale={sp.scale    || 1.0}
              glow={true}
              feature={persona.feature || 'none'}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Main Theater ──────────────────────────────────────────────
export default function Theater({ beat, personas, showThoughts, sceneType = 'enclosed' }) {
  if (!beat) return null
  const xA = beat.spatial?.A?.x ?? 30
  const xB = beat.spatial?.B?.x ?? 70

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        {sceneType === 'open' ? <OutdoorBackground /> : <RoomBackground />}
        <ProxemicDivider proxemic={beat.proxemic} xA={xA} xB={xB} />
        <CharacterLayer beat={beat} personas={personas} showThoughts={showThoughts} />

        {/* Narrator */}
        {beat.narrator && (
          <div className="absolute top-4 left-0 right-0 flex justify-center z-20 animate-fadeIn">
            <div className="glass px-4 py-2 rounded-lg max-w-lg text-center"
              style={{ color:'rgba(255,255,255,0.42)',fontSize:'12px',
                fontFamily:'"PingFang SC","Inter",sans-serif' }}>
              {beat.narrator}
            </div>
          </div>
        )}

        {/* Letterbox bars */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black pointer-events-none z-30" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black pointer-events-none z-30" />
      </div>

      {/* Subtitle */}
      <div style={{
        minHeight:'52px', flexShrink:0,
        background:'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.88) 55%)',
      }}>
        <Subtitle dialogue={beat.dialogue} personas={personas} />
      </div>
    </div>
  )
}
