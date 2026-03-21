// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: mint (A, 女) × 朧月 (B, 女)
//  Conflict: A发现B没有删前任联系方式 → 感觉被欺骗 → B道歉挣扎
// ─────────────────────────────────────────────────────────────

export const scenario_p8 = {
  id: 'p8_deleted_contact',
  title: '被删除的联系方式',
  subtitle: 'The Deleted Contact',
  scene: 'livingroom_evening',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: 'mint',
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
      name: '朧月',
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
    // ── Beat 0: 发现 ──
    {
      id: 0,
      intensity: 0.2,
      narrator: 'A随口提起前任的话题，语气看似轻松',
      dialogue: { speaker: 'A', text: '你把你前任删了...我还想看她朋友圈' },
      thoughts: {
        A: {
          text: '随便问问而已，应该早就删了吧。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
        B: {
          text: '她怎么突然提这个……我还没删。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
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

    // ── Beat 1: 真相浮出 ──
    {
      id: 1,
      intensity: 0.4,
      narrator: 'A发现B其实还留着前任的联系方式',
      dialogue: { speaker: 'A', text: '你都有联系方式，哎呀气死我了' },
      thoughts: {
        A: {
          text: '她居然还没删？说好了的呢？',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '完了，她知道了。其实也真没联系过。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'anxious', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 2: B的辩解 ──
    {
      id: 2,
      intensity: 0.45,
      narrator: 'B试图用"没联系过"来解释，但显得苍白',
      dialogue: { speaker: 'B', text: '真的也没有说话嘛，我朋友圈设置的不可见' },
      thoughts: {
        A: {
          text: '没说话就行了吗？重点是你说过要删的。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我确实没有联系过她……但留着这件事本身就说不过去。',
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

    // ── Beat 3: A的反击 ──
    {
      id: 3,
      intensity: 0.55,
      narrator: 'A用同样的逻辑反问，B立刻不同意',
      dialogue: { speaker: 'A', text: '那我把我前任加回来，我也不聊天' },
      thoughts: {
        A: {
          text: '你能留着，那我也加回来呗。看你什么反应。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '那不一样……但我说不出来哪里不一样。',
          emotion: 'defensive',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'defensive', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 4: A追问删除时机 ──
    {
      id: 4,
      intensity: 0.55,
      narrator: 'A质疑B为什么一直拖着不删',
      dialogue: { speaker: 'A', text: '需要那么晚才想起来吗' },
      thoughts: {
        A: {
          text: '如果真不在意，早就删了。拖到现在才想起来？',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '不是想起来……是我根本没把这当回事。但这话说出去更伤人。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 5: A定性为欺骗 ──
    {
      id: 5,
      intensity: 0.65,
      narrator: 'A将这件事定义为欺骗，上升到原则问题',
      dialogue: { speaker: 'A', text: '这算是一定程度的欺骗，这是一级问题' },
      thoughts: {
        A: {
          text: '不是联系方式的问题，是她骗了我。说删了结果没删，这就是欺骗。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '一级问题……她是真的很生气。我确实做错了。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'anxious', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 6: B的道歉困难 ──
    {
      id: 6,
      intensity: 0.6,
      narrator: 'A指出B连道歉都不会，B艰难说出对不起',
      dialogue: { speaker: 'A', text: '你是不会道歉吗' },
      thoughts: {
        A: {
          text: '她到现在都没有一句正经的道歉。是不觉得自己有错吗？',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我知道该道歉……但我不知道怎么说才够。"对不起"三个字感觉太轻了。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 78, facing: 'left', pose: 'withdrawn', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 7: A的深层伤害 ──
    {
      id: 7,
      intensity: 0.7,
      narrator: 'A说出了更深的感受：B只是怕她离开，不是真的在乎',
      dialogue: { speaker: 'A', text: '语言上没有安抚我行为上没有安慰我，你只是不习惯我不理你怕我离开而已' },
      thoughts: {
        A: {
          text: '她根本不是心疼我受伤，只是怕我走。这种道歉毫无意义。',
          emotion: 'hurt',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她说得对吗……我是真的在意她，还是只是害怕她离开？我分不清了。',
          emotion: 'reflective',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'reflective', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 8: B的自我反思 ──
    {
      id: 8,
      intensity: 0.55,
      narrator: 'B开始正视自己的问题，承认为了维持表面和谐而撒谎',
      dialogue: { speaker: 'B', text: '其实归根到底好像只能说我是个为了假装和谐而撒谎的人' },
      thoughts: {
        A: {
          text: '她终于在正视了。至少这句话是真心的。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '我确实是这样的人。怕冲突，所以选择隐瞒。但隐瞒本身就是更大的冲突。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'reflective', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 9: 试探性修复 ──
    {
      id: 9,
      intensity: 0.35,
      narrator: 'A选择相信B，同时关心B的身体状况',
      dialogue: { speaker: 'A', text: '你说不会了我会相信你的' },
      thoughts: {
        A: {
          text: '我选择相信她。但下次再这样，我真的会走。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
        B: {
          text: '她愿意再给我一次机会。这次我不能再让她失望了。',
          emotion: 'warm',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 35, facing: 'right', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 65, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },
  ],
}
