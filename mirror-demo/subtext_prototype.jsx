import { useState, useEffect, useRef } from "react";

// ── FONTS ─────────────────────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    if (!document.querySelector("[data-sf]")) {
      const l = document.createElement("link");
      l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap";
      l.rel = "stylesheet"; l.setAttribute("data-sf", "");
      document.head.appendChild(l);
    }
  }, []);
  return null;
};

// ── THEME ─────────────────────────────────────────────────────────────────────
const C = {
  bg:     "#08080E",
  stage:  "#0C0C14",
  card:   "#111120",
  bd:     "#1A1A2E",
  bd2:    "#252540",
  tx:     "#E8E4DC",
  mu:     "#4A4A6A",
  dm:     "#1C1C30",
  // A side — warm amber
  a:      "#D4956A",
  aBg:    "#1A1008",
  aBd:    "#2E1E10",
  // B side — cool teal
  b:      "#6AB4C8",
  bBg:    "#081418",
  bBd:    "#102030",
  // states
  gr:     "#6BAA88",
  re:     "#C87070",
  yw:     "#C8B870",
  // divergence
  div:    "#9B82C4",
};

// ── DEMO DATA ─────────────────────────────────────────────────────────────────
// Each line: { id, speaker: "A"|"B"|"action", text, innerA, innerB }
// innerA = AI's guess at A's inner state for this moment
// innerB = AI's guess at B's inner state for this moment
const SCRIPT = [
  {
    id: 0,
    speaker: "A",
    text: "我跟你说了一件重要的事。",
    innerA: "我需要他认真听我说，不只是点头。",
    innerB: "她在说话，但我在追这集的结尾。",
  },
  {
    id: 1,
    speaker: "action",
    text: "他点了点头，继续看手机。",
    innerA: "他根本没在听。就这样敷衍我。",
    innerB: "我听着呢，只是没抬头。快结束了。",
  },
  {
    id: 2,
    speaker: "A",
    text: "（沉默了很久）",
    innerA: "算了，说了也没用。",
    innerB: "她安静下来了，应该是说完了。",
  },
  {
    id: 3,
    speaker: "A",
    text: "没事。",
    innerA: "我在等他追问。如果他在乎，他会追问的。",
    innerB: "她说没事，那就是真的没事了。",
  },
  {
    id: 4,
    speaker: "action",
    text: "他看了眼消息，没有回复，继续看手机。",
    innerA: "他果然不在乎我。",
    innerB: "她说没事，我就当没事，尊重她说的。",
  },
  {
    id: 5,
    speaker: "action",
    text: "那一晚，两个人都没有再开口。",
    innerA: "他就这样让一晚上过去了。什么都不说。",
    innerB: "气氛有点奇怪，但她说没事……我不确定要不要问。",
  },
];

const PERSONAS = {
  A: { name: "她", pronoun: "她", color: C.a, bg: C.aBg, bd: C.aBd },
  B: { name: "他", pronoun: "他", color: C.b, bg: C.bBg, bd: C.bBd },
};

// ── STAGE ─────────────────────────────────────────────────────────────────────
// Simulates viewing as Person A — so A annotates B's inner monologue
// In real system, POV switches per user session

function SubtextApp() {
  const [phase, setPhase] = useState("intro"); 
  // intro → watching → annotate → selfcorrect → compare → done

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Outfit, sans-serif" }}>
      <FontLoader />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:.4; } 50% { opacity:1; } }
        @keyframes glow   { 0%,100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 24px 2px #6AB4C818; } }
        @keyframes floatIn{ from { opacity:0; transform:translateY(6px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .line-enter { animation: fadeUp .45s ease forwards; }
        .inner-float { animation: floatIn .5s ease forwards; }
      `}</style>

      {phase === "intro"       && <IntroPhase      onNext={() => setPhase("watching")} />}
      {phase === "watching"    && <WatchingPhase    onNext={() => setPhase("annotate")} />}
      {phase === "annotate"    && <AnnotatePhase    onNext={() => setPhase("selfcorrect")} />}
      {phase === "selfcorrect" && <SelfCorrectPhase onNext={() => setPhase("compare")} />}
      {phase === "compare"     && <ComparePhase     onNext={() => setPhase("done")} />}
      {phase === "done"        && <DonePhase        onReset={() => setPhase("intro")} />}
    </div>
  );
}

// ── INTRO ──────────────────────────────────────────────────────────────────────
function IntroPhase({ onNext }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ maxWidth:520, textAlign:"center", animation:"fadeUp .6s ease forwards" }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ margin:"0 0 6px", fontSize:10, letterSpacing:"0.3em", color:C.mu, textTransform:"uppercase", fontFamily:"DM Mono, monospace" }}>SUBTEXT</p>
          <h1 style={{ margin:"0 0 16px", fontSize:42, fontWeight:300, color:C.tx, fontFamily:"Cormorant Garamond, serif", lineHeight:1.15, letterSpacing:"-0.01em" }}>
            说出口的，<br />和没说出口的。
          </h1>
          <p style={{ margin:"0 0 28px", fontSize:14, color:C.mu, lineHeight:1.9 }}>
            你们都提供了各自的叙述。<br />
            AI 把那段对话重建出来，<br />
            同时为每一刻补上了可能的内心独白。<br /><br />
            现在，作为旁观者，你来看这一切。
          </p>
        </div>

        {/* Role indicator */}
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:32 }}>
          {["她（你）", "他（对方）"].map((label, i) => (
            <div key={i} style={{ padding:"10px 20px", borderRadius:10, background: i===0 ? C.aBg : C.bBg, border:`1px solid ${i===0?C.aBd:C.bBd}`, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background: i===0 ? C.a : C.b }} />
              <span style={{ fontSize:12, color: i===0 ? C.a : C.b, fontFamily:"DM Mono, monospace" }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ padding:"16px 20px", background:C.card, border:`1px solid ${C.bd}`, borderRadius:12, marginBottom:28, textAlign:"left" }}>
          <p style={{ margin:"0 0 10px", fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em" }}>接下来你会做什么</p>
          {[
            ["01", "观看", "看 AI 重建那段对话，内心独白会逐渐浮现"],
            ["02", "标注对方", "评判 AI 对他内心的推断是否符合你对他的了解"],
            ["03", "修正自己", "确认或修正 AI 对你自己内心的推断"],
            ["04", "对比", "看到你们双方的标注放在一起时发生了什么"],
          ].map(([n, title, desc]) => (
            <div key={n} style={{ display:"flex", gap:12, marginBottom:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace", flexShrink:0, marginTop:2 }}>{n}</span>
              <div>
                <span style={{ fontSize:13, color:C.tx, fontWeight:500 }}>{title}</span>
                <span style={{ fontSize:12, color:C.mu, marginLeft:8 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onNext} style={{ padding:"13px 40px", borderRadius:40, border:"none", background:C.tx, color:C.bg, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif", letterSpacing:"0.02em" }}>
          开始观看 →
        </button>
      </div>
    </div>
  );
}

// ── WATCHING PHASE ─────────────────────────────────────────────────────────────
function WatchingPhase({ onNext }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [visibleInner, setVisibleInner] = useState(new Set());
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (visibleLines >= SCRIPT.length) {
      setFinished(true);
      return;
    }
    const t = setTimeout(() => {
      setVisibleLines(v => v + 1);
      // show inner monologue 900ms after line appears
      const idx = visibleLines;
      setTimeout(() => {
        setVisibleInner(prev => new Set([...prev, idx]));
      }, 900);
    }, visibleLines === 0 ? 600 : 1800);
    return () => clearTimeout(t);
  }, [visibleLines, playing]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleLines, visibleInner]);

  const handlePlayPause = () => setPlaying(p => !p);
  const handleSkip = () => {
    setVisibleLines(SCRIPT.length);
    const all = new Set(SCRIPT.map((_,i)=>i));
    setVisibleInner(all);
    setFinished(true);
    setPlaying(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"EE", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.bd}`, padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <p style={{ margin:0, fontSize:10, letterSpacing:"0.3em", color:C.mu, textTransform:"uppercase", fontFamily:"DM Mono, monospace" }}>SUBTEXT</p>
          <div style={{ width:1, height:16, background:C.bd }} />
          <p style={{ margin:0, fontSize:11, color:C.mu, fontFamily:"DM Mono, monospace" }}>观看中 — {visibleLines} / {SCRIPT.length}</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {!finished && (
            <>
              <button onClick={handlePlayPause} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:11, cursor:"pointer", fontFamily:"DM Mono, monospace" }}>
                {playing ? "⏸ 暂停" : "▶ 继续"}
              </button>
              <button onClick={handleSkip} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:11, cursor:"pointer", fontFamily:"DM Mono, monospace" }}>
                跳过 →→
              </button>
            </>
          )}
          {finished && (
            <button onClick={onNext} style={{ padding:"6px 18px", borderRadius:20, border:"none", background:C.a, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>
              开始标注 →
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.1fr 1fr", gap:0, padding:"16px 28px 0", maxWidth:1100, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
        {[
          { label:"她的内心", sub:"AI 推断", col:C.a },
          { label:"发生的事", sub:"真实对话", col:C.mu },
          { label:"他的内心", sub:"AI 推断", col:C.b },
        ].map(({ label, sub, col }) => (
          <div key={label} style={{ textAlign:"center", padding:"8px 0 12px" }}>
            <p style={{ margin:"0 0 2px", fontSize:10, color:col, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>{label}</p>
            <p style={{ margin:0, fontSize:9, color:C.mu, fontFamily:"DM Mono, monospace" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Stage */}
      <div style={{ flex:1, padding:"0 28px 80px", maxWidth:1100, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
        {SCRIPT.slice(0, visibleLines).map((line, idx) => (
          <ScriptLine
            key={line.id}
            line={line}
            showInner={visibleInner.has(idx)}
            isLatest={idx === visibleLines - 1}
          />
        ))}

        {/* Playback cursor */}
        {playing && !finished && (
          <div style={{ display:"flex", justifyContent:"center", padding:"24px 0" }}>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:C.mu, animation:`pulse 1.4s ease ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div style={{ textAlign:"center", padding:"32px 0", animation:"fadeUp .5s ease forwards" }}>
            <div style={{ display:"inline-block", padding:"14px 28px", background:C.card, border:`1px solid ${C.bd2}`, borderRadius:12, marginBottom:20 }}>
              <p style={{ margin:"0 0 4px", fontSize:12, color:C.mu }}>你看完了这段对话。</p>
              <p style={{ margin:0, fontSize:13, color:C.tx, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }}>现在，对他的内心，你有什么想说的？</p>
            </div>
            <div>
              <button onClick={onNext} style={{ padding:"12px 32px", borderRadius:30, border:"none", background:C.b, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>
                标注他的内心 →
              </button>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function ScriptLine({ line, showInner, isLatest }) {
  const isAction = line.speaker === "action";
  const isA = line.speaker === "A";

  return (
    <div className={isLatest ? "line-enter" : ""} style={{ display:"grid", gridTemplateColumns:"1fr 1.1fr 1fr", gap:16, marginBottom:24, alignItems:"start" }}>
      {/* A's inner */}
      <div style={{ padding:"0 12px 0 0" }}>
        {showInner && (
          <div className="inner-float" style={{ padding:"12px 14px", background:C.aBg, border:`1px solid ${C.aBd}`, borderRadius:10, borderTopRightRadius:3 }}>
            <p style={{ margin:"0 0 4px", fontSize:9, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>她的内心</p>
            <p style={{ margin:0, fontSize:13, color:C.a+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7, opacity:.9 }}>{line.innerA}</p>
          </div>
        )}
      </div>

      {/* Real dialogue — center */}
      <div style={{ display:"flex", justifyContent:"center" }}>
        {isAction ? (
          <div style={{ padding:"10px 16px", background:C.dm, borderRadius:8, maxWidth:320, width:"100%" }}>
            <p style={{ margin:0, fontSize:12, color:C.mu, textAlign:"center", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>{line.text}</p>
          </div>
        ) : (
          <div style={{ maxWidth:300, width:"100%" }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", justifyContent: isA ? "flex-end" : "flex-start" }}>
              {!isA && <div style={{ width:28, height:28, borderRadius:"50%", background:C.bBg, border:`1px solid ${C.bBd}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:10, color:C.b }}>他</span>
              </div>}
              <div style={{ padding:"10px 14px", borderRadius:12, borderBottomRightRadius: isA ? 3 : 12, borderBottomLeftRadius: isA ? 12 : 3, background: isA ? C.a+"22" : C.b+"22", border:`1px solid ${isA ? C.a+"44" : C.b+"44"}`, maxWidth:220 }}>
                <p style={{ margin:0, fontSize:14, color: isA ? C.a : C.b, fontFamily:"Outfit, sans-serif", lineHeight:1.6 }}>{line.text}</p>
              </div>
              {isA && <div style={{ width:28, height:28, borderRadius:"50%", background:C.aBg, border:`1px solid ${C.aBd}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:10, color:C.a }}>她</span>
              </div>}
            </div>
          </div>
        )}
      </div>

      {/* B's inner */}
      <div style={{ padding:"0 0 0 12px" }}>
        {showInner && (
          <div className="inner-float" style={{ padding:"12px 14px", background:C.bBg, border:`1px solid ${C.bBd}`, borderRadius:10, borderTopLeftRadius:3 }}>
            <p style={{ margin:"0 0 4px", fontSize:9, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>他的内心</p>
            <p style={{ margin:0, fontSize:13, color:C.b+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7, opacity:.9 }}>{line.innerB}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ANNOTATE PHASE — user (A) annotates B's inner monologue ───────────────────
function AnnotatePhase({ onNext }) {
  const [annotations, setAnnotations] = useState({});
  const [reasons, setReasons] = useState({});
  const [activeReason, setActiveReason] = useState(null);

  const setAnn = (id, val) => {
    setAnnotations(p => ({ ...p, [id]: val }));
    if (val === "x") setActiveReason(id);
    else setActiveReason(null);
  };

  const allDone = SCRIPT.every(l => annotations[l.id]);

  return (
    <div style={{ minHeight:"100vh" }}>
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"EE", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.bd}`, padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <p style={{ margin:0, fontSize:10, letterSpacing:"0.3em", color:C.mu, textTransform:"uppercase", fontFamily:"DM Mono, monospace" }}>SUBTEXT</p>
          <div style={{ width:1, height:16, background:C.bd }} />
          <p style={{ margin:0, fontSize:11, color:C.b, fontFamily:"DM Mono, monospace" }}>标注他的内心</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:allDone?C.gr:C.mu, fontFamily:"DM Mono, monospace" }}>{Object.keys(annotations).length} / {SCRIPT.length}</span>
          {allDone && (
            <button onClick={onNext} style={{ padding:"6px 18px", borderRadius:20, border:"none", background:C.gr, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>
              下一步 →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth:780, margin:"0 auto", padding:"32px 24px 80px", boxSizing:"border-box" }}>
        <div style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 6px", fontSize:11, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>你在标注的是</p>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:300, color:C.tx, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3 }}>
            AI 对他内心的推断，符合你对他的了解吗？
          </h2>
          <p style={{ margin:0, fontSize:13, color:C.mu, lineHeight:1.7 }}>不是在评判他对不对，是在说：这个 AI 画的他，像不像你认识的那个人。</p>
        </div>

        {SCRIPT.map((line, idx) => {
          const ann = annotations[line.id];
          const reason = reasons[line.id] || "";
          const isOpen = activeReason === line.id;
          const annColor = { v:"#6BAA88", x:"#C87070", q:"#C8B870" }[ann] || C.mu;

          return (
            <div key={line.id} style={{ marginBottom:14, background:C.card, border:`1.5px solid ${ann ? annColor+"44" : C.bd}`, borderRadius:14, overflow:"hidden", transition:"border-color .25s", animation:`fadeUp .4s ease ${idx*0.06}s both` }}>
              {/* Real dialogue line */}
              <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.bd}`, display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:4, height:4, borderRadius:"50%", background: line.speaker==="A"?C.a:line.speaker==="B"?C.b:C.mu, flexShrink:0 }} />
                <p style={{ margin:0, fontSize:13, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.5 }}>
                  {line.speaker==="A" ? "她：" : line.speaker==="B" ? "他：" : ""}{line.text}
                </p>
              </div>

              {/* B's inner monologue + annotation */}
              <div style={{ padding:"14px 18px" }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:"0 0 4px", fontSize:9, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>AI 推断他的内心</p>
                    <p style={{ margin:0, fontSize:14, color:C.b+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.7 }}>{line.innerB}</p>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0, marginTop:2 }}>
                    {[
                      { val:"v", label:"✓ 对",  col:"#6BAA88" },
                      { val:"x", label:"✗ 不对", col:"#C87070" },
                      { val:"q", label:"? 不确定", col:"#C8B870" },
                    ].map(({ val, label, col }) => (
                      <button key={val} onClick={() => setAnn(line.id, val)} style={{ padding:"6px 12px", borderRadius:8, border:`1.5px solid ${ann===val ? col : C.bd2}`, background:ann===val ? col+"18" : C.dm, color:ann===val ? col : C.mu, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s", whiteSpace:"nowrap" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason input for ✗ */}
                {ann === "x" && (
                  <div style={{ marginTop:12, animation:"fadeUp .3s ease forwards" }}>
                    <p style={{ margin:"0 0 6px", fontSize:11, color:C.re, fontFamily:"DM Mono, monospace" }}>他为什么不会这样？</p>
                    <input
                      value={reason}
                      onChange={e => setReasons(p => ({ ...p, [line.id]: e.target.value }))}
                      placeholder="因为他……"
                      style={{ width:"100%", padding:"10px 14px", background:C.stage, border:`1.5px solid ${C.re}44`, borderRadius:9, color:C.tx, fontSize:13, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", boxSizing:"border-box" }}
                      onFocus={e => e.target.style.borderColor = C.re+"99"}
                      onBlur={e => e.target.style.borderColor = C.re+"44"}
                    />
                    <p style={{ margin:"5px 0 0", fontSize:10, color:C.mu }}>这句话是整个系统里最重要的数据。</p>
                  </div>
                )}
                {ann === "q" && (
                  <div style={{ marginTop:12, animation:"fadeUp .3s ease forwards" }}>
                    <input
                      value={reason}
                      onChange={e => setReasons(p => ({ ...p, [line.id]: e.target.value }))}
                      placeholder="我不确定，因为……（可选）"
                      style={{ width:"100%", padding:"10px 14px", background:C.stage, border:`1.5px solid ${C.yw}33`, borderRadius:9, color:C.tx, fontSize:13, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", boxSizing:"border-box" }}
                      onFocus={e => e.target.style.borderColor = C.yw+"77"}
                      onBlur={e => e.target.style.borderColor = C.yw+"33"}
                    />
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

// ── SELF-CORRECT PHASE — user (A) corrects AI's inference of A's own inner state ──
function SelfCorrectPhase({ onNext }) {
  const [corrections, setCorrections] = useState({});
  const [edits, setEdits] = useState({});
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const setCorr = (id, val) => {
    setCorrections(p => ({ ...p, [id]: val }));
    if (val === "x") { setEditing(id); setEditVal(""); }
    else setEditing(null);
  };
  const saveEdit = (id) => {
    setEdits(p => ({ ...p, [id]: editVal }));
    setCorrections(p => ({ ...p, [id]: "edited" }));
    setEditing(null);
  };

  const allDone = SCRIPT.every(l => corrections[l.id]);

  return (
    <div style={{ minHeight:"100vh" }}>
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"EE", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.bd}`, padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <p style={{ margin:0, fontSize:10, letterSpacing:"0.3em", color:C.mu, textTransform:"uppercase", fontFamily:"DM Mono, monospace" }}>SUBTEXT</p>
          <div style={{ width:1, height:16, background:C.bd }} />
          <p style={{ margin:0, fontSize:11, color:C.a, fontFamily:"DM Mono, monospace" }}>修正你自己的内心</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:allDone?C.gr:C.mu, fontFamily:"DM Mono, monospace" }}>{Object.keys(corrections).length} / {SCRIPT.length}</span>
          {allDone && (
            <button onClick={onNext} style={{ padding:"6px 18px", borderRadius:20, border:"none", background:C.gr, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>
              看对比 →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 80px", boxSizing:"border-box" }}>
        <div style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 6px", fontSize:11, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>现在换到你自己</p>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:300, color:C.tx, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3 }}>
            AI 对你内心的推断，准确吗？
          </h2>
          <p style={{ margin:0, fontSize:13, color:C.mu, lineHeight:1.7 }}>如果不准确，写下你当时真正在想的。这会成为对比的基础。</p>
        </div>

        {SCRIPT.map((line, idx) => {
          const corr = corrections[line.id];
          const corrCol = { v:C.gr, x:C.re, edited:C.a }[corr] || C.mu;

          return (
            <div key={line.id} style={{ marginBottom:12, background:C.card, border:`1.5px solid ${corr ? corrCol+"44" : C.bd}`, borderRadius:14, overflow:"hidden", transition:"border-color .25s", animation:`fadeUp .4s ease ${idx*0.06}s both` }}>
              <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.bd}` }}>
                <p style={{ margin:0, fontSize:12, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }}>
                  {line.speaker==="A" ? "她：" : line.speaker==="B" ? "他：" : ""}{line.text}
                </p>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:"0 0 3px", fontSize:9, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em" }}>
                      {corr==="edited" ? "你说实际上是" : "AI 推断你的内心"}
                    </p>
                    <p style={{ margin:0, fontSize:14, color: corr==="edited" ? C.a : C.a+"99", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>
                      {corr==="edited" ? edits[line.id] : line.innerA}
                    </p>
                  </div>
                  <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                    {[
                      { val:"v", label:"✓ 准确", col:C.gr },
                      { val:"x", label:"✗ 修正", col:C.re },
                    ].map(({ val, label, col }) => (
                      <button key={val} onClick={() => setCorr(line.id, val)} style={{ padding:"6px 11px", borderRadius:8, border:`1.5px solid ${corr===val||corr==="edited" ? col : C.bd2}`, background:(corr===val||corr==="edited") ? col+"18" : C.dm, color:(corr===val||corr==="edited") ? col : C.mu, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {(editing === line.id) && (
                  <div style={{ marginTop:10, animation:"fadeUp .3s ease forwards" }}>
                    <textarea
                      autoFocus
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      placeholder="我当时实际上在想……"
                      style={{ width:"100%", padding:"10px 14px", background:C.stage, border:`1.5px solid ${C.a}55`, borderRadius:9, color:C.tx, fontSize:13, outline:"none", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", resize:"none", minHeight:60, boxSizing:"border-box", lineHeight:1.7 }}
                      onFocus={e=>e.target.style.borderColor=C.a+"99"}
                      onBlur={e=>e.target.style.borderColor=C.a+"55"}
                    />
                    <div style={{ display:"flex", gap:8, marginTop:6 }}>
                      <button onClick={() => setEditing(null)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:11, cursor:"pointer", fontFamily:"DM Mono, monospace" }}>取消</button>
                      <button onClick={() => saveEdit(line.id)} style={{ padding:"6px 16px", borderRadius:8, border:"none", background:C.a, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>保存</button>
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

// ── COMPARE PHASE ─────────────────────────────────────────────────────────────
// In real system, B has also done their session — here we simulate B's annotations
const SIMULATED_B_ANNOTATIONS = {
  0: { val:"v", reason:"" },
  1: { val:"x", reason:"他其实有在听，只是专注在手机上，不代表不在乎" },
  2: { val:"x", reason:"她沉默我有注意到，但以为她只是在想什么" },
  3: { val:"x", reason:"她说没事我就信了，我不知道这是在等我追问" },
  4: { val:"v", reason:"" },
  5: { val:"q", reason:"我感觉到气氛不对但不确定要不要问" },
};

function ComparePhase({ onNext }) {
  const [expanded, setExpanded] = useState(null);
  const [known, setKnown] = useState({});

  const divergences = SCRIPT.filter(l => {
    const bAnn = SIMULATED_B_ANNOTATIONS[l.id]?.val;
    return bAnn === "x" || bAnn === "q";
  });

  return (
    <div style={{ minHeight:"100vh" }}>
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"EE", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.bd}`, padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <p style={{ margin:0, fontSize:10, letterSpacing:"0.3em", color:C.mu, textTransform:"uppercase", fontFamily:"DM Mono, monospace" }}>SUBTEXT</p>
          <div style={{ width:1, height:16, background:C.bd }} />
          <p style={{ margin:0, fontSize:11, color:C.div, fontFamily:"DM Mono, monospace" }}>⚡ 对比</p>
        </div>
        <button onClick={onNext} style={{ padding:"6px 18px", borderRadius:20, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:11, cursor:"pointer", fontFamily:"DM Mono, monospace" }}>
          结束 →
        </button>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px 80px", boxSizing:"border-box" }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ margin:"0 0 6px", fontSize:11, color:C.div, fontFamily:"DM Mono, monospace", letterSpacing:"0.15em", textTransform:"uppercase" }}>他的标注结果</p>
          <h2 style={{ margin:"0 0 8px", fontSize:26, fontWeight:300, color:C.tx, fontFamily:"Cormorant Garamond, serif", lineHeight:1.3 }}>
            他对 AI 关于你内心的推断，怎么说的？
          </h2>
          <p style={{ margin:0, fontSize:13, color:C.mu, lineHeight:1.7 }}>
            他也看了同样的场景，标注了 AI 对你内心的推断。<br />
            下面是他标 ✗ 或 ? 的地方——也就是他以为你当时不是那样想的。
          </p>
        </div>

        {/* Summary bar */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:28 }}>
          {[
            { n: Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="v").length, label:"他认为 AI 说对了", col:C.gr },
            { n: Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="x").length, label:"他认为 AI 说错了", col:C.re },
            { n: Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="q").length, label:"他也不确定", col:C.yw },
          ].map(({ n, label, col }) => (
            <div key={label} style={{ padding:"14px 18px", background:C.card, border:`1px solid ${C.bd}`, borderRadius:12, textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:28, fontWeight:300, color:col, fontFamily:"Cormorant Garamond, serif" }}>{n}</p>
              <p style={{ margin:0, fontSize:11, color:C.mu }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Divergence moments */}
        <p style={{ margin:"0 0 16px", fontSize:11, color:C.mu, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em", textTransform:"uppercase" }}>⚡ 分歧点</p>
        {SCRIPT.map((line, idx) => {
          const bAnn = SIMULATED_B_ANNOTATIONS[line.id];
          const isDivergence = bAnn?.val === "x" || bAnn?.val === "q";
          const isExpanded = expanded === line.id;
          const knowThis = known[line.id];

          return (
            <div key={line.id} style={{ marginBottom:10, background:C.card, border:`1.5px solid ${isDivergence ? C.div+"44" : C.bd}`, borderRadius:14, overflow:"hidden", transition:"all .25s", animation:`fadeUp .4s ease ${idx*0.05}s both` }}>
              {/* Real dialogue */}
              <div onClick={() => isDivergence && setExpanded(isExpanded ? null : line.id)} style={{ padding:"12px 18px", cursor:isDivergence?"pointer":"default", display:"flex", alignItems:"center", gap:12 }}>
                {isDivergence && <span style={{ fontSize:12, color:C.div }}>⚡</span>}
                {!isDivergence && <span style={{ fontSize:12, color:C.gr }}>✓</span>}
                <p style={{ margin:0, flex:1, fontSize:13, color: isDivergence ? C.tx : C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.5 }}>
                  {line.speaker==="A"?"她：":line.speaker==="B"?"他：":""}{line.text}
                </p>
                {isDivergence && <span style={{ color:C.mu, fontSize:10 }}>{isExpanded?"▲":"▼"}</span>}
              </div>

              {isExpanded && isDivergence && (
                <div style={{ padding:"0 18px 16px", animation:"fadeUp .3s ease forwards" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                    {/* AI's version */}
                    <div style={{ padding:"12px 14px", background:C.aBg, border:`1px solid ${C.aBd}`, borderRadius:10 }}>
                      <p style={{ margin:"0 0 4px", fontSize:9, color:C.a, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>AI 推断你的内心</p>
                      <p style={{ margin:0, fontSize:13, color:C.a+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>{line.innerA}</p>
                    </div>
                    {/* B's annotation of A */}
                    <div style={{ padding:"12px 14px", background:C.bBg, border:`1px solid ${C.bBd}`, borderRadius:10 }}>
                      <p style={{ margin:"0 0 4px", fontSize:9, color:C.b, fontFamily:"DM Mono, monospace", letterSpacing:"0.1em" }}>他以为你当时在想</p>
                      {bAnn?.val==="x" && bAnn?.reason ? (
                        <p style={{ margin:0, fontSize:13, color:C.b+"CC", fontFamily:"Cormorant Garamond, serif", fontStyle:"italic", lineHeight:1.6 }}>{bAnn.reason}</p>
                      ) : (
                        <p style={{ margin:0, fontSize:12, color:C.mu, fontFamily:"Cormorant Garamond, serif", fontStyle:"italic" }}>他说不确定</p>
                      )}
                    </div>
                  </div>

                  {/* Did you know? */}
                  <div style={{ padding:"10px 14px", background:C.div+"08", border:`1px solid ${C.div}22`, borderRadius:9 }}>
                    <p style={{ margin:"0 0 8px", fontSize:11, color:C.div }}>这个分歧，你之前知道吗？</p>
                    <div style={{ display:"flex", gap:8 }}>
                      {[["v","知道，我意识到过"],["x","不知道，第一次看到"]].map(([val,label]) => (
                        <button key={val} onClick={() => setKnown(p=>({...p,[line.id]:val}))} style={{ padding:"7px 16px", borderRadius:8, border:`1.5px solid ${knowThis===val ? C.div : C.bd2}`, background:knowThis===val ? C.div+"18" : C.dm, color:knowThis===val ? C.div : C.mu, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"DM Mono, monospace", transition:"all .2s" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DONE ──────────────────────────────────────────────────────────────────────
function DonePhase({ onReset }) {
  const newlyDiscovered = Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="x").length;
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ maxWidth:480, textAlign:"center", animation:"fadeUp .6s ease forwards" }}>
        <p style={{ margin:"0 0 24px", fontSize:32, color:C.tx }}>◎</p>
        <h2 style={{ margin:"0 0 12px", fontSize:32, fontWeight:300, color:C.tx, fontFamily:"Cormorant Garamond, serif", letterSpacing:"-0.01em" }}>
          你们看到了同一件事，<br />却各自在不同地方。
        </h2>
        <p style={{ margin:"0 0 28px", fontSize:14, color:C.mu, lineHeight:1.9 }}>
          他对你内心的推断，有 {newlyDiscovered} 处和 AI 不同。<br />
          其中有些，你自己也不知道他是这么想的。
        </p>
        <div style={{ padding:20, background:C.card, border:`1px solid ${C.bd}`, borderRadius:14, marginBottom:28, textAlign:"left" }}>
          <p style={{ margin:"0 0 10px", fontSize:10, color:C.mu, fontFamily:"DM Mono, monospace", letterSpacing:"0.12em", textTransform:"uppercase" }}>这次 Subtext 发现了什么</p>
          {[
            { n: Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="v").length, label:"他认为 AI 说对了你的内心", col:C.gr },
            { n: Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="x").length, label:"他认为 AI 说错了", col:C.re },
            { n: Object.values(SIMULATED_B_ANNOTATIONS).filter(a=>a.val==="q").length, label:"他也不确定", col:C.yw },
          ].map(({ n, label, col }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:`1px solid ${C.bd}` }}>
              <span style={{ fontSize:22, fontWeight:300, color:col, fontFamily:"Cormorant Garamond, serif", width:28, textAlign:"center" }}>{n}</span>
              <span style={{ fontSize:12, color:C.mu }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={onReset} style={{ padding:"11px 24px", borderRadius:24, border:`1px solid ${C.bd2}`, background:"transparent", color:C.mu, fontSize:13, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>重新体验</button>
          <button style={{ padding:"11px 28px", borderRadius:24, border:"none", background:C.tx, color:C.bg, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Outfit, sans-serif" }}>保存这次记录 →</button>
        </div>
      </div>
    </div>
  );
}

export default SubtextApp;
