// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: 咩咩 (A, 男) × 对方 (B, 女)
//  Source: 通话后微信争论
//  Conflict: 通话中A与别人打招呼 → B觉得A"谄媚" → 实质是安全感问题
// ─────────────────────────────────────────────────────────────

export const scenario_p3 = {
  id: 'p3_chanmei_conflict',
  title: '谁在谄媚',
  subtitle: 'Who Is Flattering Whom',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: '咩咩',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)',
      thoughtBorder: '#5882d0',
      spriteType: 'male',
      hairStyle: 'short',
      outfitStyle: 'casual',
      accessory: 'none',
    },
    B: {
      id: 'B',
      name: '对方',
      label: 'PARTNER B',
      color: '#e87a7a',
      darkColor: '#b84a4a',
      glowColor: 'rgba(232,122,122,0.55)',
      thoughtBg: 'rgba(210,80,80,0.13)',
      thoughtBorder: '#c85050',
      spriteType: 'female',
      hairStyle: 'long',
      outfitStyle: 'casual',
      accessory: 'none',
    },
  },

  beats: [
    // ── Beat 0: Trigger — "这次又要几天" ──
    {
      id: 0,
      intensity: 0.15,
      narrator: '通话结束后，一场关于"对方怎么看我"的争论开始了',
      dialogue: { speaker: 'A', text: '我在你眼里哪哪都不好，我真不知道该怎么做了' },
      thoughts: {
        A: {
          text: '她又开始了。我做什么都不对，到底怎样才能让她满意。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '我明明没有觉得他哪哪都不好，他为什么要这样曲解我的意思？',
          emotion: 'hurt',
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

    // ── Beat 1: Core issue surfaces — B reveals the real trigger ──
    {
      id: 1,
      intensity: 0.3,
      narrator: '争论的焦点浮出水面——不是上课，而是A对别人的态度',
      dialogue: { speaker: 'B', text: '我是因为你和别人打招呼很谄媚' },
      thoughts: {
        A: {
          text: '谄媚？我只是正常打个招呼，她这是什么意思？难道我对她就不好了？',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '他和别人说话的时候那个语气，跟和我说话完全不一样。他自己感觉不到吗？',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'defensive', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 2: Escalation — A feels nothing he does is enough ──
    {
      id: 2,
      intensity: 0.5,
      narrator: 'A觉得自己付出很多却不被认可，开始列举自己的好',
      dialogue: { speaker: 'A', text: '你就是不满足，我对你还不够上心' },
      thoughts: {
        A: {
          text: '我对她比对谁都好，她居然还觉得不够。我对别人有她十分之一好，别人都受宠若惊了。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我不是不满足，我只是想让他知道他和别人说话的态度让我不舒服。他怎么就听不懂呢。',
          emotion: 'hurt',
          bubbleType: 'cloud',
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

    // ── Beat 3: Deflection attempt — Brief lighthearted exchange ──
    {
      id: 3,
      intensity: 0.35,
      narrator: '两人试图用玩笑话缓解气氛，但根本问题还在',
      dialogue: { speaker: 'B', text: '我恨不得点火箭把你送到外太空' },
      thoughts: {
        A: {
          text: '她在开玩笑了，是不是气消了一点？那我也配合一下。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
        B: {
          text: '我用玩笑话带过去吧，但其实心里还是很不舒服。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 4500,
      isPausePoint: false,
    },

    // ── Beat 4: A's grievance — A lists what he's done ──
    {
      id: 4,
      intensity: 0.55,
      narrator: 'A开始数自己的付出，觉得不被珍惜',
      dialogue: { speaker: 'A', text: '我就不要求你什么，我要写论文搞个什么也从没找过你' },
      thoughts: {
        A: {
          text: '我什么事都自己扛，从来不麻烦她，还把她捧着当宝贝。她到底还想怎样。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '他在数他的付出了……可我也没说他不好啊，我只是说了一个具体的事情。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'defensive', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'hurt', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 5: The real hurt — A reveals exhaustion ──
    {
      id: 5,
      intensity: 0.6,
      narrator: 'A的核心感受终于说出来——不是愤怒，是疲惫和挫败',
      dialogue: { speaker: 'A', text: '我是感觉我都做的很尽力了，但一直都做不好，达不到你的要求' },
      thoughts: {
        A: {
          text: '我真的已经尽力了。无论怎么做她都不满意，我好累。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
        B: {
          text: '他说他做不好……我也没说他做得不好啊。他怎么把我说的话理解成了这样。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 6: B explains her need — B reveals what she actually wants ──
    {
      id: 6,
      intensity: 0.5,
      narrator: 'B终于说出了真正的需求——不是要A"谄媚"，而是需要安全感',
      dialogue: { speaker: 'B', text: '你以前和我打电话都不和别人说话，现在和别人聊起来，我也不知道你在和谁说话' },
      thoughts: {
        A: {
          text: '原来她是因为这个……她不是嫌我对她不好，是觉得不安。',
          emotion: 'surprised',
          bubbleType: 'cloud',
        },
        B: {
          text: '我不是要他对别人冷淡，我只是想知道他在和谁说话。我需要知道发生了什么，才能安心。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'surprised', lean: 'none', scale: 1.0, visible: true },
        B: { x: 68, facing: 'left', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 7: Repair — They start understanding each other ──
    {
      id: 7,
      intensity: 0.35,
      narrator: '两人开始找到具体的解决方式，从对抗转向协商',
      dialogue: { speaker: 'B', text: '你告诉我一声，让我知道你没和我说话' },
      thoughts: {
        A: {
          text: '原来她要的就这么简单……我以为她要我改掉什么大毛病。以后跟她说一声就好了。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
        B: {
          text: '他愿意听了。其实我要的不多，就是让我知道而已。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'close', divider: false },
      spatial: {
        A: { x: 35, facing: 'right', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 65, facing: 'left', pose: 'warm', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },
  ],
}
