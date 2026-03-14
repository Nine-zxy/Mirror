import React, { useState, useEffect } from 'react';
import { MessageSquare, Play, Pause, Edit3, Users, AlertCircle } from 'lucide-react';

const PixelTheaterDemo = () => {
  // 模拟剧本数据：对话 + 隐性假设 (Subtext)
  const [script, setScript] = useState([
    { id: 1, speaker: 'UserA', text: "你又这么晚回来。", subtext: "我觉得他在逃避家庭责任，我很孤单。", emotion: 'angry' },
    { id: 2, speaker: 'UserB', text: "加班我也没办法。", subtext: "我拼命工作也是为了这个家，她完全不体谅我。", emotion: 'tired' },
    { id: 3, speaker: 'UserA', text: "是加班还是不想见我？", subtext: "我其实想听他说他很想我，但我说出口的是质问。", emotion: 'sad' }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempSubtext, setTempSubtext] = useState("");

  // 自动播放逻辑
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < script.length - 1) {
      timer = setTimeout(() => setCurrentStep(prev => prev + 1), 3000);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, script.length]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* 左侧：原始证据/聊天记录面板 */}
      <div className="w-1/4 border-r border-slate-700 p-4 bg-slate-800/50">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
          <MessageSquare size={16} /> Evidence Log
        </h2>
        <div className="space-y-4">
          {script.map((item, index) => (
            <div key={item.id} className={`p-3 rounded-lg border transition-all ${index === currentStep ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800 border-transparent opacity-50'}`}>
              <p className="text-xs font-bold text-blue-400 mb-1">{item.speaker}</p>
              <p className="text-sm italic">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* 中间：2D 像素舞台 (模拟) */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="absolute top-8 flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-2xl">
          <button onClick={() => {setCurrentStep(0); setIsPlaying(true);}} className="hover:text-blue-400 transition-colors"><Play size={20}/></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-blue-400 transition-colors">
            {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
          </button>
          <div className="h-4 w-px bg-slate-600 mx-2" />
          <span className="text-xs font-mono">SCENE: THE LIVING ROOM CONFLICT</span>
        </div>

        {/* 2D 角色区域 */}
        <div className="relative w-full h-64 flex justify-around items-end pb-12">
          {/* User A 像素小人模拟 */}
          <div className="relative flex flex-col items-center">
            {currentStep % 2 === 0 && (
              <div className="absolute -top-32 w-48 animate-bounce bg-white text-slate-900 p-3 rounded-2xl rounded-bl-none shadow-xl border-2 border-blue-500">
                <p className="text-xs font-bold text-blue-600 mb-1 tracking-tighter uppercase">AI Inferred Subtext</p>
                <p className="text-sm leading-tight">{script[currentStep].subtext}</p>
              </div>
            )}
            <div className="w-16 h-24 bg-blue-500 rounded-t-full border-4 border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
            <p className="mt-2 font-bold text-blue-400">User A</p>
          </div>

          {/* User B 像素小人模拟 */}
          <div className="relative flex flex-col items-center">
            {currentStep % 2 !== 0 && (
              <div className="absolute -top-32 w-48 animate-bounce bg-white text-slate-900 p-3 rounded-2xl rounded-br-none shadow-xl border-2 border-red-500">
                <p className="text-xs font-bold text-red-600 mb-1 tracking-tighter uppercase">AI Inferred Subtext</p>
                <p className="text-sm leading-tight">{script[currentStep].subtext}</p>
              </div>
            )}
            <div className="w-16 h-24 bg-red-500 rounded-t-full border-4 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
            <p className="mt-2 font-bold text-red-400">User B</p>
          </div>
        </div>

        {/* 交互进度条 */}
        <div className="absolute bottom-12 w-3/4 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="bg-blue-500 h-full transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / script.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 右侧：协商与修正面板 */}
      <div className="w-1/4 border-l border-slate-700 p-6 bg-slate-900">
        <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
          <Edit3 size={16} /> Negotiation Desk
        </h2>

        {editingId === null ? (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                <AlertCircle size={12}/> Current Focus
              </p>
              <p className="text-sm mb-4 italic">"{script[currentStep].subtext}"</p>
              <button 
                onClick={() => {setEditingId(script[currentStep].id); setTempSubtext(script[currentStep].subtext);}}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors"
              >
                Modify My Subtext
              </button>
            </div>
            
            <div className="pt-6 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase mb-4 tracking-wider">Dyadic Divergence</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full w-[75%]" />
                </div>
                <span className="text-xs font-mono text-yellow-500">75% Mismatch</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Conflict Core: User A is seeking emotional validation while User B is focused on functional contribution.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="text-xs text-slate-400">Rewrite your true internal feeling:</label>
            <textarea 
              value={tempSubtext}
              onChange={(e) => setTempSubtext(e.target.value)}
              className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const newScript = [...script];
                  newScript[currentStep].subtext = tempSubtext;
                  setScript(newScript);
                  setEditingId(null);
                }}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold"
              >
                Save & Update Playback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelTheaterDemo;