// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: 坐观雾漫长安 (B, 男) × Zzzz (A, 女)
//  Source: 周六下午2-3_精选.txt
//  Conflict: 拿外卖没说 → 哄人方式争执 → 揭示隐藏情绪
// ─────────────────────────────────────────────────────────────

export const scenario_zuoguan = {
  id: 'zuoguan_conflict',
  title: '说不出口的心情',
  subtitle: 'The Unspoken Mood',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: 'Zzzz',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)',
      thoughtBorder: '#5882d0',
      hairColor: '#3a2820',
      outfitColor: '#4a80c8',
      outfitDark: '#2a5098',
      hairStyle: 'long',
      outfitStyle: 'casual',
      accessory: 'none',
      spriteType: 'female',
    },
    B: {
      id: 'B',
      name: '坐观雾漫长安',
      label: 'PARTNER B',
      color: '#e87a7a',
      darkColor: '#b84a4a',
      glowColor: 'rgba(232,122,122,0.55)',
      thoughtBg: 'rgba(210,80,80,0.13)',
      thoughtBorder: '#c85050',
      hairColor: '#2a2020',
      outfitColor: '#b84a4a',
      outfitDark: '#7a2a2a',
      hairStyle: 'short',
      outfitStyle: 'casual',
      accessory: 'none',
      spriteType: 'male',
    },
  },

  beats: [
    // ── Beat 0: Scene setting ──
    {
      id: 0, duration: 3000, intensity: 0.05,
      narrator: '晚上，各自在宿舍',
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
      },
      thoughts: { A: null, B: null },
      dialogue: null,
    },

    // ── Beat 1: Trigger — 拿外卖没说 ──
    {
      id: 1, duration: 4500, intensity: 0.15,
      narrator: null,
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '又怎么了，我就去拿个外卖而已，有什么好说的。', emotion: 'neutral', bubbleType: 'cloud' },
        B: { text: '她去拿外卖都不跟我说一声，我关心她她还嫌烦？', emotion: 'hurt', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'B', text: '宝宝去拿外卖了吗？为什么不告诉我？' },
    },

    // ── Beat 2: First clash — 态度问题 ──
    {
      id: 2, duration: 4500, intensity: 0.35,
      narrator: null,
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'defensive', lean: 'back', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '我这周心情就不好，他还来挑毛病，我真的不想理。', emotion: 'withdrawn', bubbleType: 'cloud' },
        B: { text: '她说"别找茬"是什么意思？我只是想让她跟我说一声而已。', emotion: 'hurt', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'A', text: '别找茬。我这星期都这样，你是考完了就来挑刺了吧' },
    },

    // ── Beat 3: B explains feelings — 解释不开心的原因 ──
    {
      id: 3, duration: 5000, intensity: 0.4,
      narrator: null,
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '他说的每一条我都知道，但我现在真的没力气应对。', emotion: 'withdrawn', bubbleType: 'hesitation' },
        B: { text: '我在很认真地跟她说我的感受，她能不能好好听一下。', emotion: 'anxious', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'B', text: '我觉得你换位置去拿外卖应该跟我说，问你的时候你说"对的"我觉得很不好，然后我让你说你还反问我为什么要说' },
    },

    // ── Beat 4: A's apology not landing ──
    {
      id: 4, duration: 4500, intensity: 0.5,
      narrator: null,
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '我都说了我错了，他到底还想怎样。', emotion: 'defensive', bubbleType: 'cloud' },
        B: { text: '她说"你说的都对"明显是在敷衍我，根本不是真心道歉。', emotion: 'angry', bubbleType: 'aggressive' },
      },
      dialogue: { speaker: 'A', text: '好好好，你说的都对。我错了' },
    },

    // ── Beat 5: B points out the meta-problem ──
    {
      id: 5, duration: 5000, intensity: 0.6,
      narrator: null,
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '他觉得我敷衍，但我是真的不知道该怎么哄他。', emotion: 'anxious', bubbleType: 'hesitation' },
        B: { text: '我已经在很努力地引导她了，她为什么就是不愿意好好哄我。', emotion: 'hurt', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'B', text: '你从始至终都没有真心想道歉。我已经在很尽力地引导你了，你呢？' },
    },

    // ── Beat 6: B explains what he needs ──
    {
      id: 6, duration: 5000, intensity: 0.55,
      narrator: null,
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '他说只要撒个娇就好了……但我现在连撒娇的心情都没有。', emotion: 'withdrawn', bubbleType: 'hesitation' },
        B: { text: '我其实不是在生大气，我只是想要她认真对待我的感受。', emotion: 'reflective', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'B', text: '我其实一开始并没有多生气，只要你撒个娇哄一下我很快就会好。但是你一直哄得不好，态度不好，觉得自己没做错事，也很敷衍' },
    },

    // ── Beat 7: The hidden truth — 心情不好 ──
    {
      id: 7, duration: 5000, intensity: 0.7,
      narrator: null,
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'hurt', lean: 'back', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'surprised', lean: 'forward', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '我终于说出来了……其实我这一整周都不好，但我不知道怎么开口。', emotion: 'hurt', bubbleType: 'hesitation' },
        B: { text: '她心情不好？我完全不知道。她从来没跟我说过。', emotion: 'surprised', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'A', text: '因为我的心情一直和中午一样。心情不好。我以为你知道' },
    },

    // ── Beat 8: Breakdown — 拒绝接电话 ──
    {
      id: 8, duration: 5000, intensity: 0.85,
      narrator: null,
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 15, facing: 'right', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
        B: { x: 85, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '我现在听到他的声音只会更难受。我需要自己待一会儿。', emotion: 'withdrawn', bubbleType: 'hesitation' },
        B: { text: '她连电话都不接了。我想帮她，但她把我推开了。我能做什么？', emotion: 'hurt', bubbleType: 'cloud' },
      },
      dialogue: { speaker: 'A', text: '不接。因为你让我很难受我就不会想听到你的声音。我说我不接，我就不会接' },
    },

    // ── Beat 9: B's reflection ──
    {
      id: 9, duration: 5000, intensity: 0.5,
      narrator: null,
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'withdrawn', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '他说下次先哄我再说道理……他听进去了吗？', emotion: 'reflective', bubbleType: 'cloud' },
        B: { text: '我反应过来了，她心情不好的时候我不该只顾着讲道理。应该先关心她的感受。', emotion: 'reflective', bubbleType: 'warm' },
      },
      dialogue: { speaker: 'B', text: '我的问题，下次我会先哄你哄完再跟你说道理。你没跟我说过你心情不好，你完全没有表现出来宝宝' },
    },

    // ── Beat 10: A reveals deeper pain ──
    {
      id: 10, duration: 5000, intensity: 0.65,
      narrator: null,
      proxemic: { state: 'close', divider: false },
      spatial: {
        A: { x: 35, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
        B: { x: 65, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
      },
      thoughts: {
        A: { text: '我终于说出来了。那天晚上我一个人哭了很久，但我不想让他担心。', emotion: 'hurt', bubbleType: 'hesitation' },
        B: { text: '她哭了好几天我都不知道……我以后要更注意她的状态。', emotion: 'warm', bubbleType: 'warm' },
      },
      dialogue: { speaker: 'A', text: '星期三晚上我莫名意识到这个问题，打视频后我就哭。星期四晚上我情绪很崩溃，我说我的灯没电了，其实是我那会已经哭了' },
    },
  ],
}
