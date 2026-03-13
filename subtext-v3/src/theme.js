// ── Color palette (inherited from subtext_v2 aesthetic) ─────────
export const C = {
  bg:    "#07070D",
  stage: "#0A0A12",
  card:  "#0F0F1C",
  bd:    "#181830",
  bd2:   "#22223A",
  tx:    "#E4E0D8",
  mu:    "#8888A8",   // was #42425E (contrast 2.1:1 → now ~5.9:1 against bg)
  mu2:   "#5E5E80",   // deep muted — only for decorative dividers, never for body text
  dim:   "#28283C",
  // Person A — amber/warm
  a:     "#C8875E",
  aBg:   "#150D06",
  aBd:   "#2A1A0C",
  // Person B — teal/cool
  b:     "#5AAEC2",
  bBg:   "#060F14",
  bBd:   "#0C2030",
  // State colors
  gr:    "#5A9E76",   // confirmed / match
  re:    "#B86060",   // rejected / mismatch
  yw:    "#B8AA60",   // uncertain
  div:   "#8E72B8",   // divergence / negotiate
}

// ── Global style string for injection ───────────────────────────
export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes riseIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes driftIn { from{opacity:0;transform:translateY(5px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes blink   { 0%,100%{opacity:.2} 50%{opacity:.8} }
  @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .fade  { animation: fadeIn  .6s ease forwards }
  .rise  { animation: riseIn  .55s ease forwards }
  .drift { animation: driftIn .7s ease forwards }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  ::-webkit-scrollbar { width: 4px }
  ::-webkit-scrollbar-track { background: transparent }
  ::-webkit-scrollbar-thumb { background: #22223A; border-radius: 2px }
  body { background: #07070D; color: #E4E0D8; font-family: Outfit, sans-serif }
`
