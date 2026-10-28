import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowRight, Check, Copy, GitBranch, Code2, Layers, Play, ShieldCheck, X } from 'lucide-react'
import { language, t } from '../i18n'
import './ProjectPage.css'


export default function IntroScreen({ onBegin }) {
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
        <a className="study-hero-preview" href={`?demo=solo&beat=1&lang=${language}`} aria-label={t('打开实际交互演示', 'Open the study interface')}>
          <div className="study-preview-top"><span className="live-dot"/> ASIDE / STUDY INTERFACE <ArrowUpRight size={16}/></div>
          <img src={`${import.meta.env.BASE_URL}study-interface.png`} alt={t('ASIDE 原人物、场景、内心气泡和编辑时间轴', 'ASIDE study characters, scene, thought bubbles, and editing timeline')} />
          <span className="study-preview-bottom">{t('实际系统界面 · 点击进入完整演示', 'ACTUAL INTERFACE · OPEN THE FULL DEMO')}<Play size={14}/></span>
        </a>
      </section>
      <div className="principle-strip"><span>{t('对话 → 场景 → 反思', 'DIALOGUE → SCENE → REFLECTION')}</span><p>{t('AI 提出假设，人保留解释自己的权利。', 'AI proposes a hypothesis. People keep the right to describe themselves.')}</p><ShieldCheck size={21}/></div>
      <section className="experience-section" id="experience">
        <div className="section-heading"><div><div className="eyebrow">01 / THE STUDY INTERFACE</div><h2>{t('直接在场景中，重新理解这段对话。', 'Revisit the conversation in the actual scene.')}</h2></div><p>{t('沿用研究系统的人物、场景和操作界面。下面可以直接确认、修改和回看。', 'The study characters, scenes, and controls. Confirm, edit, and revisit directly below.')}</p></div>
        <div className="study-flow"><span>01 {t('确认自己', 'Self-Confirm')}</span><ArrowRight size={15}/><span>02 {t('编辑对方', 'Cross-Editing')}</span><ArrowRight size={15}/><span>03 {t('共同观看', 'Together Viewing')}</span><ArrowRight size={15}/><span>04 {t('比较差异', 'Compare Perspectives')}</span></div>
        <div className="study-embed-shell"><div className="study-embed-toolbar"><span>{t('可直接操作的完整演示', 'FULL INTERACTIVE WALKTHROUGH')}</span><a href={`?demo=solo&beat=1&lang=${language}`} target="_blank" rel="noreferrer">{t('在独立窗口打开', 'Open full screen')}<ArrowUpRight size={14}/></a></div>
          <iframe className="study-embed" src={`?demo=solo&beat=1&lang=${language}`} title={t('ASIDE 完整交互演示', 'ASIDE study interface walkthrough')} loading="lazy" />
        </div>
        <p className="study-note">{t('先点击内心气泡中的 “Like them?”，接受、修改或重写；用下方时间轴回看对话。完成确认后进入对对方的编辑，再查看共同观看和差异卡片。示例对话为虚构内容，未公开参与者记录。', 'Click “Like them?” in a thought bubble to accept, edit, or rewrite it. Navigate the timeline, finish self-confirmation, then interpret the other person and compare perspectives. Dialogue is fictional; participant records remain private.')}</p>
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
