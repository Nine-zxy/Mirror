import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import PixelChar      from './PixelChar'
import ThoughtBubble  from './ThoughtBubble'
import Subtitle       from './Subtitle'
import { SCENE_PRESETS, EMOTION_TO_SPRITE, PERSONA_FILTERS } from '../data/dramaElements'

// ─────────────────────────────────────────────────────────────
//  Theater — Main performance stage
//
//  Visual system (layered):
//    1. SceneBackground — PNG image (if available) + CSS gradient fallback
//    2. SceneElements   — detailed CSS pixel-art furniture/props
//    3. Stars           — for outdoor/night scenes
//    4. ParticleLayer   — floating ambient light particles
//    5. CharacterLayer  — PNG sprites (if available) + PixelChar SVG fallback
//    6. ThoughtBubbles  — above each character
//    7. ProxemicDivider — tension line between characters
//    8. Narrator pill   — scene-setting text
//    9. Overlays        — vignette, letterbox, film grain
//
//  Character rendering priority:
//    → PNG sprite from /assets/sprites/{id}/{emotion}.png
//    → Falls back to SVG PixelChar if PNG not found
//
//  Background rendering priority:
//    → PNG from /assets/backgrounds/{scene}.png
//    → Falls back to CSS gradient if PNG not found
// ─────────────────────────────────────────────────────────────

// ── Scene element definitions (CSS pixel art) ─────────────────
// Each element renders front-view pixel art furniture/props.
// Coordinates: bottom=97 puts objects on the floor line.
const SCENE_ELEMENTS = {
  bed: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ right: '6%', bottom: floorPct, zIndex: 3 }}>
      {/* Headboard */}
      <div style={{ width: '160px', height: '50px', background: '#1e1430', borderRadius: '4px 4px 0 0',
        boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.4), 0 -2px 12px rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', top: '6px', left: '8px', right: '8px', height: '28px',
          background: '#2a1c3e', borderRadius: '3px', opacity: 0.6 }} />
        {/* Pillow hints */}
        {[0,1].map(k => (
          <div key={k} style={{ position: 'absolute', top: '8px', left: `${14 + k * 70}px`,
            width: '55px', height: '22px', background: '#3a2c4a', borderRadius: '4px', opacity: 0.8 }} />
        ))}
      </div>
      {/* Mattress edge */}
      <div style={{ width: '168px', height: '10px', background: '#16102a', borderRadius: '0 0 2px 2px',
        margin: '0 auto', boxShadow: '0 3px 8px rgba(0,0,0,0.5)' }} />
    </div>
  ),
  sofa: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ right: '5%', bottom: floorPct, zIndex: 3 }}>
      {/* Back cushion */}
      <div style={{ width: '180px', height: '38px', background: '#3a2818', borderRadius: '6px 6px 0 0',
        boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.3)' }}>
        {[0,1,2].map(k => (
          <div key={k} style={{ position: 'absolute', top: '6px', left: `${8 + k * 56}px`,
            width: '50px', height: '22px', background: '#4a3420', borderRadius: '3px', opacity: 0.7 }} />
        ))}
      </div>
      {/* Seat */}
      <div style={{ width: '190px', height: '22px', background: '#4a3420', marginLeft: '-5px',
        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)' }}>
        {/* Armrests */}
        <div style={{ position: 'absolute', left: '-10px', top: '-10px', width: '12px', height: '32px',
          background: '#503824', borderRadius: '4px 0 0 4px' }} />
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '12px', height: '32px',
          background: '#503824', borderRadius: '0 4px 4px 0' }} />
      </div>
      <div style={{ width: '190px', height: '6px', background: '#2a1c10', marginLeft: '-5px', borderRadius: '0 0 2px 2px' }} />
    </div>
  ),
  table: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ left: '44%', bottom: floorPct, transform: 'translateX(-50%)', zIndex: 3 }}>
      <div style={{ width: '100px', height: '8px', background: '#3a2a18', borderRadius: '2px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}>
        {[0, 1].map(k => <div key={k} style={{ width: '5px', height: '36px', background: '#2e2014', borderRadius: '0 0 2px 2px' }} />)}
      </div>
    </div>
  ),
  lamp: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ left: '12%', bottom: floorPct, zIndex: 4 }}>
      {/* Stem */}
      <div style={{ width: '3px', height: '90px', background: '#3a2818', margin: '0 auto',
        boxShadow: '1px 0 3px rgba(0,0,0,0.3)' }} />
      {/* Shade */}
      <div style={{ width: '32px', height: '18px', marginTop: '-2px', marginLeft: '-14px',
        background: 'linear-gradient(180deg, #fff8d0 0%, #f0d060 100%)',
        boxShadow: '0 0 30px rgba(240,200,80,0.55), 0 0 80px rgba(240,200,80,0.18)',
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
      }} />
      {/* Light cone */}
      <div style={{ position: 'absolute', bottom: '2px', left: '12%',
        width: '80px', height: '50px', marginLeft: '-40px',
        background: 'radial-gradient(ellipse at top, rgba(240,200,80,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Base */}
      <div style={{ width: '14px', height: '5px', background: '#2a1a08', margin: '0 auto', borderRadius: '2px' }} />
    </div>
  ),
  phone_screen: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ left: '52%', bottom: `calc(${floorPct} + 30px)`, zIndex: 5 }}>
      {/* Phone body */}
      <div style={{ width: '18px', height: '30px', background: '#141a2a',
        border: '1.5px solid #2a3560', borderRadius: '3px',
        boxShadow: '0 0 16px rgba(100,140,220,0.4), 0 0 4px rgba(0,0,0,0.8)' }}>
        {/* Screen glow */}
        <div style={{ margin: '3px 2px', height: '20px',
          background: 'linear-gradient(160deg, #3a5ab0 0%, #2040a0 50%, #1830a0 100%)',
          borderRadius: '2px',
          boxShadow: 'inset 0 0 6px rgba(100,160,255,0.3)' }}>
          {/* Fake chat bubbles */}
          <div style={{ position: 'absolute', top: '5px', left: '3px', width: '8px', height: '2px',
            background: 'rgba(255,255,255,0.4)', borderRadius: '1px' }} />
          <div style={{ position: 'absolute', top: '9px', right: '3px', width: '6px', height: '2px',
            background: 'rgba(255,255,255,0.3)', borderRadius: '1px' }} />
          <div style={{ position: 'absolute', top: '13px', left: '3px', width: '10px', height: '2px',
            background: 'rgba(255,255,255,0.35)', borderRadius: '1px' }} />
        </div>
        {/* Home button */}
        <div style={{ width: '5px', height: '5px', background: '#2a3560', borderRadius: '50%',
          margin: '1px auto', border: '0.5px solid #3a4570' }} />
      </div>
    </div>
  ),
  window: ({ scene }) => {
    const isNight = scene !== 'kitchen_morning'
    // Deterministic building + window layout (no Math.random to avoid flicker)
    const buildings = [
      { x: 0,   w: 18, h: 58, c: '#0c1430', wins: [[8,6],[8,20],[8,34],[8,48]] },
      { x: 16,  w: 14, h: 42, c: '#0a122a', wins: [[5,8],[5,22]] },
      { x: 28,  w: 22, h: 70, c: '#080e22', wins: [[6,4],[6,18],[14,4],[14,18],[6,32],[14,32],[6,46],[14,46]] },
      { x: 48,  w: 12, h: 48, c: '#0c1430', wins: [[4,10],[4,24],[4,38]] },
      { x: 58,  w: 20, h: 65, c: '#060c20', wins: [[5,6],[13,6],[5,20],[13,20],[5,34],[13,34],[5,48],[13,48]] },
      { x: 76,  w: 14, h: 52, c: '#0a1228', wins: [[4,8],[4,22],[4,36]] },
      { x: 88,  w: 22, h: 60, c: '#08102a', wins: [[6,6],[14,6],[6,20],[14,20],[6,34],[14,34]] },
    ]
    // Which windows are lit (true/false per win index)
    const litMap = [
      [true,false,true,false],
      [true,false,false],
      [false,true,true,false,true,false,false,true],
      [true,false,true],
      [true,true,false,true,false,true,true,false],
      [false,true,true],
      [true,false,true,true,false,false],
    ]
    return (
      <div className="absolute" style={{ left: '7%', top: '45px', zIndex: 2 }}>
        {/* Window frame + outer glow */}
        <div style={{
          width: '120px', height: '145px',
          border: '5px solid #2a1c0e',
          position: 'relative', overflow: 'hidden',
          boxShadow: isNight
            ? '0 0 40px rgba(80,110,200,0.18), 0 0 8px rgba(0,0,0,0.7), inset 0 0 20px rgba(20,40,100,0.3)'
            : '0 0 30px rgba(180,220,255,0.25), 0 0 8px rgba(0,0,0,0.5)',
        }}>
          {/* Sky */}
          <div style={{
            position: 'absolute', inset: 0,
            background: isNight
              ? 'linear-gradient(180deg, #010610 0%, #030c20 45%, #060e28 75%, #0a1430 100%)'
              : 'linear-gradient(180deg, #5a9cd8 0%, #7ab8ec 55%, #b0d8f8 100%)',
          }} />

          {isNight ? <>
            {/* Stars */}
            {[{x:10,y:6},{x:24,y:12},{x:40,y:5},{x:56,y:10},{x:68,y:16},{x:82,y:7},{x:50,y:20},{x:18,y:24},{x:88,y:4},{x:73,y:22}]
              .map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                  width: i % 3 === 0 ? '2px' : '1.5px', height: i % 3 === 0 ? '2px' : '1.5px',
                  background: '#f8f4e8', borderRadius: '50%',
                  boxShadow: '0 0 3px rgba(248,244,232,0.8)',
                }} />
              ))}
            {/* Moon */}
            <div style={{
              position: 'absolute', right: '12px', top: '10px',
              width: '15px', height: '15px', borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 38%, #fffbe8 0%, #f0d890 60%, #d8c070 100%)',
              boxShadow: '0 0 14px rgba(240,220,140,0.65), 0 0 35px rgba(240,220,140,0.2)',
            }} />
            {/* Horizon glow */}
            <div style={{
              position: 'absolute', bottom: '22px', left: 0, right: 0, height: '18px',
              background: 'linear-gradient(180deg, transparent, rgba(40,60,120,0.35))',
            }} />
            {/* Buildings */}
            {buildings.map((b, bi) => (
              <div key={bi} style={{
                position: 'absolute', left: `${b.x}%`, bottom: '18px',
                width: `${b.w}px`, height: `${b.h}px`, background: b.c,
                boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.03)',
              }}>
                {/* Lit windows */}
                {(litMap[bi] || []).map((lit, wi) => {
                  const win = buildings[bi].wins[wi]
                  if (!win || !lit) return null
                  return (
                    <div key={wi} style={{
                      position: 'absolute', left: `${win[0]}px`, top: `${win[1]}px`,
                      width: '3px', height: '4px',
                      background: wi % 2 === 0 ? 'rgba(255,220,120,0.85)' : 'rgba(200,230,255,0.7)',
                      boxShadow: wi % 2 === 0
                        ? '0 0 4px rgba(255,220,120,0.5)'
                        : '0 0 4px rgba(180,210,255,0.45)',
                    }} />
                  )
                })}
                {/* Roof antenna on tallest buildings */}
                {b.h > 60 && (
                  <div style={{
                    position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
                    width: '1px', height: '8px', background: 'rgba(255,255,255,0.2)',
                  }} />
                )}
              </div>
            ))}
            {/* Street */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px',
              background: 'linear-gradient(180deg, #0c1628 0%, #060a14 100%)',
            }} />
            {/* Street reflection line */}
            <div style={{
              position: 'absolute', bottom: '4px', left: '5%', right: '5%', height: '1px',
              background: 'rgba(80,130,220,0.18)',
            }} />
          </> : <>
            {/* Day sky clouds */}
            {[{x:'8%',y:'14px',w:30},{x:'48%',y:'28px',w:24},{x:'72%',y:'10px',w:20}].map((cl,i) => (
              <div key={i} style={{
                position: 'absolute', left: cl.x, top: cl.y,
                width: `${cl.w}px`, height: '10px',
                background: 'rgba(255,255,255,0.65)', borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(255,255,255,0.3)',
              }} />
            ))}
            {/* Day buildings silhouette */}
            {[{x:0,w:20,h:30,c:'#8ab0d0'},{x:18,w:16,h:22,c:'#9ac0e0'},{x:32,w:24,h:38,c:'#7aa8c8'},{x:54,w:18,h:28,c:'#8ab8d8'},{x:70,w:22,h:34,c:'#80b0c8'}].map((b,i) => (
              <div key={i} style={{
                position: 'absolute', left: `${b.x}%`, bottom: '18px',
                width: `${b.w}px`, height: `${b.h}px`, background: b.c, opacity: 0.5,
              }} />
            ))}
            {/* Ground */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px',
              background: 'linear-gradient(180deg, #8ab878 0%, #6a9858 100%)',
            }} />
          </>}

          {/* Window cross bars (on top of view) */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px',
            background: '#2a1c0e', transform: 'translateX(-50%)', zIndex: 5,
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0, height: '4px',
            background: '#2a1c0e', transform: 'translateY(-50%)', zIndex: 5,
          }} />
          {/* Glass reflection */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 6,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%, rgba(255,255,255,0.025) 100%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    )
  },
  moon: () => (
    <div className="absolute" style={{ right: '16%', top: '8%', zIndex: 2 }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #fffbe8, #f0d890 70%, #d8c070)',
        boxShadow: '0 0 30px rgba(240,220,130,0.45), 0 0 80px rgba(240,220,130,0.12)' }} />
      {/* Craters */}
      {[{ l: '60%', t: '25%', s: 6 }, { l: '30%', t: '60%', s: 4 }].map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.l, top: c.t,
          width: `${c.s}px`, height: `${c.s}px`, borderRadius: '50%',
          background: 'rgba(180,160,80,0.4)' }} />
      ))}
    </div>
  ),
  tree: () => (
    <div className="absolute" style={{ left: '4%', bottom: '28%', zIndex: 2 }}>
      {/* Trunk */}
      <div style={{ width: '10px', height: '70px', background: '#1a2010', margin: '0 auto',
        boxShadow: '2px 0 4px rgba(0,0,0,0.4)' }} />
      {/* Canopy layers */}
      {[
        { w: 54, h: 50, ml: -22, mt: -44, opacity: 0.9 },
        { w: 44, h: 40, ml: -17, mt: -64, opacity: 0.7 },
        { w: 32, h: 30, ml: -11, mt: -82, opacity: 0.5 },
      ].map((l, i) => (
        <div key={i} style={{ width: `${l.w}px`, height: `${l.h}px`,
          background: '#0a1810', borderRadius: '50% 50% 20% 20%',
          marginTop: `${l.mt}px`, marginLeft: `${l.ml}px`,
          boxShadow: '0 0 15px rgba(10,30,10,0.6)', opacity: l.opacity }} />
      ))}
    </div>
  ),
  bench: () => (
    <div className="absolute" style={{ right: '16%', bottom: '28%', zIndex: 3 }}>
      <div style={{ width: '80px', height: '6px', background: '#3a2810', marginBottom: '3px', borderRadius: '1px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      <div style={{ width: '80px', height: '8px', background: '#4a3418', marginBottom: '8px', borderRadius: '1px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
        {[0, 1, 2].map(k => <div key={k} style={{ width: '5px', height: '22px', background: '#382010', borderRadius: '0 0 2px 2px' }} />)}
      </div>
    </div>
  ),
  cup: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ left: '48%', bottom: `calc(${floorPct} + 40px)`, zIndex: 5 }}>
      <div style={{ width: '14px', height: '16px', background: '#e8e0d4', borderRadius: '0 0 3px 3px',
        boxShadow: '0 0 4px rgba(200,180,140,0.2)', border: '1px solid rgba(180,160,120,0.3)' }}>
        <div style={{ position: 'absolute', right: '-5px', top: '4px', width: '5px', height: '8px',
          border: '1.5px solid #e0d8cc', borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
      </div>
      {/* Steam */}
      <div style={{ position: 'absolute', top: '-10px', left: '4px', width: '2px', height: '8px',
        background: 'rgba(255,255,255,0.12)', borderRadius: '1px',
        animation: 'floatUp 2s ease-in-out infinite' }} />
    </div>
  ),
  desk: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ right: '8%', bottom: floorPct, zIndex: 3 }}>
      {/* Desktop */}
      <div style={{ width: '140px', height: '8px', background: '#3a2a1a', borderRadius: '1px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
      {/* Monitor */}
      <div style={{ position: 'absolute', top: '-55px', left: '30px', width: '60px', height: '45px',
        background: '#141820', border: '3px solid #1e2830', borderRadius: '3px',
        boxShadow: '0 0 12px rgba(80,120,200,0.2)' }}>
        <div style={{ margin: '4px', height: '30px',
          background: 'linear-gradient(135deg, #1a2840 0%, #0e1828 100%)', borderRadius: '1px' }}>
          {/* Screen lines */}
          {[0,1,2].map(k => (
            <div key={k} style={{ position: 'absolute', top: `${6 + k * 8}px`, left: '6px', right: '6px',
              height: '2px', background: 'rgba(80,140,220,0.3)', borderRadius: '1px' }} />
          ))}
        </div>
      </div>
      {/* Monitor stand */}
      <div style={{ position: 'absolute', top: '-10px', left: '56px', width: '8px', height: '10px',
        background: '#1e2830' }} />
      {/* Legs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 14px' }}>
        {[0, 1].map(k => <div key={k} style={{ width: '6px', height: '32px', background: '#2a1a10', borderRadius: '0 0 2px 2px' }} />)}
      </div>
    </div>
  ),
  coffee: ({ floorPct = '28%' }) => (
    <div className="absolute" style={{ left: '46%', bottom: `calc(${floorPct} + 38px)`, zIndex: 5 }}>
      <div style={{ width: '16px', height: '20px',
        background: 'linear-gradient(180deg, #f8f0e8 0%, #e8d8c4 100%)',
        borderRadius: '0 0 4px 4px', border: '1px solid rgba(180,160,130,0.4)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'absolute', right: '-6px', top: '5px', width: '6px', height: '9px',
          border: '1.5px solid #e0d0b8', borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
        <div style={{ margin: '2px 2px 0', height: '6px', background: 'rgba(80,40,10,0.4)', borderRadius: '1px' }} />
      </div>
      <div style={{ width: '22px', height: '3px', background: '#e0d0b8', borderRadius: '1px',
        marginLeft: '-3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  ),

  // ── New rich elements ────────────────────────────────────────

  bookshelf: () => (
    <div className="absolute" style={{ right: '3%', bottom: '28%', zIndex: 3 }}>
      {/* Main casing */}
      <div style={{ width: '92px', height: '170px', background: '#22160a', borderRadius: '2px',
        boxShadow: '3px 0 10px rgba(0,0,0,0.6), inset 2px 0 6px rgba(0,0,0,0.4), inset -2px 0 4px rgba(0,0,0,0.3)' }}>
        {/* Shelf boards */}
        {[33, 55, 77].map(t => (
          <div key={t} style={{ position: 'absolute', top: `${t}%`, left: 0, right: 0, height: '4px',
            background: '#2e1c0e', boxShadow: '0 2px 0 rgba(0,0,0,0.35)' }} />
        ))}
        {/* Bottom shelf books */}
        <div style={{ position: 'absolute', bottom: '3px', left: '4px', right: '4px',
          display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
          {[{w:8,h:32,c:'#8a2a2a'},{w:6,h:28,c:'#2a5a8a'},{w:10,h:34,c:'#2a6a2a'},{w:7,h:27,c:'#7a5a18'},{w:8,h:30,c:'#5a2a7a'},{w:6,h:26,c:'#8a6218'},{w:9,h:31,c:'#2a4a7a'},{w:7,h:28,c:'#7a2a2a'}].map((b,i)=>(
            <div key={i} style={{ width:`${b.w}px`, height:`${b.h}px`, background:b.c,
              borderRadius:'1px', boxShadow:`inset -1px 0 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)` }} />
          ))}
        </div>
        {/* Mid shelf books */}
        <div style={{ position: 'absolute', top: '36%', left: '4px', right: '4px',
          display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
          {[{w:9,h:26,c:'#4a7a2a'},{w:7,h:29,c:'#3a2a7a'},{w:8,h:24,c:'#8a5218'},{w:10,h:28,c:'#2a6a5a'},{w:6,h:23,c:'#7a2a4a'},{w:9,h:27,c:'#3a5a7a'},{w:7,h:25,c:'#6a3a18'}].map((b,i)=>(
            <div key={i} style={{ width:`${b.w}px`, height:`${b.h}px`, background:b.c,
              borderRadius:'1px', boxShadow:`inset -1px 0 2px rgba(0,0,0,0.4)` }} />
          ))}
        </div>
        {/* Top shelf: vase + small frame + trinket */}
        <div style={{ position: 'absolute', top: '5px', left: '6px', right: '6px',
          display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          <div style={{ width: '10px', height: '20px', background: '#7a5030', borderRadius: '2px 2px 1px 1px',
            boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.4)' }} />
          <div style={{ width: '18px', height: '22px', background: '#141c28', border: '2px solid #2a2e18',
            borderRadius: '1px' }}>
            <div style={{ position: 'absolute', inset: '2px',
              background: 'linear-gradient(135deg, #1a2840 0%, #0e1420 100%)' }} />
          </div>
          <div style={{ width: '12px', height: '14px', background: '#3a2208', borderRadius: '50% 50% 40% 40%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
          <div style={{ width: '14px', height: '10px', background: '#3a4a20',
            borderRadius: '1px', marginBottom: '2px' }} />
        </div>
      </div>
      {/* Drop shadow */}
      <div style={{ height: '5px', background: 'rgba(0,0,0,0.35)', filter: 'blur(4px)', marginTop: '-3px' }} />
    </div>
  ),

  rug: () => (
    <div className="absolute" style={{ left: '50%', bottom: '28%', transform: 'translateX(-50%)', zIndex: 2 }}>
      {/* Main rug */}
      <div style={{ width: '300px', height: '16px', background: '#1e1208', borderRadius: '2px',
        boxShadow: '0 0 24px rgba(0,0,0,0.6)' }}>
        <div style={{ position: 'absolute', inset: '2px', background: '#180e06', borderRadius: '1px' }}>
          {/* Diamond pattern */}
          {[18, 36, 54, 72, 90].map(pct => (
            <div key={pct} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: '2px',
              background: 'rgba(160,110,50,0.22)' }} />
          ))}
          {/* Center stripe */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px',
            background: 'rgba(160,110,50,0.15)', transform: 'translateY(-50%)' }} />
          {/* Corner ornaments */}
          {[3, 97].map(x => ['15%', '85%'].map(y => (
            <div key={`${x}${y}`} style={{ position: 'absolute', left: `${x}%`, top: y, width: '3px', height: '3px',
              background: 'rgba(180,130,60,0.25)', borderRadius: '50%', transform: 'translate(-50%,-50%)' }} />
          )))}
        </div>
        {/* Fringe */}
        <div style={{ position: 'absolute', left: '-5px', top: '1px', bottom: '1px', width: '5px',
          background: 'repeating-linear-gradient(180deg, #2e1a0a 0px,#2e1a0a 2px,transparent 2px,transparent 4px)' }} />
        <div style={{ position: 'absolute', right: '-5px', top: '1px', bottom: '1px', width: '5px',
          background: 'repeating-linear-gradient(180deg, #2e1a0a 0px,#2e1a0a 2px,transparent 2px,transparent 4px)' }} />
      </div>
    </div>
  ),

  curtains: ({ scene }) => {
    const isNight = scene !== 'kitchen_morning'
    const cc = isNight ? '#16102a' : '#d8d0c4'
    const cs = isNight ? '0.35' : '0.15'
    return (
      <>
        {/* Left curtain panel */}
        <div className="absolute" style={{ left: '4.5%', top: '36px', zIndex: 3 }}>
          <div style={{ width: '30px', height: '120px', background: cc, borderRadius: '0 0 6px 0',
            boxShadow: `inset -4px 0 10px rgba(0,0,0,${cs}), 3px 2px 8px rgba(0,0,0,0.35)`,
            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}>
            {[28, 55, 78].map(t => (
              <div key={t} style={{ position: 'absolute', top: `${t}%`, left: '18%', right: '5%', height: '1px',
                background: `rgba(0,0,0,0.18)` }} />
            ))}
          </div>
        </div>
        {/* Right curtain panel */}
        <div className="absolute" style={{ left: 'calc(4.5% + 116px)', top: '36px', zIndex: 3 }}>
          <div style={{ width: '30px', height: '120px', background: cc, borderRadius: '0 0 0 6px',
            boxShadow: `inset 4px 0 10px rgba(0,0,0,${cs}), -3px 2px 8px rgba(0,0,0,0.35)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}>
            {[28, 55, 78].map(t => (
              <div key={t} style={{ position: 'absolute', top: `${t}%`, left: '5%', right: '18%', height: '1px',
                background: `rgba(0,0,0,0.18)` }} />
            ))}
          </div>
        </div>
        {/* Curtain rod */}
        <div className="absolute" style={{ left: '3%', top: '34px', zIndex: 4 }}>
          <div style={{ width: '182px', height: '3px', background: '#2a1808', borderRadius: '1px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }} />
          {/* Rod ends */}
          {[0, 178].map(left => (
            <div key={left} style={{ position: 'absolute', top: '-2px', left: `${left}px`,
              width: '4px', height: '7px', background: '#3a2210', borderRadius: '50%' }} />
          ))}
        </div>
      </>
    )
  },

  wallart: () => (
    <div className="absolute" style={{ left: '35%', top: '52px', zIndex: 2 }}>
      <div style={{ width: '78px', height: '60px', border: '3px solid #2a1c0e',
        boxShadow: '0 3px 10px rgba(0,0,0,0.6), inset 0 0 12px rgba(0,0,0,0.4)' }}>
        <div style={{ position: 'absolute', inset: '2px', background: '#0a1220', overflow: 'hidden' }}>
          {/* Pixel landscape painting */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(180deg, #142850 0%, #1e3a68 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
            background: 'linear-gradient(180deg, #0a1c08 0%, #060e04 100%)' }} />
          {/* Moon */}
          <div style={{ position: 'absolute', top: '6px', right: '7px', width: '8px', height: '8px',
            borderRadius: '50%', background: '#f0e870', boxShadow: '0 0 6px #f0e870' }} />
          {/* Pixel mountains */}
          {[{l:'4px',w:22,h:18},{l:'18px',w:28,h:24},{l:'38px',w:20,h:16},{l:'50px',w:18,h:14}].map((m,i)=>(
            <div key={i} style={{ position: 'absolute', bottom: '18px', left: m.l,
              width:`${m.w}px`, height:`${m.h}px`,
              background: i%2===0?'#182818':'#0e1e0c',
              clipPath:'polygon(50% 0,100% 100%,0 100%)' }} />
          ))}
          {/* River glint */}
          <div style={{ position: 'absolute', bottom: '4px', left: '12%', right: '30%', height: '3px',
            background: 'rgba(100,160,220,0.25)', borderRadius: '2px' }} />
        </div>
      </div>
      {/* Frame hanging wire */}
      <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
        width: '1px', height: '8px', background: 'rgba(255,255,255,0.15)' }} />
    </div>
  ),

  plant: () => (
    <div className="absolute" style={{ right: '20%', bottom: '28%', zIndex: 3 }}>
      {/* Pot */}
      <div style={{ width: '24px', height: '20px', background: '#6a3a18', borderRadius: '0 0 3px 3px',
        margin: '0 auto', position: 'relative', boxShadow: '0 3px 6px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', top: '-3px', left: '-3px', right: '-3px', height: '5px',
          background: '#7a4420', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', top: '7px', left: '3px', right: '3px', height: '4px',
          background: '#120a04', borderRadius: '1px' }} />
        {/* Pot sheen */}
        <div style={{ position: 'absolute', top: '-2px', left: '2px', width: '5px', height: '20px',
          background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      </div>
      {/* Stem */}
      <div style={{ width: '2px', height: '40px', background: '#183010', margin: '-40px auto 0' }} />
      {/* Leaves — monstera-style */}
      {[
        { left: '-28px', top: '-70px', rot: '-35deg', w: 30, h: 20, c: '#1a4010' },
        { left: '10px',  top: '-75px', rot:  '30deg', w: 28, h: 18, c: '#204818' },
        { left: '-22px', top: '-52px', rot: '-55deg', w: 24, h: 16, c: '#163410' },
        { left: '6px',   top: '-54px', rot:  '48deg', w: 22, h: 15, c: '#1c4014' },
        { left: '-10px', top: '-42px', rot:  '10deg', w: 18, h: 12, c: '#183810' },
      ].map((l, i) => (
        <div key={i} style={{
          position: 'absolute', left: l.left, top: l.top,
          width: `${l.w}px`, height: `${l.h}px`,
          background: l.c,
          borderRadius: '60% 10% 60% 10%',
          transform: `rotate(${l.rot})`,
          boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 0 4px rgba(0,0,0,0.2)`,
        }} />
      ))}
    </div>
  ),

  shelf: () => (
    <div className="absolute" style={{ left: '62%', top: '80px', zIndex: 2 }}>
      {/* Wall shelf board */}
      <div style={{ width: '80px', height: '6px', background: '#2a1c0c', borderRadius: '1px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'rgba(255,255,255,0.07)' }} />
      </div>
      {/* Brackets */}
      {[4, 64].map(left => (
        <div key={left} style={{ position: 'absolute', top: '6px', left: `${left}px`,
          width: '3px', height: '12px', background: '#2a1c0c', borderRadius: '0 0 1px 1px' }} />
      ))}
      {/* Items on shelf */}
      <div style={{ position: 'absolute', bottom: '7px', left: '6px', display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
        {/* Books */}
        {[{w:6,h:18,c:'#8a3020'},{w:5,h:16,c:'#2a508a'},{w:7,h:20,c:'#3a6a20'}].map((b,i)=>(
          <div key={i} style={{ width:`${b.w}px`, height:`${b.h}px`, background:b.c, borderRadius:'1px' }} />
        ))}
        {/* Candle */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: '5px', height: '14px', background: '#e0d8c4', borderRadius: '1px' }} />
          <div style={{ position: 'absolute', top: '-4px', left: '1px', width: '2px', height: '4px',
            background: '#f0a020', borderRadius: '1px', boxShadow: '0 0 4px #f0a020' }} />
        </div>
        {/* Small vase */}
        <div style={{ width: '8px', height: '12px', background: '#5a3870', borderRadius: '2px 2px 1px 1px',
          boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.4)' }} />
      </div>
    </div>
  ),

  tv: () => (
    <div className="absolute" style={{ left: '38%', top: '58px', zIndex: 2 }}>
      {/* TV body */}
      <div style={{ width: '100px', height: '62px', background: '#0e1218', border: '3px solid #1a2030',
        borderRadius: '4px', boxShadow: '0 0 18px rgba(80,120,200,0.15), 0 4px 10px rgba(0,0,0,0.6)' }}>
        {/* Screen */}
        <div style={{ position: 'absolute', inset: '3px',
          background: 'linear-gradient(135deg, #0c1828 0%, #081018 50%, #0a1422 100%)',
          borderRadius: '2px' }}>
          {/* Screen content lines */}
          {[20, 38, 56, 74].map(t => (
            <div key={t} style={{ position: 'absolute', top: `${t}%`, left: '8%', right: '8%', height: '2px',
              background: 'rgba(80,140,220,0.12)', borderRadius: '1px' }} />
          ))}
          {/* Standby glow */}
          <div style={{ position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(80,120,200,0.06) 0%, transparent 70%)' }} />
        </div>
        {/* Power LED */}
        <div style={{ position: 'absolute', bottom: '4px', right: '6px', width: '4px', height: '4px',
          borderRadius: '50%', background: '#30d060', boxShadow: '0 0 4px #30d060' }} />
      </div>
      {/* TV stand */}
      <div style={{ width: '18px', height: '6px', background: '#141820', margin: '0 auto',
        borderRadius: '0 0 2px 2px' }} />
      <div style={{ width: '30px', height: '3px', background: '#0e1218', margin: '0 auto',
        borderRadius: '0 0 2px 2px', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
    </div>
  ),
}

// ── Front-view room structure (CSS fallback) ──────────────────
// Rich pixel-art front-view interior with ceiling/wall/floor/trim details.
function RoomWalls({ rc, scene }) {
  if (rc.outdoor) {
    return (
      <>
        <div className="absolute inset-0" style={{ background: rc.wall }} />
        {/* Celestial glow */}
        <div className="absolute" style={{
          top: '6%', right: '12%', width: '100px', height: '100px', borderRadius: '50%',
          background: `radial-gradient(circle, ${rc.light}90 0%, ${rc.light}30 40%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        {/* Horizon haze */}
        <div className="absolute" style={{
          bottom: '32%', left: 0, right: 0, height: '15%',
          background: `linear-gradient(180deg, transparent, ${rc.light}14, transparent)`,
          pointerEvents: 'none',
        }} />
        {/* Ground with subtle texture */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: '33%',
          background: `linear-gradient(180deg, ${rc.floor}cc 0%, ${rc.floor} 60%)`,
          borderTop: `2px solid ${rc.trim}`,
        }} />
        {[15, 38, 62, 82].map(p => (
          <div key={p} style={{
            position: 'absolute', bottom: '2%', left: 0, right: 0,
            top: `${100 - 33 + p * 0.28}%`, height: '1px',
            background: 'rgba(255,255,255,0.018)',
          }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: '10%', background: `linear-gradient(180deg, transparent, rgba(0,0,0,0.4))`,
        }} />
      </>
    )
  }

  return (
    <>
      {/* ── Ceiling ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0" style={{
        height: '14%', background: rc.ceiling, zIndex: 1,
      }}>
        {/* Crown moulding */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10px',
          background: `linear-gradient(180deg, ${rc.trim}70 0%, ${rc.trim}cc 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
        }} />
        <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, height: '2px',
          background: `rgba(255,255,255,0.05)`,
        }} />
        {/* Ceiling texture gradient */}
        <div style={{ position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 65%)`,
        }} />
        {/* Central light cone */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '320px', height: '120px',
          background: `radial-gradient(ellipse at 50% 0%, ${rc.light}25 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Back wall ───────────────────────────────────────── */}
      <div className="absolute left-0 right-0" style={{
        top: '14%', bottom: '28%', background: rc.wall, zIndex: 0,
      }}>
        {/* Wallpaper vertical stripes */}
        {Array.from({ length: 22 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${i * 4.55}%`, width: '2px',
            background: `rgba(255,255,255,0.015)`,
          }} />
        ))}
        {/* Dado rail — horizontal panel divider */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px',
          background: `${rc.trim}dd`,
          boxShadow: `0 1px 0 rgba(255,255,255,0.05), 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)`,
        }} />
        {/* Wainscoting (below dado) */}
        <div style={{ position: 'absolute', top: '50%', bottom: 0, left: 0, right: 0,
          background: `rgba(0,0,0,0.1)`,
        }} />
        {/* Wainscoting panel bevels */}
        {[16.7, 33.3, 50, 66.7, 83.3].map(pct => (
          <div key={pct} style={{
            position: 'absolute', top: '53%', bottom: '2%', left: `${pct}%`, width: '1px',
            background: `rgba(0,0,0,0.1)`,
          }} />
        ))}
        {/* Ambient wall light */}
        <div style={{ position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${rc.light}16 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        {/* Light switch plate */}
        <div style={{ position: 'absolute', right: '10%', top: '60%',
          width: '9px', height: '13px', background: rc.trim, borderRadius: '1px',
          boxShadow: `1px 1px 0 rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)` }}>
          <div style={{ position: 'absolute', top: '3px', left: '2px', right: '2px', height: '3px',
            background: `rgba(255,255,255,0.12)`, borderRadius: '1px' }} />
        </div>
        {/* Outlet plate */}
        <div style={{ position: 'absolute', right: '10%', top: '78%',
          width: '7px', height: '10px', background: rc.trim, borderRadius: '1px',
          boxShadow: `1px 1px 0 rgba(0,0,0,0.25)` }}>
          {[3, 6].map(t => (
            <div key={t} style={{ position: 'absolute', top: `${t}px`, left: '2px', right: '2px',
              height: '1px', background: `rgba(0,0,0,0.3)` }} />
          ))}
        </div>
      </div>

      {/* ── Baseboard ───────────────────────────────────────── */}
      <div className="absolute left-0 right-0" style={{
        bottom: '28%', height: '14px', zIndex: 2,
        background: `linear-gradient(180deg, ${rc.trim}cc 0%, ${rc.trim} 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 3px 6px rgba(0,0,0,0.4)`,
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `rgba(255,255,255,0.08)` }} />
      </div>

      {/* ── Floor ───────────────────────────────────────────── */}
      <div className="absolute left-0 right-0 bottom-0" style={{ height: '28%', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: rc.floor }} />
        {/* Wood plank horizontal lines */}
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, top: `${(i + 0.5) * 10.5}%`, height: '1px',
            background: `rgba(0,0,0,0.07)`,
          }} />
        ))}
        {/* Plank vertical seams (offset per row for realistic look) */}
        {[10, 23, 38, 52, 64, 79, 91].map(pct => (
          <div key={pct} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: '1px',
            background: `rgba(0,0,0,0.05)`,
          }} />
        ))}
        {/* Floor gloss */}
        <div style={{ position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(0,0,0,0.28) 100%)`,
        }} />
        {/* Front edge shadow */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%)`,
        }} />
      </div>

      {/* ── Side wall depth shadows ──────────────────────────── */}
      <div className="absolute top-0 bottom-0 left-0" style={{
        width: '6.5%', zIndex: 2,
        background: `linear-gradient(90deg, rgba(0,0,0,0.55) 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />
      <div className="absolute top-0 bottom-0 right-0" style={{
        width: '6.5%', zIndex: 2,
        background: `linear-gradient(270deg, rgba(0,0,0,0.55) 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />
    </>
  )
}

// ── PNG Background with graceful fallback ────────────────────
function SceneBackground({ scene = 'bedroom_night', intensity = 0.5, sceneElements = [] }) {
  const preset = SCENE_PRESETS[scene] || SCENE_PRESETS.bedroom_night
  const rc     = preset.roomColors || {}
  const [pngLoaded, setPngLoaded] = useState(false)
  const [pngError, setPngError] = useState(false)
  const vignetteStrength = 0.3 + Math.min(1, intensity) * 0.3

  const usePng = pngLoaded && !pngError

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Hidden img probe — determines PNG availability */}
      <img
        src={preset.bg}
        onLoad={() => { setPngLoaded(true); setPngError(false) }}
        onError={() => setPngError(true)}
        style={{ display: 'none' }}
        alt=""
      />

      {/* ── PNG layer ── */}
      {usePng && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${preset.bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            imageRendering: 'pixelated',
          }}
        />
      )}

      {/* ── CSS fallback: proper front-view room ── */}
      {!usePng && (
        <>
          {/* Room architecture: ceiling / wall / floor */}
          <RoomWalls rc={rc} scene={scene} />

          {/* Stars for night/outdoor scenes */}
          {(scene === 'outdoor_park' || scene === 'bedroom_night') && (
            <Stars count={scene === 'outdoor_park' ? 22 : 8} />
          )}

          {/* Scene furniture/props — floor aligned at 28% */}
          {sceneElements.map((el, i) => {
            const Comp = SCENE_ELEMENTS[el]
            if (!Comp) return null
            return <Comp key={`${el}-${i}`} scene={scene} floorPct="28%" />
          })}
        </>
      )}

      {/* Vignette (always) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 92% 82% at 50% 50%, transparent 25%, rgba(0,0,0,${vignetteStrength}) 100%)`,
        transition: 'background 0.8s ease',
        zIndex: 10,
      }} />

      {/* Intensity darkening */}
      {intensity > 0.6 && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `rgba(0,0,0,${(intensity - 0.6) * 0.22})`,
          transition: 'background 0.8s ease',
          zIndex: 10,
        }} />
      )}
    </div>
  )
}

// ── Stars ──────────────────────────────────────────────────────
function Stars({ count = 12 }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: 5 + Math.random() * 90,
      y: 3 + Math.random() * 35,
      size: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 3,
      duration: 1.8 + Math.random() * 1.5,
    })), [count])

  return <>
    {stars.map((s, i) => (
      <div key={i} className="absolute" style={{
        left: `${s.x}%`, top: `${s.y}%`,
        width: `${s.size}px`, height: `${s.size}px`,
        borderRadius: '50%', background: 'rgba(255,255,255,0.7)',
        boxShadow: '0 0 4px rgba(255,255,255,0.35)',
        animation: `pulseSoft ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
      }} />
    ))}
  </>
}

// ── Particle Layer ────────────────────────────────────────────
function ParticleLayer({ intensity = 0.5 }) {
  const particles = useMemo(() =>
    Array.from({ length: 10 }, () => ({
      x: 5 + Math.random() * 90,
      y: 20 + Math.random() * 60,
      size: 2 + Math.random() * 2.5,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 5,
      drift: -15 + Math.random() * 30,
      opacity: 0.12 + Math.random() * 0.18,
    })), [])

  const hue = 40 - intensity * 55
  const sat = 55 + intensity * 20

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {particles.map((p, i) => (
        <div key={i} className="absolute" style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: `hsl(${hue}, ${sat}%, 68%)`,
          boxShadow: `0 0 ${p.size * 3}px hsl(${hue}, ${sat}%, 58%)`,
          opacity: p.opacity,
          animation: `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
    </div>
  )
}

// ── Proxemic divider ──────────────────────────────────────────
function ProxemicDivider({ proxemic, xA, xB }) {
  if (!proxemic?.divider) return null
  const midPct = (xA + xB) / 2
  const styles = {
    tension: { color: 'rgba(200,140,50,0.20)', glow: 'rgba(200,140,50,0.12)' },
    hot:     { color: 'rgba(200,60,50,0.25)',  glow: 'rgba(200,60,50,0.16)' },
    cold:    { color: 'rgba(100,150,220,0.22)', glow: 'rgba(100,150,220,0.13)' },
  }
  const s = styles[proxemic.state] || { color: 'transparent', glow: 'transparent' }
  return (
    <div className="absolute pointer-events-none" style={{
      left: `${midPct}%`, top: '15%', bottom: '28%',
      width: '1px', transform: 'translateX(-50%)',
      background: `linear-gradient(180deg, transparent, ${s.color} 20%, ${s.color} 80%, transparent)`,
      boxShadow: `0 0 18px 8px ${s.glow}`,
      zIndex: 8, transition: 'all 0.8s ease',
    }} />
  )
}

// ── Floating mark button (pixel emotion icons) ──────────────
const MARK_EMOTIONS = [
  { key: 'angry',     src: '/assets/ui/emotions/angry.png',     label: '愤怒' },
  { key: 'confused',  src: '/assets/ui/emotions/confused.png',  label: '困惑' },
  { key: 'happy',     src: '/assets/ui/emotions/happy.png',     label: '开心' },
  { key: 'love',      src: '/assets/ui/emotions/love.png',      label: '爱' },
  { key: 'sleepy',    src: '/assets/ui/emotions/sleepy.png',    label: '疲惫' },
  { key: 'stressed',  src: '/assets/ui/emotions/stressed.png',  label: '压力' },
  { key: 'surprised', src: '/assets/ui/emotions/surprised.png', label: '惊讶' },
  { key: 'thinking',  src: '/assets/ui/emotions/thinking.png',  label: '思考' },
]

function FloatingMark({ onMark, phase }) {
  const [open, setOpen] = useState(false)

  if (phase === 'reflection' || phase === 'intro' || phase === 'end') return null

  return (
    <div className="absolute" style={{
      bottom: '16px', right: '14px',
      zIndex: 40,
      userSelect: 'none',
    }}>
      {/* Emotion icon grid (opens upward) */}
      {open && (
        <div className="grid grid-cols-2 gap-1.5 mb-2 anim-fadeIn" style={{ width: '82px' }}>
          {MARK_EMOTIONS.map(emo => (
            <button
              key={emo.key}
              onClick={() => { onMark(emo.key); setOpen(false) }}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              title={emo.label}
              style={{
                background: 'rgba(0,0,0,0.78)',
                border: '1px solid rgba(255,255,255,0.16)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              <img src={emo.src} alt={emo.label} style={{ width: '22px', height: '22px', imageRendering: 'pixelated' }} />
            </button>
          ))}
        </div>
      )}
      {/* Main toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-xl transition-all hover:opacity-90"
        title="标记当前时刻 / Mark moment"
        style={{
          padding: '6px 10px',
          background: open ? 'rgba(212,168,82,0.22)' : 'rgba(0,0,0,0.72)',
          border: `1.5px solid ${open ? 'rgba(212,168,82,0.5)' : 'rgba(255,255,255,0.18)'}`,
          backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        {open
          ? <span style={{ fontSize: '14px' }}>✕</span>
          : <img src="/assets/ui/emotions/thinking.png" alt="" style={{ width: '18px', height: '18px', imageRendering: 'pixelated' }} />
        }
        {!open && <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>标记</span>}
      </button>
    </div>
  )
}

// ── Character Sprite (PNG sprite with crossfade + PixelChar SVG fallback) ─
// Load order:
//   1. /sprites/{spriteType}/{emotionKey}.png  (Stardew-style sprites)
//   2. /assets/sprites/{persona.id}/{emotionKey}.png  (legacy per-persona)
//   3. PixelChar SVG (always available fallback)
function CharacterSprite({ persona, spPose, facing, scale = 1.0, glow = true }) {
  const [loadStage, setLoadStage] = useState(0)  // 0=primary, 1=legacy, 2=svg
  const [prevPose, setPrevPose] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  const emotionKey = EMOTION_TO_SPRITE[spPose] || 'neutral'
  const spriteType = persona.spriteType || (persona.id === 'A' ? 'female' : 'male')

  const sources = [
    `/sprites/${spriteType}/${emotionKey}.png`,
    `/assets/sprites/${persona.id}/${emotionKey}.png`,
  ]

  // Reset load stage when emotion changes; trigger crossfade
  const prevEmotionRef = useRef(emotionKey)
  useEffect(() => {
    if (prevEmotionRef.current !== emotionKey) {
      setPrevPose(prevEmotionRef.current)
      setTransitioning(true)
      prevEmotionRef.current = emotionKey
      setLoadStage(0)
      const timer = setTimeout(() => { setTransitioning(false); setPrevPose(null) }, 350)
      return () => clearTimeout(timer)
    }
  }, [emotionKey, spriteType])

  const charScale = scale * 0.86 * 1.5

  const baseStyle = {
    height: `${190 * charScale}px`,
    imageRendering: 'pixelated',
    transform: facing === 'left' ? 'scaleX(-1)' : 'none',
    filter: glow ? `drop-shadow(0 0 12px ${persona.glowColor})` : 'none',
    display: 'block',
    transition: 'opacity 0.35s ease, height 0.3s ease, filter 0.3s ease',
  }

  // All PNG sources exhausted → SVG fallback
  if (loadStage >= sources.length) {
    return (
      <PixelChar
        persona={persona}
        emotion={spPose || 'neutral'}
        facing={facing || 'right'}
        lean="none"
        scale={charScale}
        glow={glow}
        features={persona.features || []}
      />
    )
  }

  const prevSrc = prevPose ? `/sprites/${spriteType}/${prevPose}.png` : null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Previous pose fading out */}
      {transitioning && prevSrc && (
        <img
          src={prevSrc}
          style={{ ...baseStyle, position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }}
          alt=""
        />
      )}
      {/* Current pose */}
      <img
        key={`${sources[loadStage]}-${emotionKey}`}
        src={sources[loadStage]}
        style={{ ...baseStyle, opacity: 1 }}
        alt=""
        onError={() => setLoadStage(prev => prev + 1)}
      />
    </div>
  )
}

// ── Character layer ───────────────────────────────────────────
function CharacterLayer({ beat, personas, thoughtVisibility, disputes, onDispute, scene }) {
  // Support both 'spatial' and 'characters' field names, with sensible defaults
  const spatial = beat.spatial || beat.characters || { A: { x: 30, facing: 'right', pose: 'neutral' }, B: { x: 70, facing: 'left', pose: 'neutral' } }
  const { thoughts, dialogue } = beat
  const speakerId = dialogue?.speaker || null   // which persona is speaking this beat
  // Per-scene character scale from SCENE_PRESETS (e.g. car=0.60, park=0.68, bedroom=0.78)
  const scenePreset = SCENE_PRESETS[scene] || SCENE_PRESETS.bedroom_night
  const sceneCharScale = scenePreset.charScale || 1.0

  return (
    <div className="absolute inset-0">
      {['A', 'B'].map(id => {
        const sp = spatial[id]
        if (!sp) return null
        if (sp.visible === false) return null  // explicitly hidden only
        const persona   = personas[id]
        const thought   = thoughts?.[id]
        const dispute   = disputes?.[`${id}-${beat.id}`]
        const isSpeaking = id === speakerId
        const isSilent   = speakerId !== null && !isSpeaking

        // CSS transform preserves scaleX for facing direction
        const scaleX = sp.facing === 'left' ? -1 : 1

        return (
          <div key={id} className="absolute" style={{
            left: `${sp.x}%`,
            bottom: '5%',           // on the floor line of backgrounds
            transform: 'translateX(-50%)',
            transition: 'left 0.9s cubic-bezier(0.4,0,0.2,1), bottom 0.9s ease',
            zIndex: isSpeaking ? 12 : 10,
          }}>
            {/* Thought bubble — NEVER dimmed, always full opacity */}
            <div className="relative" style={{ minHeight: '8px' }}>
              <ThoughtBubble
                thought={thought}
                personaId={id}
                visible={thoughtVisibility?.[id] ?? true}
                beatId={beat.id}
                dispute={dispute}
                onDispute={onDispute}
              />
            </div>
            {/* Character sprite — dim when silent (not speaking), but bubble stays bright */}
            <div style={{
              animation: isSpeaking
                ? `charBob 0.55s ease-in-out infinite`
                : `charBreathe 3s ease-in-out infinite`,
              '--char-sx': scaleX,
              opacity: isSilent ? 0.62 : 1.0,
              filter: isSilent ? 'brightness(0.72) saturate(0.75)' : 'none',
              transition: 'opacity 0.5s ease, filter 0.5s ease',
            }}>
              <CharacterSprite
                persona={persona}
                spPose={sp.pose || 'neutral'}
                facing={sp.facing || 'right'}
                scale={(sp.scale || 1.0) * sceneCharScale * 1.5}
                glow={true}
              />
            </div>
            {/* Speaking indicator — small pulsing dot below feet */}
            {isSpeaking && (
              <div style={{
                position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                width: '6px', height: '6px', borderRadius: '50%',
                background: persona.color,
                boxShadow: `0 0 8px ${persona.glowColor}`,
                animation: 'speakPulse 0.55s ease-in-out infinite',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Main Theater export
// ─────────────────────────────────────────────────────────────
export default function Theater({
  beat, personas, thoughtVisibility, phase,
  scene: sceneProp,          // from liveScenario.scene
  sceneElements: elsProp,    // from liveScenario.sceneElements
  disputes = {}, onDispute, onMark,
}) {
  if (!beat) return null

  const xA = beat.spatial?.A?.x ?? 30
  const xB = beat.spatial?.B?.x ?? 70
  const intensity = beat.intensity ?? 0.5

  // Scene comes from scenario prop, with fallback
  const scene = sceneProp || 'bedroom_night'
  const sceneElements = elsProp || []

  return (
    <div className="relative w-full h-full flex flex-col">

      {/* ── Outer: fills flex-1, centers the 16:9 scene, black letterbox bars ── */}
      <div className="relative flex-1 overflow-hidden flex items-center justify-center" style={{ background: '#0a0808' }}>

        {/* ── Inner: enforces 16:9 aspect ratio ── */}
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            height: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Background (PNG + CSS gradient fallback + scene elements) */}
          <SceneBackground scene={scene} intensity={intensity} sceneElements={sceneElements} />

          {/* Particles */}
          <ParticleLayer intensity={intensity} />

          {/* Proxemic divider */}
          <ProxemicDivider proxemic={beat.proxemic} xA={xA} xB={xB} />

          {/* Characters + thought bubbles */}
          <CharacterLayer
            beat={beat}
            personas={personas}
            thoughtVisibility={thoughtVisibility}
            disputes={disputes}
            onDispute={onDispute}
            scene={scene}
          />

          {/* ── Cinematic letterbox bands ── */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
            height: '14%', zIndex: 22,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 30%, transparent 100%)',
          }} />
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
            height: '10%', zIndex: 22,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.60) 30%, transparent 100%)',
          }} />

          {/* ── Narrator pill — lower-center of scene, large and readable ── */}
          {beat.narrator && (
            <div className="absolute left-0 right-0 flex justify-center anim-fadeIn" style={{
              top: '12%', transform: 'translateY(-50%)', zIndex: 25,
            }}>
              <div
                className="flex items-center gap-3 px-5 py-3 text-center"
                style={{
                  maxWidth: '70%',
                  background: 'rgba(0,0,0,0.74)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '10px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                }}
              >
                <span className="font-mono flex-shrink-0" style={{
                  fontSize: '12px', letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
                }}>
                  旁白
                </span>
                <span style={{
                  fontSize: '20px',
                  color: 'rgba(255,255,255,0.88)',
                  fontFamily: '"PingFang SC","Inter","Microsoft YaHei",sans-serif',
                  letterSpacing: '0.04em',
                  lineHeight: '1.65',
                  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                }}>
                  {beat.narrator}
                </span>
              </div>
            </div>
          )}

          {/* Floating mark button */}
          <FloatingMark onMark={onMark} phase={phase} />

          {/* Film grain */}
          <div className="absolute inset-0 pointer-events-none z-30 film-grain" />
        </div>
        {/* ── end 16:9 inner ── */}
      </div>
      {/* ── end outer ── */}

      {/* Subtitle — RPG dialogue box */}
      <Subtitle dialogue={beat.dialogue} personas={personas} />
    </div>
  )
}
