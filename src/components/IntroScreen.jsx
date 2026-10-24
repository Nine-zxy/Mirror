import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowRight, Check, Copy, GitBranch, Code2, Layers, Play, ShieldCheck, X } from 'lucide-react'
import { language, t } from '../i18n'
import PixelChar from './PixelChar'
import './ProjectPage.css'

const personas = {
  A: { id: 'A', hairColor: '#69442d', outfitColor: '#6483a2', outfitDark: '#3d5674', hairStyle: 'medium', outfitStyle: 'casual', accessory: 'none' },
  B: { id: 'B', hairColor: '#393b36', outfitColor: '#c87a60', outfitDark: '#8c4d3b', hairStyle: 'short', outfitStyle: 'casual', accessory: 'none' },
}

export default function IntroScreen({ onBegin }) {
  const [step, setStep] = useState(0)
  const [room] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase())
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState(false)
  const [doc, setDoc] = useState(null)
  useEffect(() => {
    if (!doc) return
    const previous = document.activeElement
    const modal = document.querySelector('.project-modal')
    modal?.querySelector('button')?.focus()
    function trap(event) {
      if (event.key === 'Escape') setDoc(null)
      if (event.key !== 'Tab') return
      const buttons = modal?.querySelectorAll('button')
      if (!buttons?.length) return
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { document.removeEventListener('keydown', trap); previous?.focus() }
  }, [doc])
  const phases = [
    { name: t('确认自己的感受', 'Confirm your own feelings'), en: 'SELF-CONFIRM', desc: t('先看自己的内心独白。接受、修改，或者用自己的话重写，让自我描述保留在自己手中。', 'Start with your own inner-state hypothesis. Accept, edit, or rewrite it in your own words.'), a: t('我一直在等。我希望我们的约定被记住。', 'I have been waiting. I want our plan to matter.'), b: null },
    { name: t('编辑对对方的理解', 'Interpret your partner'), en: 'CROSS-EDITING', desc: t('独立编辑你对对方的理解。此时，对方还看不到你的修改；两个人都拥有思考的空间。', 'Independently edit your interpretation of your partner. Your edits stay private until both people finish.'), a: null, b: t('也许对方并不是不在意，只是不知道我在等。', 'Perhaps they did not realize I was waiting.') },
    { name: t('一起看见两种视角', 'See both perspectives'), en: 'TOGETHER VIEWING', desc: t('双方完成后，共同观看与比较。把“我如何描述自己”和“你如何理解我”放在一起。', 'After both finish, reveal the edits together. Compare self-description with the other person’s interpretation.'), a: t('我希望我们的约定被记住。', 'I wanted our plan to matter.'), b: t('我以为时间还可以商量。', 'I thought the time was flexible.') },
  ]
  const modules = [
    ['src/components/', t('场景与交互', 'Scene & interaction'), t('人物、内心气泡、编辑界面与差异卡片。', 'Characters, thought bubbles, editing, and divergence cards.'), Layers],
    ['src/utils/', t('对话重建', 'Reconstruction'), t('提示词、对话解析与结构化场景生成。', 'Prompts, dialogue parsing, and structured scene generation.'), Code2],
    ['server/', t('双人同步', 'Pair synchronization'), t('房间、阶段关口与双方同时揭示。', 'Rooms, phase gates, and synchronized reveal.'), GitBranch],
  ]
  const docs = {
    paper: { title: t('关于这项研究', 'About the research'), body: t('ASIDE: From Conflict Participants to Co-Observers Through Dyadic Spectator Reflection。系统以双人旁观反思为核心：两位参与者分别确认自己的感受，编辑对对方的理解，再共同观看与比较。这里的 AI 内心独白是可修订的假设。页面上的故事为虚构演示，不能作为研究结果或效果证据。论文正式引用信息尚待补充。', 'ASIDE: From Conflict Participants to Co-Observers Through Dyadic Spectator Reflection. The system supports independent self-description, cross-perspective editing, and shared viewing. AI inner states are revisable hypotheses. The story on this page is fictional, not empirical evidence. Final publication metadata is pending.') },
    reproduce: { title: t('复现与运行', 'Reproduction & setup'), body: t('需要 Node.js 22.12 或更新版本。在 ASIDE 目录中运行 npm ci，然后 npm run dev，打开 http://localhost:5173。虚构示例无需 API 密钥。双人演示请先打开 A，再打开 B。真实 AI 重建需要在 .env.local 中配置 GEMINI_API_KEY。详细步骤见仓库 docs/REPRODUCTION.md。', 'Use Node.js 22.12 or later. In ASIDE, run npm ci and npm run dev, then open http://localhost:5173. The fictional example needs no API key. Open A before B for paired demos. Real AI reconstruction requires GEMINI_API_KEY in .env.local. See docs/REPRODUCTION.md.') },
    release: { title: t('代码发布说明', 'Release notes'), body: t('当前为整理后的研究代码候选版，含核心流程、提示词、虚构案例与同步测试。原始参与者情境和日志未包含；默认关闭行为日志。代码已与论文机制建立对应说明。代码采用 MIT 许可证，GitHub 仓库为 Nine-zxy/Mirror；论文作者引用信息待补充。完整研究操作界面仍有混合语言。详见 docs/RELEASE_STATUS.md 与 docs/PAPER_TO_CODE.md。', 'This curated research candidate includes the workflow, prompts, fictional examples, and synchronization tests. Participant scenarios and logs are excluded; behavior logging is off by default. Code is available under MIT at Nine-zxy/Mirror; paper citation metadata is pending. Some inherited research controls still mix languages. See docs/RELEASE_STATUS.md and docs/PAPER_TO_CODE.md.') },
  }
  async function copy() {
    try { await navigator.clipboard.writeText('npm ci\nnpm run dev'); setCopied(true) }
    catch { setNotice(true) }
  }
  return (
    <main className="aside-project">
      <nav className="project-nav">
        <a className="project-brand" href={`?lang=${language}`} aria-label="ASIDE home"><span className="brand-symbol">a.</span> ASIDE<span className="brand-note">RESEARCH & CODE</span></a>
        <div className="nav-links"><a href="#experience">{t('交互原理', 'Experience')}</a><a href="#code">{t('代码与复现', 'Code & setup')}</a><a className="language-link" href={`?lang=${language === 'zh' ? 'en' : 'zh'}`}>{language === 'zh' ? 'EN ↗' : '中文 ↗'}</a></div>
      </nav>
      <section className="project-hero">
        <div className="hero-copy"><div className="eyebrow"><span /> HUMAN–AI INTERACTION · ASIDE</div>
          <h1>{t('退后一步，', 'A step back.')}<br/><span>{t('一起看见。', 'A shared view.')}</span></h1>
          <p className="hero-description">{t('从冲突的参与者，成为共同的观察者。', 'From conflict participants to co-observers.')}<br/>{t('让同一段对话里的两种内心，都有被看见的空间。', 'Make room for both inner worlds in the same conversation.')}</p>
          <div className="hero-actions"><a className="project-button primary" href={`?demo=solo&lang=${language}`}><Play size={15}/>{t('体验交互演示', 'Explore the demo')}<ArrowUpRight size={17}/></a><button className="text-button" onClick={() => setDoc('paper')}>{t('了解研究', 'About the research')}<ArrowRight size={16}/></button></div>
          <div className="hero-caption"><span>DSR</span> DYADIC SPECTATOR REFLECTION</div>
        </div>
        <div className="hero-art" aria-label={t('双人反思场景示意', 'Illustration of dyadic reflection')}>
          <div className="art-topline"><span className="live-dot"/>{t('同一段对话 · 两种视角', 'ONE CONVERSATION · TWO PERSPECTIVES')}<span className="art-num">01—03</span></div>
          <div className="art-window"><div/><div/></div><div className="art-orbit"/>
          <div className="hero-thought thought-a">{t('“我只是希望，', '“I just wanted')}<br/>{t('你能听见我。”', 'to feel heard.”')}<span>A</span></div>
          <div className="hero-thought thought-b">{t('“原来，你是', '“I did not know')}<br/>{t('这样想的。”', 'you felt that way.”')}<span>B</span></div>
          <div className="art-person person-a"><PixelChar persona={personas.A} emotion="reflective" scale={1.6} facing="right"/></div><div className="art-person person-b"><PixelChar persona={personas.B} emotion="warm" scale={1.6} facing="left"/></div>
          <div className="art-floor"/><div className="art-label">{t('从各自的内心，走向共同的画面', 'SEPARATE INNER WORLDS. A SHARED SCENE.')}</div>
        </div>
      </section>
      <div className="principle-strip"><span>{t('对话 → 场景 → 反思', 'DIALOGUE → SCENE → REFLECTION')}</span><p>{t('AI 提出假设，人保留解释自己的权利。', 'AI proposes a hypothesis. People keep the right to describe themselves.')}</p><ShieldCheck size={21}/></div>
      <section className="experience-section" id="experience">
        <div className="section-heading"><div><div className="eyebrow">01 / THE INTERACTION</div><h2>{t('把视角的变化，变得可见。', 'Make a change of perspective visible.')}</h2></div><p>{t('点击三个阶段，看看同一场对话如何被重新理解。', 'Click through three phases to explore how a conversation is revisited.')}</p></div>
        <div className="experience-grid"><div className="phase-list" role="tablist" aria-label={t('反思阶段', 'Reflection phases')}>
          {phases.map((phase, i) => <button key={phase.en} id={`phase-${i}`} role="tab" aria-selected={step === i} aria-controls="phase-panel" onClick={() => setStep(i)} className={`phase-tab ${step === i ? 'active' : ''}`} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const next = (i + (event.key === 'ArrowDown' ? 1 : 2)) % 3; setStep(next); document.getElementById(`phase-${next}`)?.focus() } }}><span className="phase-number">0{i+1}</span><span><small>{phase.en}</small><strong>{phase.name}</strong>{step === i && <p>{phase.desc}</p>}</span><ArrowUpRight size={18}/></button>)}
        </div><div className="phase-visual" id="phase-panel" role="tabpanel" aria-labelledby={`phase-${step}`}>
          <div className="visual-heading"><span>{t('晚餐的约定', 'The Dinner Plan')}</span><small>{t('虚构案例 · 可交互示意', 'FICTIONAL EXAMPLE · INTERACTIVE EXPLAINER')}</small></div>
          <div className="dialogue-line">{t('“我以为我们说好七点一起做饭。”', '“I thought we agreed to cook together at seven.”')}</div>
          <div className="perspective-pair">{['A','B'].map(role => <div className={`perspective ${role === 'A' ? 'blue' : 'clay'}`} key={role}><span className="role-label">{role === 'A' ? t('小林', 'Alex') : t('小安', 'Sam')} / {role}</span><div className={`perspective-thought ${!phases[step][role.toLowerCase()] ? 'hidden-thought' : ''}`}>{phases[step][role.toLowerCase()] || t('此阶段保留独立思考空间', 'Space for independent reflection')}</div><PixelChar persona={personas[role]} emotion={step === 2 ? 'warm' : 'reflective'} scale={1.05} facing={role === 'A' ? 'right' : 'left'}/></div>)}</div>
          <div className="phase-footer"><span className="live-dot"/>{step === 2 ? t('双方完成 → 同步揭示', 'BOTH FINISH → REVEAL TOGETHER') : t('独立编辑 · 修改暂不向对方展示', 'INDEPENDENT EDITING · CHANGES STAY PRIVATE')}<span>0{step+1} / 03</span></div>
        </div></div>
      </section>
      <section className="code-section" id="code"><div className="section-heading"><div><div className="eyebrow">02 / UNDER THE HOOD</div><h2>{t('从研究，到可以探索的代码。', 'From research to inspectable code.')}</h2></div><p>{t('一个共享的核心流程，连接场景、重建与双人同步。', 'One shared workflow connects rendering, reconstruction, and synchronization.')}</p></div>
        <div className="module-grid">{modules.map(([path,title,description,Icon],i)=><article className="module-card" key={path}><div><Icon size={23}/><span>0{i+1}</span></div><h3>{title}</h3><p>{description}</p><code>{path}</code></article>)}</div>
        <div className="setup-grid"><div><div className="eyebrow">RUN IT LOCALLY</div><h3>{t('从一个虚构案例开始。', 'Start with a fictional example.')}</h3><p>{t('无需 API 密钥即可浏览演示。双人模式可在两个标签页或两台设备中体验。', 'Explore without an API key. Try paired interaction in two tabs or on two devices.')}</p><button className="text-button" onClick={()=>setDoc('reproduce')}>{t('查看完整运行说明', 'Read the setup guide')}<ArrowUpRight size={16}/></button></div><div className="terminal"><div className="terminal-head"><span>ASIDE / QUICK START</span><button onClick={copy} aria-label={t('复制运行命令', 'Copy setup commands')}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? t('已复制', 'Copied') : t('复制', 'Copy')}</button></div><pre><span># Node.js ≥ 22.12</span>{'\n'}<b>npm</b> ci{'\n'}<b>npm</b> run dev</pre><div className="terminal-foot">localhost:5173 <span>{t('本地运行', 'LOCAL DEVELOPMENT')}</span></div>{notice && <p role="status">{t('请选中上方命令手动复制。', 'Select the commands above to copy manually.')}</p>}</div></div>
      </section>
      <section className="try-section" id="try"><div><div className="eyebrow">03 / YOUR NEXT STEP</div><h2>{t('换一个位置，重新看一次。', 'Revisit it from another position.')}</h2><p>{t('进入完整演示，亲自试试确认、编辑与比较。', 'Try confirming, editing, and comparing in the full demonstration.')}</p></div><div className="try-actions"><a className="project-button primary" href={`?demo=solo&lang=${language}`}>{t('单人浏览', 'Solo walkthrough')}<ArrowUpRight size={17}/></a>{!__ASIDE_STATIC_SITE__ && <div className="pair-links"><a href={`?demo=pair&room=${room}&role=A&lang=${language}`} target="_blank" rel="noreferrer">{t('双人演示 A', 'Paired demo A')} ↗</a><a href={`?demo=pair&room=${room}&role=B&lang=${language}`} target="_blank" rel="noreferrer">{t('双人演示 B', 'Paired demo B')} ↗</a></div>}<small>{__ASIDE_STATIC_SITE__ ? t('在线提供单人示例；双人模式请下载代码运行。', 'The online demo is solo; run the code locally for paired sessions.') : t('先打开 A，再打开 B · 需要同步服务器', 'Open A before B · Sync server required')}</small>{!__ASIDE_STATIC_SITE__ && <button className="text-button" onClick={()=>onBegin('solo')}>{t('或输入自己的对话', 'Or use your own conversation')}<ArrowRight size={15}/></button>}</div></section>
      <footer className="project-footer"><div className="footer-wordmark">ASIDE<span> A SHARED VIEW.</span></div><div><button onClick={()=>setDoc('release')}>{t('代码发布说明', 'Release notes')}<ArrowUpRight size={13}/></button><a href="https://github.com/Nine-zxy/Mirror" target="_blank" rel="noreferrer">GitHub ↗</a><small>{t('研究原型 · 虚构示例 · 默认关闭行为日志', 'Research prototype · Fictional examples · Logging off by default')}</small></div></footer>
      {doc && <div className="project-modal-backdrop" onClick={()=>setDoc(null)}><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="doc-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')setDoc(null)}}><button className="modal-close" onClick={()=>setDoc(null)} aria-label={t('关闭', 'Close')}><X size={22}/></button><div className="eyebrow">ASIDE / NOTES</div><h2 id="doc-title">{docs[doc].title}</h2><p>{docs[doc].body}</p><button className="project-button primary" onClick={()=>setDoc(null)}>{t('返回网页', 'Back to the page')}<ArrowRight size={16}/></button></section></div>}
    </main>
  )
}
