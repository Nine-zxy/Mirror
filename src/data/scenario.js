// ─────────────────────────────────────────────────────────────
//  Relationship Scripting Language (RSL) v2
//  "那条未读的消息 / The Unread Message"
//
//  New fields:
//   intensity       0–1  conflict intensity for timeline curve
//   proxemic        { state, divider }  spatial relationship metadata
//   spatial.lean    'forward' | 'back' | 'none'
//   spatial.scale   number (1.0 = normal)
//   thoughts.bubbleType  'cloud' | 'aggressive' | 'hesitation' | 'warm'
// ─────────────────────────────────────────────────────────────

export const scenario = {
  id: 'unread_message',
  title: '那条未读的消息',
  subtitle: 'The Unread Message',
  scene: 'apartment_evening',

  personas: {
    A: {
      id: 'A',
      name: '小美',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)',
      thoughtBorder: '#5882d0',
      hairColor: '#8B4513',
      outfitColor: '#4a80c8',
      outfitDark: '#2a5098',
    },
    B: {
      id: 'B',
      name: '小凯',
      label: 'PARTNER B',
      color: '#e87a7a',
      darkColor: '#b84a4a',
      glowColor: 'rgba(232,122,122,0.55)',
      thoughtBg: 'rgba(210,80,80,0.13)',
      thoughtBorder: '#c85050',
      hairColor: '#3a2820',
      outfitColor: '#b84a4a',
      outfitDark: '#7a2a2a',
    },
  },

  beats: [
    // ── Beat 0: Scene open ─────────────────────────────────
    {
      id: 0,
      duration: 3400,
      intensity: 0.05,
      narrator: '傍晚。小美推门回家，小凯坐在沙发上刷手机，没有抬头。',
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 16, facing: 'right', pose: 'neutral',  lean: 'none', scale: 1.00, visible: true },
        B: { x: 74, facing: 'left',  pose: 'sitting',  lean: 'none', scale: 1.00, visible: true },
      },
      thoughts: { A: null, B: null },
      dialogue: null,
    },

    // ── Beat 1: Mia confronts ──────────────────────────────
    {
      id: 1,
      duration: 4600,
      intensity: 0.40,
      proxemic: { state: 'approaching', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'confrontational', lean: 'forward', scale: 1.05, visible: true },
        B: { x: 72, facing: 'left',  pose: 'sitting',         lean: 'none',   scale: 1.00, visible: true },
      },
      thoughts: {
        A: { text: '他为什么不回我…\n是不在乎我吗？', emotion: 'anxious', bubbleType: 'hesitation' },
        B: null,
      },
      dialogue: { speaker: 'A', text: '你今天为什么不回我消息？' },
    },

    // ── Beat 2: Kai deflects ───────────────────────────────
    {
      id: 2,
      duration: 3800,
      intensity: 0.55,
      proxemic: { state: 'tension', divider: true },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'anxious',   lean: 'none', scale: 1.00, visible: true },
        B: { x: 68, facing: 'left',  pose: 'defensive', lean: 'back', scale: 1.00, visible: true },
      },
      thoughts: {
        A: null,
        B: { text: '我就是在忙啊。\n这有什么好追问的。', emotion: 'defensive', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'B', text: '我当时在忙。' },
    },

    // ── Beat 3: Mia escalates ─────────────────────────────
    {
      id: 3,
      duration: 4800,
      intensity: 0.72,
      proxemic: { state: 'hot', divider: true },
      spatial: {
        A: { x: 42, facing: 'right', pose: 'confrontational', lean: 'forward', scale: 1.08, visible: true },
        B: { x: 64, facing: 'left',  pose: 'defensive',       lean: 'back',   scale: 1.00, visible: true },
      },
      thoughts: {
        A: { text: '忙？一条消息的时间都没有？\n他根本没把我放在心上。', emotion: 'hurt', bubbleType: 'hesitation' },
        B: null,
      },
      dialogue: { speaker: 'A', text: '忙？发一条消息要多少时间？' },
    },

    // ── Beat 4: Kai outburst — PEAK ───────────────────────
    {
      id: 4,
      duration: 5000,
      intensity: 0.95,
      isPausePoint: true,
      reflectionPrompt: '在这个时刻，你们的内心世界完全不同步。\n你看到了什么？',
      proxemic: { state: 'hot', divider: true },
      spatial: {
        A: { x: 42, facing: 'right', pose: 'hurt',  lean: 'back',    scale: 1.00, visible: true },
        B: { x: 60, facing: 'left',  pose: 'angry', lean: 'forward', scale: 1.10, visible: true },
      },
      thoughts: {
        A: { text: '他又在对我发火了。\n我只是想要他在乎我…', emotion: 'hurt',  bubbleType: 'cloud' },
        B: { text: '她不理解我的压力。\n为什么每次都这样！',  emotion: 'angry', bubbleType: 'aggressive' },
      },
      dialogue: { speaker: 'B', text: '我说了我在忙！你能不能别总这样！' },
    },
  ],
}
