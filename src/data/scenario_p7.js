// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: 处安 (A, 女) × 飞飞 (B, 男)
//  Source: 周日早12-13 微信文字聊天
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
      name: '飞飞',
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
    // ── Beat 0: 撒娇互怼 — 轻松的日常 ──
    {
      id: 0,
      intensity: 0.15,
      narrator: '两人像往常一样在微信上撒娇打闹，你来我往',
      dialogue: { speaker: 'A', text: '我伤心了😭 都怪你，害得我走反了' },
      thoughts: {
        A: {
          text: '就是随便撒个娇逗他，看他怎么接。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
        B: {
          text: '又在闹了，逗逗她好了。',
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

    // ── Beat 1: 冷淡信号 — B变冷淡 ──
    {
      id: 1,
      intensity: 0.3,
      narrator: '处安发现飞飞一直没回之前的消息，飞飞说自己在忙',
      dialogue: { speaker: 'A', text: '还不回我上面的信息' },
      thoughts: {
        A: {
          text: '怎么一直不回我消息，感觉被晾着了。',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
        B: {
          text: '确实在忙选课的事，但心里也有点堵。',
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

    // ── Beat 2: 追问 — A指出问题 ──
    {
      id: 2,
      intensity: 0.5,
      narrator: '处安正面指出飞飞从昨晚开始的冷淡，飞飞承认心情不好',
      dialogue: { speaker: 'A', text: '昨晚到现在都那么冷淡！很难不让人觉得在搞我！' },
      thoughts: {
        A: {
          text: '从昨晚到现在一直这样，我受伤了也困惑。他到底怎么了。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我确实心情不好，但不知道怎么跟她说原因。',
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

    // ── Beat 3: 回避 — B不愿解释 ──
    {
      id: 3,
      intensity: 0.5,
      narrator: '处安说想听飞飞说，飞飞直接拒绝了',
      dialogue: { speaker: 'B', text: '不想跟你说' },
      thoughts: {
        A: {
          text: '我都主动说想听了，他还是推开我。好受伤。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '怕说出来她会觉得我小气，还不如自己扛着。',
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

    // ── Beat 4: 身体不适 — B透露状况 ──
    {
      id: 4,
      intensity: 0.45,
      narrator: '飞飞提到自己耳朵冻伤了，处安心疼地追问',
      dialogue: { speaker: 'B', text: '我的耳朵冻伤了，这几天就过得如此好' },
      thoughts: {
        A: {
          text: '冻伤了？他怎么不早说，心疼死了。',
          emotion: 'surprised',
          bubbleType: 'cloud',
        },
        B: {
          text: '耳朵疼得要命，感冒也没好，整个人很惨。但也不想博同情。',
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

    // ── Beat 5: 继续追问 — A感觉不止这些 ──
    {
      id: 5,
      intensity: 0.4,
      narrator: '处安觉得冻伤不是全部原因，继续追问，飞飞含糊带过',
      dialogue: { speaker: 'A', text: '最近怎么了，还有什么别的不如意的事情嘛' },
      thoughts: {
        A: {
          text: '冻伤不至于让他这么冷淡，他肯定还有别的事瞒着我。',
          emotion: 'anxious',
          bubbleType: 'cloud',
        },
        B: {
          text: '她在追问了……那件事我真的说不出口。',
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

    // ── Beat 6: 指责与否认 — A爆发 ──
    {
      id: 6,
      intensity: 0.65,
      narrator: '处安的耐心消耗殆尽，直接指责飞飞故意冷落她',
      dialogue: { speaker: 'A', text: '我讨厌你，你就是故意让我冷落' },
      thoughts: {
        A: {
          text: '我已经够主动了，他还是这样。我不想再低声下气了。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她生气了……我不是故意的，但我确实做得不好。',
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

    // ── Beat 7: 拍照事件 — 隐藏的原因浮现 ──
    {
      id: 7,
      intensity: 0.55,
      narrator: '处安提到明天要和一个男生去公园拍照的安排',
      dialogue: { speaker: 'A', text: '下午2点半直接去见面，拍完可能四点多' },
      thoughts: {
        A: {
          text: '就是说一下明天的行程安排而已，很正常的事。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
        B: {
          text: '又提到这个了……她和别的男生去公园拍照，我心里更难受了。但我不敢说。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'hurt', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 8: 长文坦白 — B终于说出一切 ──
    {
      id: 8,
      intensity: 0.6,
      narrator: '飞飞发了一段长消息，说出了全部原因',
      dialogue: { speaker: 'B', text: '昨天下午你说你要去拍那个什么嘛，然后我就感觉有点嫉妒，因为你打扮得漂漂亮亮的跟一个男生出去逛公园拍照这种经历我都还没有过。再加上耳朵冻伤、感冒、长痘，心情就更差了。我不想让你以后遇到类似情况的时候会不由自主地想到哎呀飞飞又要发病了然后做出违心的选择' },
      thoughts: {
        A: {
          text: '原来他一直在忍着这些……吃醋、生病、疲惫，什么都没跟我说。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '终于全说出来了。嫉妒、身体不舒服、精神疲惫，全部混在一起压了好几天。',
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

    // ── Beat 9: 温暖回应 — A理解并安慰 ──
    {
      id: 9,
      intensity: 0.3,
      narrator: '处安表示理解，解释拍照只是工作性质，飞飞感到被安慰',
      dialogue: { speaker: 'A', text: '我理解你这几天的情绪了，没关系，我知道你不是故意凶我的' },
      thoughts: {
        A: {
          text: '他一个人扛了好几天，身体不舒服还在忍着。我会好好跟他解释的。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
        B: {
          text: '她没有骂我小气……她说她理解。我经常觉得我性格很烂，但她说她很幸福。',
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
