import { useState, useEffect, useRef, useCallback } from "react";

const FontLoader = () => {
  useEffect(() => {
    if (!document.querySelector("[data-sf]")) {
      const l = document.createElement("link");
      l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap";
      l.rel = "stylesheet"; l.setAttribute("data-sf","");
      document.head.appendChild(l);
    }
  },[]);
  return null;
};

const C = {
  bg:"#07070D", stage:"#0A0A12", card:"#0F0F1C",
  bd:"#181830", bd2:"#22223A", tx:"#E4E0D8", mu:"#42425E", dim:"#28283C",
  a:"#C8875E", aBg:"#150D06", aBd:"#2A1A0C",
  b:"#5AAEC2", bBg:"#060F14", bBd:"#0C2030",
  gr:"#5A9E76", re:"#B86060", yw:"#B8AA60", div:"#8E72B8",
};

// ── SCRIPT DATA ───────────────────────────────────────────────────────────────
const SCRIPT = [
  { id:0, speaker:"A", text:"我跟你说了一件重要的事。",
    innerA:"我需要他认真听我说，不只是点头。",
    innerB:"她在说话，但我在追这集的结尾。" },
  { id:1, speaker:"action", text:"他点了点头，继续看手机。",
    innerA:"他根本没在听。就这样敷衍我。",
    innerB:"我听着呢，只是没抬头。快结束了。" },
  { id:2, speaker:"A", text:"（沉默了很久）",
    innerA:"算了，说了也没用。",
    innerB:"她安静下来了，应该是说完了。" },
  { id:3, speaker:"A", text:"没事。",
    innerA:"我在等他追问。如果他在乎，他会追问的。",
    innerB:"她说没事，那就是真的没事了。" },
  { id:4, speaker:"action", text:"他看了眼消息，没有回复，继续看手机。",
    innerA:"他果然不在乎我。",
    innerB:"她说没事，我就当没事，尊重她说的。" },
  { id:5, speaker:"action", text:"那一晚，两个人都没有再开口。",
    innerA:"他就这样让一晚上过去了。什么都不说。",
    innerB:"气氛有点奇怪，但她说没事……我不确定要不要问。" },
];

// Each beat has 3 sub-states: 0=hidden, 1=dialogue visible, 2=inner visible
// Total ticks = SCRIPT.length * 2
const TOTAL_TICKS = SCRIPT.length * 2;
// ms per tick (how long before auto-advancing)
const TICK_MS = 2800;

// ── SIMULATED B ANNOTATIONS (for compare phase) ───────────────────────────────
const B_ANN = {
  0:{ val:"v", note:"" },
  1:{ val:"x", note:"他其实有在听，只是专注在手机上，不代表不在乎" },
  2:{ val:"x", note:"她沉默我有注意到，但以为她只是在想什么" },
  3:{ val:"x", note:"她说没事我就信了，我不知道这是在等我追问" },
  4:{ val:"v", note:"" },
  5:{ val:"q", note:"我感觉到气氛不对但不确定要不要问" },
};

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function SubtextApp() {
  const [phase, setPhase] = useState("intro");
  const [annB, setAnnB] = useState({});   // A's annotations of B's inner
  const [corrA, setCorrA] = useState({});  // A's corrections of their own inner
  const [corrAText, setCorrAText] = useState({});

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Outfit, sans-serif", color:C.tx }}>
      <FontLoader />
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes riseIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes driftIn { from{opacity:0;transform:translateY(5px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes blink   { 0%,100%{opacity:.2} 50%{opacity:.8} }
        .fade  { animation: fadeIn  .6s ease forwards }
        .rise  { animation: riseIn  .55s ease forwards }
        .drift { animation: driftIn .7s ease forwards }
        * { box-sizing:border-box }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:${C.bd2}; border-radius:2px }
      `}</style>

      {phase==="intro"       && <IntroPhase      onNext={()=>setPhase("watch")} />}
      {phase==="watch"       && <WatchPhase       onNext={()=>setPhase("annotate")} />}
      {phase==="annotate"    && <AnnotatePhase    annB={annB} setAnnB={setAnnB} onNext={()=>setPhase("selfcorrect")} />}
      {phase==="selfcorrect" && <SelfCorrectPhase corrA={corrA} setCorrA={setCorrA} corrAText={corrAText} setCorrAText={setCorrAText} onNext={()=>setPhase("compare")} />}
      {phase==="compare"     && <ComparePhase     annB={annB} corrA={corrA} corrAText={corrAText} onNext={()=>setPhase("negotiate")} />}
      {phase==="negotiate"   && <NegotiatePhase   onNext={()=>setPhase("done")} />}
      {phase==="done"        && <DonePhase        onReset={()=>setPhase("intro")} />}
    </div>
  );
}

// ── INTRO ─────────────────────────────────────────────────────────────────────
function IntroPhase({ onNext }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ maxWidth:500, textAlign:"center" }} className="fade">
        <p style={{ margin:"0 0 8px", fontSize:9, letterSpacing:"0.4em", color:C.mu, fontFamily:"DM Mono, monospace", textTransform:"uppercase" }}>SUBTEXT</p>
        <h1 style={{ margin:"0 0 20px", fontSize:44, fontWeight:300, fontFamily:"Cormorant Garamond, serif", lineHeight:1.15, letterSpacing:"-.01em" }}>
          说出口的，<br/>和没说出口的。
        </h1>
        <p style={{ margin:"0 0 32px", fontSize:14, color:C.mu, lineHeight:2 }}>
          你们各自提供了叙述。<br/>
          AI 重建了那段对话，<br/>
          并为每一刻补上了可能的内心独白。<br/><br/>
          现在，以旁观者的身份，你来看这一切。
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:32 }}>
          {[{l:"她（你）",c:C.a},{l:"他（对方）",c:C.b}].map(({l,c},i)=>(
            <div key={i} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${c}33`, background:c+"0A", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:c }}/>
              <span style={{ fontSize:12, color:c, fontFamily:"DM Mono, monospace" }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.bd}`, borderRadius:12, padding:"18px 22px", marginBottom:28, textAlign:"left" }}>
          {[
            ["01","观看","像导演一样，逐幕看 AI 重建的那段对话"],
            ["02","标注对方","评判 AI 对他内心的推断，符不符合你了解的他"],
            ["03","修正自己","确认或修正 AI 对你自己内心的推断"],
            ["04","对比 & 协商","看到双方的解读放在一起，说出各自的理由"],
          ].map(([n,t,d])=>(
            <div key={n} style={{ display:"flex", gap:14, marginBottom:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace", flexShrink:0, marginTop:2 }}>{n}</span>
              <div><span style={{ fontSize:13, color:C.tx, fontWeight:500 }}>{t}</span><span style={{ fontSize:12, color:C.mu, marginLeft:8 }}>{d}</span></div>
            </div>
          ))}
        </div>
        <button onClick={onNext} style={{ padding:"13px 40px", borderRadius:40, border:"none", background:C.tx, color:C.bg, fontSize:14, fontWeight:600, cursor:"pointer", letterSpacing:".02em" }}>
          升起幕布 →
        </button>
      </div>
    </div>
  );
}

// ── WATCH PHASE — theater script format with director controls ────────────────
function WatchPhase({ onNext }) {
  // tick: 0..TOTAL_TICKS-1
  // even tick = show dialogue line[tick/2]
  // odd tick  = show inner monologue for line[(tick-1)/2]
  const [tick, setTick] = useState(-1); // -1 = not started
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);
  const scriptRef = useRef(null);

  const advance = useCallback(() => {
    setTick(t => {
      if (t >= TOTAL_TICKS - 1) { setPlaying(false); return t; }
      return t + 1;
    });
  }, []);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(advance, TICK_MS);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, advance]);

  // auto-scroll to bottom
  useEffect(() => {
    scriptRef.current?.scrollIntoView({ behavior:"smooth", block:"end" });
  }, [tick]);

  const started = tick >= 0;
  const finished = tick >= TOTAL_TICKS - 1;

  // which lines to show, and whether inner is visible
  const lineStates = SCRIPT.map((line, idx) => {
    const showLine  = tick >= idx * 2;
    const showInner = tick >= idx * 2 + 1;
    return { line, showLine, showInner };
  });

  const pct = started ? Math.round(((tick + 1) / TOTAL_TICKS) * 100) : 0;

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Top bar */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"F0", backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.bd}`, padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:9, letterSpacing:"0.4em", color:C.mu, fontFamily:"DM Mono, monospace", textTransform:"uppercase" }}>SUBTEXT</span>
          <span style={{ width:1, height:14, background:C.bd, display:"inline-block" }}/>
          <span style={{ fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace" }}>
            {!started ? "准备就绪" : finished ? "演出结束" : `第 ${Math.floor(tick/2)+1} 幕 / ${SCRIPT.length}`}
          </span>
        </div>
        {finished && (
          <button onClick={onNext} style={{ padding:"6px 20px", borderRadius:20, border:"none", background:C.a, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>
            开始标注 →
          </button>
        )}
      </div>

      {/* Stage */}
      <div style={{ flex:1, maxWidth:680, width:"100%", margin:"0 auto", padding:"48px 24px 160px", position:"relative" }}>

        {/* Pre-start overlay */}
        {!started && (
          <div style={{ textAlign:"center", padding:"80px 0 0" }} className="fade">
            <p style={{ margin:"0 0 8px", fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>一段发生在某个普通夜晚的对话</p>
            <p style={{ margin:"0 0 48px", fontSize:18, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }}>你不在其中。你只是旁观。</p>
            <button onClick={()=>{ setTick(0); setPlaying(true); }} style={{ padding:"14px 44px", borderRadius:40, border:`1px solid ${C.bd2}`, background:C.card, color:C.tx, fontSize:14, fontWeight:500, cursor:"pointer", letterSpacing:".02em" }}>
              ▶ 开始放映
            </button>
          </div>
        )}

        {/* Script lines */}
        <div>
          {lineStates.map(({ line, showLine, showInner }, idx) => (
            showLine && <ScriptBeat key={line.id} line={line} showInner={showInner} idx={idx} isLatest={Math.floor(tick/2)===idx && !showInner} />
          ))}
        </div>

        {/* Cursor — waiting for inner */}
        {started && !finished && tick % 2 === 0 && (
          <div style={{ display:"flex", gap:5, justifyContent:"center", padding:"32px 0 0" }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:4, height:4, borderRadius:"50%", background:C.mu, animation:`blink 1.6s ${i*.28}s infinite` }}/>
            ))}
          </div>
        )}

        <div ref={scriptRef}/>
      </div>

      {/* Director controls — fixed bottom bar */}
      {started && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.bg+"F8", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.bd}`, padding:"14px 28px 18px", zIndex:100 }}>
          {/* Progress scrubber */}
          <div style={{ marginBottom:14, position:"relative" }}>
            <div style={{ height:2, background:C.dim, borderRadius:1, overflow:"hidden" }}>
              <div style={{ height:"100%", background:C.mu, width:`${pct}%`, transition:"width .4s ease", borderRadius:1 }}/>
            </div>
            {/* Beat markers */}
            <div style={{ position:"absolute", top:-2, left:0, right:0, height:6, display:"flex" }}>
              {SCRIPT.map((_,i)=>(
                <div key={i} style={{ flex:1, display:"flex", justifyContent:"center" }}>
                  <div style={{ width:1, height:6, background: tick >= i*2 ? C.mu : C.dim, borderRadius:1, transition:"background .3s" }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Controls row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            {/* Left: beat labels */}
            <div style={{ display:"flex", gap:8, flex:1 }}>
              {SCRIPT.map((line,i) => {
                const active = Math.floor(tick/2) === i;
                const done   = tick >= i*2+1;
                return (
                  <button key={i} onClick={()=>{ setTick(i*2); setPlaying(false); }} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${active?C.mu:C.dim}`, background:active?C.card:C.bg, color:active?C.tx:C.mu, fontSize:10, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s", opacity:done?.85:active?1:.5 }}>
                    幕{i+1}
                  </button>
                );
              })}
            </div>

            {/* Center: main controls */}
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              {/* Rewind */}
              <button onClick={()=>{ setTick(Math.max(0, tick-2)); setPlaying(false); }} style={{ width:36, height:36, borderRadius:"50%", border:`1px solid ${C.bd2}`, background:C.card, color:C.mu, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>
                ⏮
              </button>
              {/* Step back */}
              <button onClick={()=>{ setTick(t=>Math.max(0,t-1)); setPlaying(false); }} style={{ width:36, height:36, borderRadius:"50%", border:`1px solid ${C.bd2}`, background:C.card, color:C.mu, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>
                ◀
              </button>
              {/* Play/Pause */}
              <button onClick={()=>{ if(finished){ setTick(0); setPlaying(true); } else setPlaying(p=>!p); }} style={{ width:48, height:48, borderRadius:"50%", border:"none", background:finished?C.gr:playing?C.re:C.tx, color:C.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, transition:"background .25s" }}>
                {finished ? "↺" : playing ? "⏸" : "▶"}
              </button>
              {/* Step forward */}
              <button onClick={()=>{ setTick(t=>Math.min(TOTAL_TICKS-1,t+1)); setPlaying(false); }} disabled={finished} style={{ width:36, height:36, borderRadius:"50%", border:`1px solid ${C.bd2}`, background:C.card, color:finished?C.dim:C.mu, cursor:finished?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>
                ▶
              </button>
              {/* Skip to end */}
              <button onClick={()=>{ setTick(TOTAL_TICKS-1); setPlaying(false); }} disabled={finished} style={{ width:36, height:36, borderRadius:"50%", border:`1px solid ${C.bd2}`, background:C.card, color:finished?C.dim:C.mu, cursor:finished?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>
                ⏭
              </button>
            </div>

            {/* Right: speed / label */}
            <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
              <span style={{ fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace" }}>
                {playing ? "▶ 放映中" : finished ? "演出结束" : "⏸ 已暂停"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SCRIPT BEAT — theater format ──────────────────────────────────────────────
function ScriptBeat({ line, showInner, idx, isLatest }) {
  const isAction = line.speaker === "action";
  const isA = line.speaker === "A";
  const isB = line.speaker === "B";

  return (
    <div className="rise" style={{ marginBottom:48, animationDelay:`0s` }}>
      {/* Stage direction / action */}
      {isAction && (
        <div style={{ textAlign:"center", marginBottom: showInner ? 20 : 0 }}>
          <p style={{ margin:0, fontSize:13, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.8, letterSpacing:".02em" }}>
            [ {line.text} ]
          </p>
        </div>
      )}

      {/* Dialogue */}
      {!isAction && (
        <div style={{ textAlign:"center", marginBottom: showInner ? 20 : 0 }}>
          <p style={{ margin:"0 0 10px", fontSize:10, letterSpacing:"0.3em", color: isA ? C.a : C.b, fontFamily:"DM Mono, monospace", textTransform:"uppercase" }}>
            {isA ? "她" : "他"}
          </p>
          <p style={{ margin:0, fontSize:24, fontWeight:300, color:C.tx, fontFamily:"Cormorant Garamond, serif", lineHeight:1.5, letterSpacing:"0.01em" }}>
            {line.text}
          </p>
        </div>
      )}

      {/* Inner monologues — two columns */}
      {showInner && (
        <div className="drift" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:4 }}>
          {/* A's inner */}
          <div style={{ textAlign:"right", padding:"0 20px 0 0", borderRight:`1px solid ${C.aBd}` }}>
            <p style={{ margin:"0 0 4px", fontSize:9, color:C.a+"88", fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>她的内心</p>
            <p style={{ margin:0, fontSize:14, color:C.a+"BB", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.8 }}>
              {line.innerA}
            </p>
          </div>
          {/* B's inner */}
          <div style={{ padding:"0 0 0 20px", borderLeft:`1px solid ${C.bBd}` }}>
            <p style={{ margin:"0 0 4px", fontSize:9, color:C.b+"88", fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>他的内心</p>
            <p style={{ margin:0, fontSize:14, color:C.b+"BB", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.8 }}>
              {line.innerB}
            </p>
          </div>
        </div>
      )}

      {/* Separator between beats */}
      {showInner && <div style={{ marginTop:40, height:1, background:`linear-gradient(to right, transparent, ${C.bd}, transparent)` }}/>}
    </div>
  );
}

// ── ANNOTATE PHASE ────────────────────────────────────────────────────────────
function AnnotatePhase({ annB, setAnnB, onNext }) {
  const [reasons, setReasons] = useState({});
  const allDone = SCRIPT.every(l => annB[l.id]);

  return (
    <div style={{ minHeight:"100vh" }}>
      <TopBar label="标注他的内心" labelColor={C.b} progress={`${Object.keys(annB).length} / ${SCRIPT.length}`} done={allDone} onNext={onNext} nextLabel="下一步 →"/>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 4px", fontSize:10, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>你在标注的是</p>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:300, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3 }}>AI 对他内心的推断，符合你对他的了解吗？</h2>
          <p style={{ margin:0, fontSize:13, color:C.mu, lineHeight:1.8 }}>不是评判他对不对，而是：这个 AI 画的他，像不像你认识的那个人。</p>
        </div>
        {SCRIPT.map((line, idx) => {
          const ann = annB[line.id];
          const reason = reasons[line.id] || "";
          const annCol = {v:C.gr, x:C.re, q:C.yw}[ann] || C.mu;
          return (
            <div key={line.id} className="rise" style={{ marginBottom:12, animationDelay:`${idx*.06}s`, background:C.card, border:`1.5px solid ${ann?annCol+"44":C.bd}`, borderRadius:14, overflow:"hidden", transition:"border-color .25s" }}>
              <div style={{ padding:"11px 18px", borderBottom:`1px solid ${C.bd}`, display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:3, height:3, borderRadius:"50%", background: line.speaker==="A"?C.a:line.speaker==="B"?C.b:C.mu, flexShrink:0 }}/>
                <p style={{ margin:0, fontSize:12, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.5 }}>
                  {line.speaker==="action" ? "" : line.speaker==="A" ? "她：" : "他："}{line.text}
                </p>
              </div>
              <div style={{ padding:"14px 18px" }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:"0 0 4px", fontSize:9, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>AI 推断他的内心</p>
                    <p style={{ margin:0, fontSize:15, color:C.b+"BB", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7 }}>{line.innerB}</p>
                  </div>
                  <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                    {[{v:"v",l:"✓ 像他",c:C.gr},{v:"x",l:"✗ 不像",c:C.re},{v:"q",l:"? 不确定",c:C.yw}].map(({v,l,c})=>(
                      <button key={v} onClick={()=>{ setAnnB(p=>({...p,[line.id]:v})); }} style={{ padding:"6px 11px", borderRadius:8, border:`1.5px solid ${ann===v?c:C.bd2}`, background:ann===v?c+"18":C.dim, color:ann===v?c:C.mu, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s", whiteSpace:"nowrap" }}>{l}</button>
                    ))}
                  </div>
                </div>
                {ann==="x" && (
                  <div style={{ marginTop:12 }} className="rise">
                    <p style={{ margin:"0 0 5px", fontSize:10, color:C.re, fontFamily:"DM Mono, monospace" }}>他为什么不会这样？</p>
                    <input value={reason} onChange={e=>setReasons(p=>({...p,[line.id]:e.target.value}))} placeholder="因为他……" style={{ width:"100%", padding:"10px 14px", background:C.stage, border:`1.5px solid ${C.re}44`, borderRadius:9, color:C.tx, fontSize:13, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }} onFocus={e=>e.target.style.borderColor=C.re+"99"} onBlur={e=>e.target.style.borderColor=C.re+"44"} />
                    <p style={{ margin:"5px 0 0", fontSize:10, color:C.mu }}>这是整个 session 里最重要的数据。</p>
                  </div>
                )}
                {ann==="q" && (
                  <div style={{ marginTop:12 }} className="rise">
                    <input value={reason} onChange={e=>setReasons(p=>({...p,[line.id]:e.target.value}))} placeholder="我不确定，因为……（可选）" style={{ width:"100%", padding:"10px 14px", background:C.stage, border:`1.5px solid ${C.yw}33`, borderRadius:9, color:C.tx, fontSize:13, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }} onFocus={e=>e.target.style.borderColor=C.yw+"77"} onBlur={e=>e.target.style.borderColor=C.yw+"33"} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SELF CORRECT PHASE ────────────────────────────────────────────────────────
function SelfCorrectPhase({ corrA, setCorrA, corrAText, setCorrAText, onNext }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const allDone = SCRIPT.every(l => corrA[l.id]);

  const saveEdit = (id) => {
    setCorrAText(p=>({...p,[id]:draft}));
    setCorrA(p=>({...p,[id]:"edited"}));
    setEditing(null);
  };

  return (
    <div style={{ minHeight:"100vh" }}>
      <TopBar label="修正你自己的内心" labelColor={C.a} progress={`${Object.keys(corrA).length} / ${SCRIPT.length}`} done={allDone} onNext={onNext} nextLabel="看对比 →"/>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 4px", fontSize:10, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>换到你自己</p>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:300, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3 }}>AI 对你内心的推断，准确吗？</h2>
          <p style={{ margin:0, fontSize:13, color:C.mu, lineHeight:1.8 }}>如果不准确，写下你当时真正在想的——这会成为对比的基础。</p>
        </div>
        {SCRIPT.map((line, idx) => {
          const corr = corrA[line.id];
          const corrCol = {v:C.gr, x:C.re, edited:C.a}[corr] || C.mu;
          return (
            <div key={line.id} className="rise" style={{ marginBottom:10, animationDelay:`${idx*.06}s`, background:C.card, border:`1.5px solid ${corr?corrCol+"44":C.bd}`, borderRadius:14, overflow:"hidden", transition:"border-color .25s" }}>
              <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.bd}` }}>
                <p style={{ margin:0, fontSize:12, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }}>
                  {line.speaker==="action"?"":line.speaker==="A"?"她：":"他："}{line.text}
                </p>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:"0 0 3px", fontSize:9, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>{corr==="edited"?"你说实际上是":"AI 推断你的内心"}</p>
                    <p style={{ margin:0, fontSize:15, color:corr==="edited"?C.a:C.a+"88", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>{corr==="edited"?corrAText[line.id]:line.innerA}</p>
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    <button onClick={()=>setCorrA(p=>({...p,[line.id]:"v"}))} style={{ padding:"6px 11px", borderRadius:8, border:`1.5px solid ${corr==="v"?C.gr:C.bd2}`, background:corr==="v"?C.gr+"18":C.dim, color:corr==="v"?C.gr:C.mu, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s" }}>✓ 准确</button>
                    <button onClick={()=>{ setCorrA(p=>({...p,[line.id]:"x"})); setEditing(line.id); setDraft(""); }} style={{ padding:"6px 11px", borderRadius:8, border:`1.5px solid ${corr==="edited"?C.a:C.bd2}`, background:corr==="edited"?C.a+"18":C.dim, color:corr==="edited"?C.a:C.mu, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s" }}>✎ 修正</button>
                  </div>
                </div>
                {editing===line.id && (
                  <div style={{ marginTop:12 }} className="rise">
                    <textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)} placeholder="我当时实际上在想……" style={{ width:"100%", padding:"10px 14px", background:C.stage, border:`1.5px solid ${C.a}55`, borderRadius:9, color:C.tx, fontSize:13, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", resize:"none", minHeight:64, lineHeight:1.7 }} onFocus={e=>e.target.style.borderColor=C.a+"99"} onBlur={e=>e.target.style.borderColor=C.a+"55"}/>
                    <div style={{ display:"flex", gap:8, marginTop:6 }}>
                      <button onClick={()=>setEditing(null)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:11, cursor:"pointer" }}>取消</button>
                      <button onClick={()=>saveEdit(line.id)} style={{ padding:"6px 18px", borderRadius:8, border:"none", background:C.a, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>保存</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COMPARE PHASE — inline divergence in script format ────────────────────────
function ComparePhase({ annB, corrA, corrAText, onNext }) {
  const [expanded, setExpanded] = useState(new Set());
  const toggle = (id) => setExpanded(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const divCount = SCRIPT.filter(l => B_ANN[l.id]?.val==="x"||B_ANN[l.id]?.val==="q").length;

  return (
    <div style={{ minHeight:"100vh" }}>
      <TopBar label={`⚡ ${divCount} 处分歧`} labelColor={C.div} done={true} onNext={onNext} nextLabel="开始协商 →"/>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 4px", fontSize:10, color:C.div, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>他做完了他的 session</p>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:300, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3 }}>他对 AI 关于你内心的推断，这样说。</h2>
          <p style={{ margin:0, fontSize:13, color:C.mu, lineHeight:1.8 }}>⚡ 标记的地方是分歧点，点击展开。</p>
        </div>

        {SCRIPT.map((line, idx) => {
          const bAnn = B_ANN[line.id];
          const isDiv = bAnn?.val==="x"||bAnn?.val==="q";
          const open = expanded.has(line.id);
          const aInner = corrA[line.id]==="edited" ? corrAText[line.id] : line.innerA;

          return (
            <div key={line.id} className="rise" style={{ marginBottom:0, animationDelay:`${idx*.05}s` }}>
              {/* Script line */}
              <div onClick={()=>isDiv&&toggle(line.id)} style={{ padding:"16px 20px", cursor:isDiv?"pointer":"default", display:"flex", gap:14, alignItems:"center", borderLeft:`3px solid ${isDiv?(open?C.div:C.div+"66"):C.bd}`, marginBottom:1, transition:"border-color .25s", background: open?C.card+"88":"transparent", borderRadius: open?"8px 8px 0 0":"0" }}>
                <span style={{ fontSize:13, flexShrink:0, opacity: isDiv?1:.35 }}>{isDiv?"⚡":"  "}</span>
                <div style={{ flex:1 }}>
                  {line.speaker!=="action" && <p style={{ margin:"0 0 2px", fontSize:9, letterSpacing:"0.2em", color: line.speaker==="A"?C.a:C.b, fontFamily:"DM Mono, monospace", textTransform:"uppercase" }}>{line.speaker==="A"?"她":"他"}</p>}
                  <p style={{ margin:0, fontSize:15, color:isDiv?C.tx:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:line.speaker==="action"?"italic":"normal", lineHeight:1.5 }}>
                    {line.speaker==="action"?`[ ${line.text} ]`:line.text}
                  </p>
                </div>
                {isDiv && <span style={{ fontSize:10, color:C.mu }}>{open?"▲":"▼"}</span>}
              </div>

              {/* Expanded divergence */}
              {open && isDiv && (
                <div className="drift" style={{ padding:"16px 20px 20px", background:C.card, borderLeft:`3px solid ${C.div}`, borderRadius:"0 0 8px 8px", marginBottom:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <div style={{ padding:"12px 14px", background:C.aBg, border:`1px solid ${C.aBd}`, borderRadius:10 }}>
                      <p style={{ margin:"0 0 4px", fontSize:9, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>你说你当时在想</p>
                      <p style={{ margin:0, fontSize:14, color:C.a+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7 }}>{aInner}</p>
                    </div>
                    <div style={{ padding:"12px 14px", background:C.bBg, border:`1px solid ${C.bBd}`, borderRadius:10 }}>
                      <p style={{ margin:"0 0 4px", fontSize:9, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>他以为你当时在想</p>
                      {bAnn?.note ? (
                        <p style={{ margin:0, fontSize:14, color:C.b+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7 }}>{bAnn.note}</p>
                      ) : (
                        <p style={{ margin:0, fontSize:13, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }}>他说不确定你在想什么</p>
                      )}
                    </div>
                  </div>
                  <div style={{ padding:"10px 14px", background:C.div+"0A", border:`1px solid ${C.div}22`, borderRadius:8 }}>
                    <p style={{ margin:0, fontSize:12, color:C.div }}>这个地方，你们的理解不一样。下一步你们会各自说说为什么。</p>
                  </div>
                </div>
              )}
              {!open && <div style={{ height:1, background:C.bd, marginBottom:1 }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── NEGOTIATE PHASE — structured per-divergence dialogue ─────────────────────
function NegotiatePhase({ onNext }) {
  const divergences = SCRIPT.filter(l => B_ANN[l.id]?.val==="x"||B_ANN[l.id]?.val==="q");
  const [current, setCurrent] = useState(0);
  const [aReply, setAReply] = useState({});
  const [bReply, setBReply] = useState({});
  const [insight, setInsight] = useState({});
  const [step, setStep] = useState("a"); // a → b → insight → next

  const line = divergences[current];
  const isLast = current === divergences.length - 1;
  const aVal = aReply[line?.id] || "";
  const bVal = bReply[line?.id] || "";
  const insVal = insight[line?.id] || "";

  const allInsights = divergences.every(l => insight[l.id]?.trim());

  if (!line) return null;

  return (
    <div style={{ minHeight:"100vh" }}>
      <TopBar label="协商" labelColor={C.div} progress={`${current+1} / ${divergences.length}`} done={allInsights} onNext={onNext} nextLabel="完成 →"/>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 24px 80px" }}>

        {/* Progress dots */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:36 }}>
          {divergences.map((_,i)=>(
            <div key={i} onClick={()=>{ setCurrent(i); setStep("a"); }} style={{ width: i===current?24:8, height:8, borderRadius:4, background: insight[divergences[i].id]?C.gr:i===current?C.div:C.dim, cursor:"pointer", transition:"all .3s" }}/>
          ))}
        </div>

        {/* The moment */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <p style={{ margin:"0 0 6px", fontSize:9, color:C.div, fontFamily:"DM Mono, monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>分歧点 {current+1}</p>
          <div style={{ display:"inline-block", padding:"10px 20px", background:C.card, border:`1px solid ${C.div}33`, borderRadius:10 }}>
            <p style={{ margin:0, fontSize:15, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:line.speaker==="action"?"italic":"normal", lineHeight:1.5 }}>
              {line.speaker==="action" ? `[ ${line.text} ]` : line.text}
            </p>
          </div>
        </div>

        {/* Step A — her turn */}
        <div style={{ marginBottom:20, opacity:step==="a"||step==="b"||step==="insight"?1:.4, transition:"opacity .3s" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.a }}/>
            <p style={{ margin:0, fontSize:11, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>她（你）</p>
          </div>
          <div style={{ padding:"12px 16px", background:C.aBg, border:`1px solid ${C.aBd}`, borderRadius:10, marginBottom:10 }}>
            <p style={{ margin:"0 0 2px", fontSize:10, color:C.a+"88", fontFamily:"DM Mono, monospace" }}>你说你当时在想</p>
            <p style={{ margin:0, fontSize:14, color:C.a+"BB", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>{line.innerA}</p>
          </div>
          <p style={{ margin:"0 0 8px", fontSize:12, color:C.mu, lineHeight:1.7 }}>
            现在知道他以为你在想的是另一回事——<br/>
            <span style={{ color:C.tx }}>这让你意外吗？你想说什么？</span>
          </p>
          <textarea value={aVal} onChange={e=>setAReply(p=>({...p,[line.id]:e.target.value}))} disabled={step!=="a"} placeholder="我想说……" style={{ width:"100%", padding:"12px 16px", background:step==="a"?C.stage:C.dim, border:`1.5px solid ${step==="a"?C.a+"55":C.bd}`, borderRadius:10, color:C.tx, fontSize:14, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", resize:"none", minHeight:80, lineHeight:1.8, opacity:step==="a"?1:.7, transition:"all .25s" }} onFocus={e=>e.target.style.borderColor=C.a+"99"} onBlur={e=>e.target.style.borderColor=C.a+"55"}/>
          {step==="a" && (
            <button onClick={()=>setStep("b")} disabled={!aVal.trim()} style={{ marginTop:10, padding:"9px 24px", borderRadius:24, border:"none", background:aVal.trim()?C.a:C.dim, color:aVal.trim()?"#fff":C.mu, fontSize:12, fontWeight:600, cursor:aVal.trim()?"pointer":"default", transition:"all .25s" }}>
              他来说 →
            </button>
          )}
        </div>

        {/* Step B — his turn (simulated) */}
        {(step==="b"||step==="insight") && (
          <div className="rise" style={{ marginBottom:20 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:C.b }}/>
              <p style={{ margin:0, fontSize:11, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>他（对方）</p>
            </div>
            <div style={{ padding:"12px 16px", background:C.bBg, border:`1px solid ${C.bBd}`, borderRadius:10, marginBottom:10 }}>
              <p style={{ margin:"0 0 2px", fontSize:10, color:C.b+"88", fontFamily:"DM Mono, monospace" }}>他以为你当时在想</p>
              <p style={{ margin:0, fontSize:14, color:C.b+"BB", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>{B_ANN[line.id]?.note || "他说不确定"}</p>
            </div>
            <p style={{ margin:"0 0 8px", fontSize:12, color:C.mu, lineHeight:1.7 }}>
              现在知道她刚才说的——<br/>
              <span style={{ color:C.tx }}>为什么你当时会这样理解？</span>
            </p>
            <textarea value={bVal} onChange={e=>setBReply(p=>({...p,[line.id]:e.target.value}))} disabled={step!=="b"} placeholder="因为……" style={{ width:"100%", padding:"12px 16px", background:step==="b"?C.stage:C.dim, border:`1.5px solid ${step==="b"?C.b+"55":C.bd}`, borderRadius:10, color:C.tx, fontSize:14, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", resize:"none", minHeight:80, lineHeight:1.8, opacity:step==="b"?1:.7, transition:"all .25s" }} onFocus={e=>e.target.style.borderColor=C.b+"99"} onBlur={e=>e.target.style.borderColor=C.b+"55"}/>
            {step==="b" && (
              <button onClick={()=>setStep("insight")} disabled={!bVal.trim()} style={{ marginTop:10, padding:"9px 24px", borderRadius:24, border:"none", background:bVal.trim()?C.b:C.dim, color:bVal.trim()?"#fff":C.mu, fontSize:12, fontWeight:600, cursor:bVal.trim()?"pointer":"default", transition:"all .25s" }}>
                一起看 →
              </button>
            )}
          </div>
        )}

        {/* Step insight — final reflection on this divergence */}
        {step==="insight" && (
          <div className="drift" style={{ marginBottom:24 }}>
            <div style={{ padding:"16px 18px", background:C.div+"0C", border:`1px solid ${C.div}33`, borderRadius:12, marginBottom:16 }}>
              <p style={{ margin:"0 0 8px", fontSize:10, color:C.div, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>你们刚才说的</p>
              <p style={{ margin:"0 0 4px", fontSize:13, color:C.a+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7 }}>她说：{aReply[line.id]}</p>
              <div style={{ height:1, background:C.div+"22", margin:"10px 0" }}/>
              <p style={{ margin:0, fontSize:13, color:C.b+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7 }}>他说：{bReply[line.id]}</p>
            </div>
            <p style={{ margin:"0 0 8px", fontSize:12, color:C.mu, lineHeight:1.7 }}>
              <span style={{ color:C.tx }}>看完这个，你们对那一刻有什么新的理解？</span>（任何一方都可以写）
            </p>
            <textarea value={insVal} onChange={e=>setInsight(p=>({...p,[line.id]:e.target.value}))} placeholder="现在我觉得……" style={{ width:"100%", padding:"12px 16px", background:C.stage, border:`1.5px solid ${C.div}44`, borderRadius:10, color:C.tx, fontSize:14, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", resize:"none", minHeight:70, lineHeight:1.8 }} onFocus={e=>e.target.style.borderColor=C.div+"88"} onBlur={e=>e.target.style.borderColor=C.div+"44"}/>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
              <button onClick={()=>{ if(!isLast){ setCurrent(c=>c+1); setStep("a"); } else if(allInsights){ onNext(); } }} disabled={!insVal.trim()} style={{ padding:"10px 28px", borderRadius:24, border:"none", background:insVal.trim()?(isLast?C.gr:C.div):C.dim, color:insVal.trim()?"#fff":C.mu, fontSize:13, fontWeight:600, cursor:insVal.trim()?"pointer":"default", transition:"all .25s" }}>
                {isLast ? "完成 →" : "下一个分歧 →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DONE ──────────────────────────────────────────────────────────────────────
function DonePhase({ onReset }) {
  const divN = SCRIPT.filter(l=>B_ANN[l.id]?.val==="x"||B_ANN[l.id]?.val==="q").length;
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ maxWidth:460, textAlign:"center" }} className="fade">
        <p style={{ margin:"0 0 20px", fontSize:28, color:C.tx }}>◎</p>
        <h2 style={{ margin:"0 0 12px", fontSize:32, fontWeight:300, fontFamily:"Cormorant Garamond, serif", lineHeight:1.25, letterSpacing:"-.01em" }}>
          你们看了同一场戏，<br/>在不同的地方停下。
        </h2>
        <p style={{ margin:"0 0 28px", fontSize:14, color:C.mu, lineHeight:2 }}>
          共找到 {divN} 处分歧。<br/>
          你们各自说出了理由。<br/>
          这些对话被记录下来了。
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={onReset} style={{ padding:"11px 24px", borderRadius:24, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:13, cursor:"pointer" }}>重新体验</button>
          <button style={{ padding:"11px 28px", borderRadius:24, border:"none", background:C.tx, color:C.bg, fontSize:13, fontWeight:600, cursor:"pointer" }}>保存记录 →</button>
        </div>
      </div>
    </div>
  );
}

// ── SHARED TOP BAR ────────────────────────────────────────────────────────────
function TopBar({ label, labelColor, progress, done, onNext, nextLabel }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"F0", backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.bd}`, padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontSize:9, letterSpacing:"0.4em", color:C.mu, fontFamily:"DM Mono, monospace", textTransform:"uppercase" }}>SUBTEXT</span>
        <span style={{ width:1, height:14, background:C.bd, display:"inline-block" }}/>
        <span style={{ fontSize:11, color:labelColor||C.mu, fontFamily:"DM Mono, monospace" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {progress && <span style={{ fontSize:11, color:done?C.gr:C.mu, fontFamily:"DM Mono, monospace" }}>{progress}</span>}
        {done && onNext && (
          <button onClick={onNext} style={{ padding:"6px 20px", borderRadius:20, border:"none", background:C.gr, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>{nextLabel||"下一步 →"}</button>
        )}
      </div>
    </div>
  );
}
