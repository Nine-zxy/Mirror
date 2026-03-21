// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: P5 — 周六晚8:30 couple
//  A = 嚼嚼鸡（蓝色）  B = couch potato（红色）
//  冲突主题：B去了前任家没告诉A，信任崩塌，情感表达困难
//  Gottman arc: Trigger → Escalation → Vulnerable Disclosure → Pain → Tentative Repair
// ─────────────────────────────────────────────────────────────

export const scenario_p5 = {
  id: 'p5_zhouliuwan2',
  title: '没有说出口的事',
  subtitle: 'Things Left Unsaid',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf', 'wallart'],

  personas: {
    A: {
      id: 'A',
      name: '嚼嚼鸡',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)',
      thoughtBorder: '#5882d0',
      hairColor: '#2c2c2c',
      outfitColor: '#e8e8e8',
      outfitDark: '#c8c8c8',
      spriteType: 'male',
    },
    B: {
      id: 'B',
      name: 'couch potato',
      label: 'PARTNER B',
      color: '#e87a7a',
      darkColor: '#c85a5a',
      glowColor: 'rgba(232,122,122,0.55)',
      thoughtBg: 'rgba(210,80,80,0.13)',
      thoughtBorder: '#d05050',
      hairColor: '#2c2c2c',
      outfitColor: '#555555',
      outfitDark: '#333333',
      spriteType: 'male',
    },
  },

  beats: [
    // ── Beat 0: 爆发 ──
    {
      id: 0,
      intensity: 0.7,
      narrator: '一件被隐瞒的事浮出水面，信任开始动摇',
      dialogue: { speaker: 'A', text: '我搞不懂，去他家摸狗有什么不能跟我说的，而且摸狗的时候但凡跟我讲一声呢？' },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'angry' },
        B: { x: 75, facing: 'left', pose: 'withdrawn' },
      },
      thoughts: {
        A: {
          text: '为什么要瞒着我？如果真的没什么，为什么不说？越想越觉得不对劲。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我知道我错了。但我不知道怎么解释。说什么都像在狡辩。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
    },

    // ── Beat 1: 质问 ──
    {
      id: 1,
      intensity: 0.75,
      narrator: '不是第一次了，积累的不安一起涌上来',
      dialogue: { speaker: 'A', text: '而且这个朋友是什么朋友你自己不清楚吗？这种事情也不是第一次了吧' },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'angry' },
        B: { x: 70, facing: 'left', pose: 'withdrawn' },
      },
      thoughts: {
        A: {
          text: '他每次都是这样，先沉默，再道歉，然后下次还是一样。我到底在坚持什么？',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '他说得对，不是第一次了。我为什么总是做这种让他失望的事？',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
      isPausePoint: true,
    },

    // ── Beat 2: 长篇坦白 ──
    {
      id: 2,
      intensity: 0.6,
      narrator: 'B写下了一段很长的话，试图把所有的困惑都说出来',
      dialogue: { speaker: 'B', text: '坦诚地说，我对你有喜欢，但不是那种很强烈的。这种并不浓烈的连接会让我们之间略为平淡。' },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'neutral' },
        B: { x: 75, facing: 'left', pose: 'withdrawn' },
      },
      thoughts: {
        A: {
          text: '他终于愿意说了。但这些话...每一句都让我的心往下沉。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '我第一次把这些话说出来。我不知道说完之后会怎样，但我不想再藏着了。',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
    },

    // ── Beat 3: 爱无能的自白 ──
    {
      id: 3,
      intensity: 0.65,
      narrator: 'B说出了最深处的恐惧',
      dialogue: { speaker: 'B', text: '我掩埋自己的情绪，也畏惧照顾别人的情绪。以前有人就给我下了审判——我没有爱人的能力。' },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'hurt' },
        B: { x: 70, facing: 'left', pose: 'withdrawn' },
      },
      thoughts: {
        A: {
          text: '他不是不爱我，他是不会爱。但知道这个又能怎样？我还是会受伤。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '说出来了。这是我一直不敢面对的东西。我不知道他能不能接受这样的我。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      isPausePoint: true,
    },

    // ── Beat 4: 矛盾的爱 ──
    {
      id: 4,
      intensity: 0.55,
      narrator: '看着对方的脸，和独处时的感受，是两种完全不同的状态',
      dialogue: { speaker: 'B', text: '当我看着你的脸的时候，我觉得爱。但是我自己一个人的时候，我不知道。我喜欢你，但是我总感觉失去了自由。' },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'hurt' },
        B: { x: 70, facing: 'left', pose: 'neutral' },
      },
      thoughts: {
        A: {
          text: '他说看着我的时候觉得爱。那不看着我的时候呢？我算什么？',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '我说的是真话。见面的时候我是真的喜欢他，但分开之后我就会回到自己的世界。我控制不了。',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
    },

    // ── Beat 5: 信任崩塌 ──
    {
      id: 5,
      intensity: 0.8,
      narrator: 'A说出了最痛的感受',
      dialogue: { speaker: 'A', text: '现在信任稍微有点崩塌了。好伤心。真的好伤心。' },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'hurt' },
        B: { x: 75, facing: 'left', pose: 'withdrawn' },
      },
      thoughts: {
        A: {
          text: '我一直在说服自己相信他，但这次我真的撑不住了。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '我伤害了他。这就是我一直害怕的结果——我的缺陷最终会伤害到在乎我的人。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      isPausePoint: true,
    },

    // ── Beat 6: 独自坚持 ──
    {
      id: 6,
      intensity: 0.7,
      narrator: '委屈和不甘交织在一起',
      dialogue: { speaker: 'A', text: '我就觉得只有我在在意这段感情而已。然后我就一边受着委屈一边哄好了自己，为了自己的不死心再坚持一下。' },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'hurt' },
        B: { x: 70, facing: 'left', pose: 'withdrawn' },
      },
      thoughts: {
        A: {
          text: '我不知道还能坚持多久。每次都是我在努力，他在旁观。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '他说得对。一直都是他在付出，我在接受。我不是不知道，我是不知道怎么回应。',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
    },

    // ── Beat 7: 质疑这段关系 ──
    {
      id: 7,
      intensity: 0.6,
      narrator: 'A开始质疑坚持的意义',
      dialogue: { speaker: 'A', text: '我有时候觉得就算我跟你分手了，你也不会有太难过的情绪' },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'withdrawn' },
        B: { x: 70, facing: 'left', pose: 'hurt' },
      },
      thoughts: {
        A: {
          text: '我想试探他。但我又怕他真的说"嗯，可能吧"。',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
        B: {
          text: '他这么想我也没办法反驳。因为我自己都不确定我会不会难过。这是不是就说明我真的有问题？',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
    },

    // ── Beat 8: B的回应——关于亲密关系的困惑 ──
    {
      id: 8,
      intensity: 0.5,
      narrator: 'B试着解释自己对亲密关系的理解',
      dialogue: { speaker: 'B', text: '我更喜欢两个人每天相处在一起，但又不会过分黏腻。我可能一直所追求的都是一段淡淡的亲密关系。' },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'neutral' },
        B: { x: 70, facing: 'left', pose: 'neutral' },
      },
      thoughts: {
        A: {
          text: '淡淡的亲密关系...但我需要的不是淡淡的。我需要确定感。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '这就是我能给出的最多了。我希望他能理解，但我知道这可能不够。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
    },

    // ── Beat 9: 尾声——不确定的坚持 ──
    {
      id: 9,
      intensity: 0.45,
      narrator: '没有结论，只有两个人各自的不确定',
      dialogue: { speaker: 'A', text: '想到你的时候还是会喜欢你。我觉得就还没有攒够失望，所以我决定活在当下。' },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'warm' },
        B: { x: 75, facing: 'left', pose: 'neutral' },
      },
      thoughts: {
        A: {
          text: '我知道他有他的问题。但我还没准备好放弃。哪怕每次都是我在哄自己。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
        B: {
          text: '他还愿意留下来。我不知道自己配不配得上这份坚持。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      isPausePoint: true,
    },
  ],
}
