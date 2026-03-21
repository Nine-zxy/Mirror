// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: 允小姐 (A, 女) × MoRan (B, 男)
//  Conflict: 双方都疲惫 → A要情感连接B给不了 → 升级到"不合适"和分手
// ─────────────────────────────────────────────────────────────

export const scenario_p9 = {
  id: 'p9_signals_of_exhaustion',
  title: '疲惫的信号',
  subtitle: 'Signals of Exhaustion',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: '允小姐',
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
      name: 'MoRan',
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
    // ── Beat 0: 日常报备 ──
    {
      id: 0,
      intensity: 0.2,
      narrator: '两人各自结束了疲惫的一天，互相汇报近况',
      dialogue: { speaker: 'A', text: '刚开完组会，脑袋都炸了' },
      thoughts: {
        A: {
          text: '今天组会被导师问了一堆，脑子完全转不动了。好想跟他说说话。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
        B: {
          text: '她也累了。我也累得不行，今天加班到现在。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 1: A的不满 ──
    {
      id: 1,
      intensity: 0.35,
      narrator: 'A指出B今天几乎没有主动联系她',
      dialogue: { speaker: 'A', text: '你今天都没怎么找我' },
      thoughts: {
        A: {
          text: '一整天就回了几条消息，连主动找我聊天都没有。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '上班一天了，忙得连喝水都没时间，真不是不想找她。',
          emotion: 'defensive',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'defensive', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 2: A的需要 ──
    {
      id: 2,
      intensity: 0.5,
      narrator: 'A表达了想聊天的愿望，指责B一直在敷衍',
      dialogue: { speaker: 'A', text: '很想跟你说说话，你一直都很敷衍' },
      thoughts: {
        A: {
          text: '我只是想好好聊聊天而已，这个要求很过分吗？',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '我没敷衍啊……我是真的累，不是不想理她。',
          emotion: 'defensive',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'defensive', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 3: 升级——互相否定 ──
    {
      id: 3,
      intensity: 0.65,
      narrator: 'A觉得B只在意自己的累，B觉得A不理解上班的压力',
      dialogue: { speaker: 'B', text: '你在学校可能不太懂，上班压力跟上课完全不一样' },
      thoughts: {
        A: {
          text: '他居然觉得我不懂？我在学校就不辛苦了？',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我说的是事实啊，上班和上学的累确实不一样。但她好像更生气了。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'defensive', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 4: A反击 ──
    {
      id: 4,
      intensity: 0.7,
      narrator: 'A列举自己的压力来源，不甘被轻视',
      dialogue: { speaker: 'A', text: '我不懂？我每天看文献、跑实验、被导师催' },
      thoughts: {
        A: {
          text: '凭什么他觉得只有他累？我每天被导师催进度，实验数据还出了问题。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我不是说她不辛苦……我只是想说我真的没有多余的精力了。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'hurt', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 5: A的最后通牒 ──
    {
      id: 5,
      intensity: 0.8,
      narrator: 'A说出"不合适"，想要结束这种内耗',
      dialogue: { speaker: 'A', text: '我感觉我们不合适，我不想这样精神内耗下去了' },
      thoughts: {
        A: {
          text: '每次都是这样，我想聊天他说累，我说累他觉得我不懂。这样下去有什么意义。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她又说不合适了……每次吵架都要上升到分手吗？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'hurt', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 6: B的退缩 ──
    {
      id: 6,
      intensity: 0.7,
      narrator: 'B选择放弃沟通，A指出B逃避的模式',
      dialogue: { speaker: 'B', text: '随便你怎么想吧，我真的累了' },
      thoughts: {
        A: {
          text: '又来了，每次不想聊就说累。你跑什么啊。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我说什么都是错的。不如不说了。反正她已经决定了。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 7: 僵局 ──
    {
      id: 7,
      intensity: 0.75,
      narrator: '两人陷入僵局，谁都不愿先退一步',
      dialogue: { speaker: 'A', text: '不如一拍两散' },
      thoughts: {
        A: {
          text: '我不是真的想分手……但我不知道还能怎么让他重视这段关系。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '她为什么每次吵架都要说分手？我只是累了一天想休息，就变成不在乎了？',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },
  ],
}
