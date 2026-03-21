// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: P4 — 周六晚 couple
//  A = 白（女生，蓝色）  B = 黑（男生，红色）
//  冲突主题：男生说看综艺是gay，女生觉得被冒犯、不被尊重
//  Gottman arc: Trigger → Escalation → Deadlock → Rupture → Repair
// ─────────────────────────────────────────────────────────────

export const scenario_p4 = {
  id: 'p4_zhouliuwan',
  title: '综艺与尊重',
  subtitle: 'Variety Shows & Respect',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf', 'wallart'],

  personas: {
    A: {
      id: 'A',
      name: '白',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      spriteType: 'female',
    },
    B: {
      id: 'B',
      name: '黑',
      label: 'PARTNER B',
      color: '#e87a7a',
      darkColor: '#c85a5a',
      glowColor: 'rgba(232,122,122,0.55)',
      spriteType: 'male',
    },
  },

  beats: [
    // ── Beat 0: 起因 Trigger ──
    {
      id: 0,
      intensity: 0.2,
      narrator: '一段关于综艺的闲聊，气氛突然变了',
      dialogue: { speaker: 'B', text: '全是综艺和明星' },
      thoughts: {
        A: {
          text: '怎么了，我看综艺有什么问题吗？他语气怪怪的。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '随口说说而已，又没什么恶意。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
      },
      characters: {
        A: { x: 25, facing: 'right', pose: 'neutral' },
        B: { x: 75, facing: 'left', pose: 'neutral' },
      },
    },

    // ── Beat 1: 冒犯发生 ──
    {
      id: 1,
      intensity: 0.35,
      narrator: '一个词，点燃了导火索',
      dialogue: { speaker: 'A', text: '肯定有男生爱看' },
      thoughts: {
        A: {
          text: '他凭什么这么说？爱看综艺跟性别有什么关系？',
          emotion: 'angry',
          bubbleType: 'cloud',
        },
        B: {
          text: '我就开个玩笑，她怎么这么认真？',
          emotion: 'surprised',
          bubbleType: 'cloud',
        },
      },
      characters: {
        A: { x: 25, facing: 'right', pose: 'defensive' },
        B: { x: 75, facing: 'left', pose: 'neutral' },
      },
    },

    // ── Beat 2: 冷战边缘 ──
    {
      id: 2,
      intensity: 0.5,
      narrator: '她用沉默表达愤怒，他还没意识到严重性',
      dialogue: { speaker: 'A', text: '哦' },
      thoughts: {
        A: {
          text: '我不想跟他说话了。他说的那个词让我很不舒服。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
        B: {
          text: '她怎么突然不说话了？我说错什么了吗？',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
      },
      characters: {
        A: { x: 20, facing: 'right', pose: 'withdrawn' },
        B: { x: 75, facing: 'left', pose: 'anxious' },
      },
    },

    // ── Beat 3: 正面冲突 ──
    {
      id: 3,
      intensity: 0.65,
      narrator: '她说出了自己的感受，他不理解为什么这么严重',
      dialogue: { speaker: 'A', text: '但你这几句话让我非常非常非常非常非常非常不舒服' },
      thoughts: {
        A: {
          text: '他用那个词的时候根本没考虑过我的感受。这不是开玩笑，这是不尊重。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '至于吗？我真的只是随口一说，她为什么反应这么大？',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
      },
      characters: {
        A: { x: 30, facing: 'right', pose: 'angry' },
        B: { x: 70, facing: 'left', pose: 'defensive' },
      },
      isPausePoint: true,
    },

    // ── Beat 4: 各执一词 ──
    {
      id: 4,
      intensity: 0.7,
      narrator: '两个人对同一个词有完全不同的理解',
      dialogue: { speaker: 'B', text: '那不是中性词吗？你看不起gay啊' },
      thoughts: {
        A: {
          text: '他居然反过来说我看不起人？明明是他先用这个词来贬低看综艺的人。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我真的觉得这就是个中性词。她为什么非要往侮辱的方向理解？',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
      },
      characters: {
        A: { x: 30, facing: 'right', pose: 'angry' },
        B: { x: 70, facing: 'left', pose: 'defensive' },
      },
    },

    // ── Beat 5: 核心矛盾浮现 ──
    {
      id: 5,
      intensity: 0.8,
      narrator: '她在意的不是那个词本身，而是背后的态度',
      dialogue: { speaker: 'A', text: '我在意的不是这件小事，而是你始终不肯尊重我的喜好' },
      thoughts: {
        A: {
          text: '每次涉及我喜欢的东西，他都带着一种轻蔑。这不是第一次了。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我什么时候不尊重她了？我陪她看了那么多综艺，她怎么全忘了？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      characters: {
        A: { x: 35, facing: 'right', pose: 'angry' },
        B: { x: 65, facing: 'left', pose: 'hurt' },
      },
      isPausePoint: true,
    },

    // ── Beat 6: 狡辩与僵局 ──
    {
      id: 6,
      intensity: 0.75,
      narrator: '他试图讲道理，她觉得他在转移话题',
      dialogue: { speaker: 'A', text: '我之前怎么没发现你这么会狡辩和转移话题' },
      thoughts: {
        A: {
          text: '他根本不是在道歉，他在找各种理由证明自己没错。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我在试着解释，她却说我在狡辩。我怎么说都是错的。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      characters: {
        A: { x: 35, facing: 'right', pose: 'angry' },
        B: { x: 65, facing: 'left', pose: 'withdrawn' },
      },
    },

    // ── Beat 7: 破裂 ──
    {
      id: 7,
      intensity: 0.9,
      narrator: '最怕的那句话说出了口',
      dialogue: { speaker: 'A', text: '不能理解就分手行吗' },
      thoughts: {
        A: {
          text: '我知道不该说这个字。但我太生气了，我想让他知道我有多认真。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '又来了。分手对她来说就这么容易说出口吗？我之前做的一切都不算数？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      characters: {
        A: { x: 40, facing: 'right', pose: 'angry' },
        B: { x: 60, facing: 'left', pose: 'hurt' },
      },
      isPausePoint: true,
    },

    // ── Beat 8: 他的解释 ──
    {
      id: 8,
      intensity: 0.6,
      narrator: '他终于说出了一段完整的心里话',
      dialogue: { speaker: 'B', text: '我没有不包容你的爱好啊。如果我不包容，我之前怎么会每次出去玩都跟你一起看。错在我，我不应该说出你觉得侮辱性的话。' },
      thoughts: {
        A: {
          text: '他终于肯正面回应了。但他真的理解我为什么生气吗？',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '我真的没有恶意。我只是嘴笨，不会说话。我不想因为这个失去她。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
      },
      characters: {
        A: { x: 35, facing: 'right', pose: 'neutral' },
        B: { x: 65, facing: 'left', pose: 'warm' },
      },
    },

    // ── Beat 9: 尾声 ──
    {
      id: 9,
      intensity: 0.35,
      narrator: '争吵暂时平息，但心里的结还在',
      dialogue: { speaker: 'A', text: '对不起是我太敏感了。我要睡觉了。' },
      thoughts: {
        A: {
          text: '我不是太敏感。但我不想再吵了。说"太敏感"是我给自己找的台阶。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
        B: {
          text: '她说太敏感了...但她真的释怀了吗？我以后真的要注意说话方式。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      characters: {
        A: { x: 25, facing: 'right', pose: 'withdrawn' },
        B: { x: 75, facing: 'left', pose: 'warm' },
      },
    },
  ],
}
