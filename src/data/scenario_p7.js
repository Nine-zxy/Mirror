// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: 处安 (A, 女) × _ (B, 男)
//  Conflict: B军训期间变冷淡 → A感觉被忽视 → B最终坦白：吃醋+生病+疲惫
// ─────────────────────────────────────────────────────────────

export const scenario_p7 = {
  id: 'p7_coldness_unspoken_worries',
  title: '冷淡与心事',
  subtitle: 'Coldness and Unspoken Worries',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: '处安',
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
      name: '_',
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
    // ── Beat 0: 轻松的日常打闹 ──
    {
      id: 0,
      intensity: 0.15,
      narrator: '两人像平常一样在微信上打闹，语气轻松',
      dialogue: { speaker: 'A', text: '我伤心了' },
      thoughts: {
        A: {
          text: '就随便撒个娇而已，看他怎么回。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
        B: {
          text: '她又在闹了，逗逗她好了。',
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

    // ── Beat 1: B开始冷淡 ──
    {
      id: 1,
      intensity: 0.3,
      narrator: 'B的回复变得简短敷衍，A察觉到了异样',
      dialogue: { speaker: 'B', text: '不是，刚在选课' },
      thoughts: {
        A: {
          text: '怎么突然这么敷衍？我做错什么了吗？',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
        B: {
          text: '心里堵得慌，不太想说话。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'neutral', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 2: A指出B的冷淡 ──
    {
      id: 2,
      intensity: 0.5,
      narrator: 'A正面指出B从昨晚开始的冷淡态度',
      dialogue: { speaker: 'A', text: '昨晚到现在都那么冷淡！很难不让人觉得在搞我！' },
      thoughts: {
        A: {
          text: '从昨晚到现在一直这样，不是一两句的问题了。他到底怎么了。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我不是故意冷她的……但我现在真的没有力气解释。',
          emotion: 'defensive',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'defensive', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 3: B含糊回避 ──
    {
      id: 3,
      intensity: 0.45,
      narrator: 'B只说心情不好，没有给出具体原因',
      dialogue: { speaker: 'B', text: '心情不太好而已，很多事情' },
      thoughts: {
        A: {
          text: '什么叫很多事情？你不说我怎么知道啊。',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
        B: {
          text: '说了她会觉得我小气吧……吃醋这种事太丢人了。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'anxious', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 4: A主动想听 ──
    {
      id: 4,
      intensity: 0.5,
      narrator: 'A试图拉近距离，B却直接拒绝倾诉',
      dialogue: { speaker: 'B', text: '不想跟你说' },
      thoughts: {
        A: {
          text: '我都说了想听你说了，你还推开我。好受伤。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '我说出来怕她觉得我在无理取闹。还不如自己扛。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 5: B透露身体状况 ──
    {
      id: 5,
      intensity: 0.55,
      narrator: 'B提到了耳朵冻伤和身体不适',
      dialogue: { speaker: 'B', text: '我的耳朵冻伤了，这几天就过得如此好' },
      thoughts: {
        A: {
          text: '耳朵冻伤了？他怎么不早说啊，心疼死了。',
          emotion: 'surprised',
          bubbleType: 'cloud',
        },
        B: {
          text: '军训太折腾了，耳朵疼得要命，感冒也没好。不想让她担心但也扛不住了。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'surprised', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 6: A继续追问 ──
    {
      id: 6,
      intensity: 0.45,
      narrator: 'A感觉还有别的原因，继续追问',
      dialogue: { speaker: 'A', text: '最近怎么了，还有什么别的不如意的事情嘛' },
      thoughts: {
        A: {
          text: '冻伤不至于让他这么冷淡吧，肯定还有别的事。',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
        B: {
          text: '她在追问了……那件事我真的不知道怎么开口。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'neutral', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 7: 矛盾升级 ──
    {
      id: 7,
      intensity: 0.65,
      narrator: 'A的耐心消耗殆尽，直接指责B故意冷落',
      dialogue: { speaker: 'A', text: '我讨厌你，你就是故意让我冷落' },
      thoughts: {
        A: {
          text: '我已经够主动了，他还是这样。算了，我不想再低声下气了。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她生气了……我不是故意的。但我确实在因为那件事赌气。',
          emotion: 'defensive',
          bubbleType: 'hesitation',
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

    // ── Beat 8: B的长消息坦白 ──
    {
      id: 8,
      intensity: 0.6,
      narrator: 'B终于说出了全部原因：吃醋、生病、疲惫',
      dialogue: { speaker: 'B', text: '不想让你以后遇到类似情况做出违心的选择' },
      thoughts: {
        A: {
          text: '原来他是因为那个拍照的事吃醋了……再加上生病，难怪这几天这样。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '终于说出来了。她和那个男生去公园拍照的事一直堵在心里，加上身体不舒服，什么情绪都混在一起了。',
          emotion: 'hurt',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 6000,
      isPausePoint: false,
    },

    // ── Beat 9: A的温暖回应 ──
    {
      id: 9,
      intensity: 0.35,
      narrator: 'A表示理解，并解释拍照只是工作需要',
      dialogue: { speaker: 'A', text: '我理解你这几天的情绪了，没关系' },
      thoughts: {
        A: {
          text: '他终于愿意说了。这几天他一个人扛着这些，又生病又难受。我会好好跟他解释的。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
        B: {
          text: '她没有骂我小气……她说她理解。心里一下子松了好多。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 35, facing: 'right', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 65, facing: 'left', pose: 'reflective', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },
  ],
}
