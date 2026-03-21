// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: Cy (A, 女) × jk (B, 男)
//  Conflict: A等了一上午B确认计划，B没主动联系 → A生气挂断拉黑
//  背景：两人用"小狗/主人"作为昵称
// ─────────────────────────────────────────────────────────────

export const scenario_p10 = {
  id: 'p10_puppy_and_owner',
  title: '小狗与主人',
  subtitle: 'The Puppy and Its Owner',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: 'Cy',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)',
      thoughtBorder: '#5882d0',
      spriteType: 'female',
      hairStyle: 'long',
      outfitStyle: 'casual',
      accessory: 'none',
    },
    B: {
      id: 'B',
      name: 'jk',
      label: 'PARTNER B',
      color: '#e87a7a',
      darkColor: '#b84a4a',
      glowColor: 'rgba(232,122,122,0.55)',
      thoughtBg: 'rgba(210,80,80,0.13)',
      thoughtBorder: '#c85050',
      spriteType: 'male',
      hairStyle: 'short',
      outfitStyle: 'casual',
      accessory: 'none',
    },
  },

  beats: [
    // ── Beat 0: B表态愿意等 ──
    {
      id: 0,
      intensity: 0.3,
      narrator: 'B主动表示会等A说完，语气温柔',
      dialogue: { speaker: 'B', text: '你生气说不出话没关系的，我都会等你慢慢说完的' },
      thoughts: {
        A: {
          text: '他现在倒是会说好听的了。但我还是很生气。',
          emotion: 'angry',
          bubbleType: 'cloud',
        },
        B: {
          text: '她肯定气坏了。我得先让她知道我在这儿，不会跑。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'angry', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 1: A表达不满 ──
    {
      id: 1,
      intensity: 0.45,
      narrator: 'A直接表达自己的不开心',
      dialogue: { speaker: 'A', text: '我有关系，我很不开心' },
      thoughts: {
        A: {
          text: '什么叫没关系？我当然有关系。等了一上午什么都没等到。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她说不开心了……我确实做得不好。',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'reflective', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 2: B道歉 ──
    {
      id: 2,
      intensity: 0.4,
      narrator: 'B为让A在外面吹风道歉',
      dialogue: { speaker: 'B', text: '让你一个人在外面吹这么久风真的抱歉' },
      thoughts: {
        A: {
          text: '知道我在外面吹风还不早点联系我？道歉有用吗。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '她一个人在外面等了那么久……想想就觉得对不起她。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'reflective', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 3: 小狗比喻 ──
    {
      id: 3,
      intensity: 0.5,
      narrator: 'A用两人之间的"小狗"比喻表达失望',
      dialogue: { speaker: 'A', text: '你就是这样养小狗的吗' },
      thoughts: {
        A: {
          text: '我是他的小狗，可他连小狗都不好好照顾。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '她说得对，今天确实让小狗流浪了。我得把她哄回来。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 4: A拒绝和好 ──
    {
      id: 4,
      intensity: 0.55,
      narrator: 'A表示不想回来，仍然很不爽',
      dialogue: { speaker: 'A', text: '不回来了' },
      thoughts: {
        A: {
          text: '不是哄两句就能好的。我是真的很受伤。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她还是很生气……我该怎么办。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'angry', lean: 'none', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'anxious', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 5: 半开玩笑的绝交 ──
    {
      id: 5,
      intensity: 0.45,
      narrator: 'A说绝交，B回以"绝交8小时"，气氛有了微妙变化',
      dialogue: { speaker: 'A', text: '绝交' },
      thoughts: {
        A: {
          text: '我说绝交他也不当真。但我就是想让他知道我有多生气。',
          emotion: 'angry',
          bubbleType: 'cloud',
        },
        B: {
          text: '她说绝交了，那就绝交8小时吧。给她时间消消气。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'angry', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'warm', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 6: 第二天早上 ──
    {
      id: 6,
      intensity: 0.35,
      narrator: '第二天早上，B主动来修复关系',
      dialogue: { speaker: 'B', text: '已绝交10h了小狗' },
      thoughts: {
        A: {
          text: '他来找我了。但我还没消气呢。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '绝交时间到了，该把小狗接回来了。希望她气消了一点。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 7: A说出真正的委屈 ──
    {
      id: 7,
      intensity: 0.6,
      narrator: 'A揭露了她提前订好酒店和高铁票的事实',
      dialogue: { speaker: 'A', text: '四天前问你316有没有空的时候已经定好了酒店' },
      thoughts: {
        A: {
          text: '我提前四天就开始准备了，订酒店、买高铁票，结果他根本不上心。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她已经订好酒店和高铁了……我完全不知道她做了这么多准备。',
          emotion: 'surprised',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'surprised', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 8: B理解了 ──
    {
      id: 8,
      intensity: 0.5,
      narrator: 'B复述了A生气的原因，表示理解',
      dialogue: { speaker: 'B', text: '我大概理解你生气的地方了：小狗特地为我安排行程，来南海看我，可是我对小狗的行程安排不够上心' },
      thoughts: {
        A: {
          text: '他终于懂了。我不是无理取闹，我是因为在乎才那么用心。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '她做了那么多我都没察觉。她生气是应该的。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'reflective', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 9: A的深层感受 ──
    {
      id: 9,
      intensity: 0.45,
      narrator: 'A表达了自己付出却不被看见的委屈',
      dialogue: { speaker: 'A', text: '无人在意的小狗' },
      thoughts: {
        A: {
          text: '我做了那么多，他都没有注意到。我只是想被在意而已。',
          emotion: 'hurt',
          bubbleType: 'warm',
        },
        B: {
          text: '她不是在闹脾气，她是真的觉得自己不被在意。以后不能再这样了。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 35, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
        B: { x: 65, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },
  ],
}
