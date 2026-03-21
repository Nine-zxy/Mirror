// ─────────────────────────────────────────────────────────────
//  Pre-built scenario: 她 (A, 女) × 他 (B, 男)
//  Source: 周日早11-12 微信文字争论
//  Conflict: A忙碌无法见面 → B焦虑型依恋恐惧被抛弃 → 焦虑-回避依恋冲突
// ─────────────────────────────────────────────────────────────

export const scenario_p6 = {
  id: 'p6_anxious_avoidant_conflict',
  title: '你是不是不要我了',
  subtitle: 'Are You Pulling Away',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: '她',
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
      name: '他',
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
    // ── Beat 0: Trigger — A说忙，B恐慌 ──
    {
      id: 0,
      intensity: 0.2,
      narrator: '一次普通的"今天不方便见面"，点燃了深层的不安',
      dialogue: { speaker: 'A', text: '每次不开心不就是我说我没时间你就觉得又是我不想见你' },
      thoughts: {
        A: {
          text: '我只是说了一次没空，怎么又变成我不想见他了。每次都这样，我真的很无奈。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '她又说没时间了……是不是在找借口？我好怕这样下去她就真的不要我了。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'anxious', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 1: B的恐惧暴露 ──
    {
      id: 1,
      intensity: 0.35,
      narrator: 'B说出了内心最深的恐惧——害怕失去这段关系',
      dialogue: { speaker: 'B', text: '我超级超级怕和你闹掰。我真的对这种东西特别害怕' },
      thoughts: {
        A: {
          text: '又来了。每次都是这一套，害怕闹掰、害怕分开。我说什么他都能往那个方向想。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '我是真的怕。感觉啥原因都可能让我和她分开。我控制不住这种恐惧。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'defensive', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 2: A指出B的模式 ──
    {
      id: 2,
      intensity: 0.45,
      narrator: 'A试图指出B总是先把话说满、再自己推翻的模式',
      dialogue: { speaker: 'A', text: '你就是会口嗨，好像总要给自己找点苦吃' },
      thoughts: {
        A: {
          text: '他每次都是先说什么都行，过两天又自己否定。上次留学的事就是这样。',
          emotion: 'angry',
          bubbleType: 'cloud',
        },
        B: {
          text: '她根本不把我的感受当回事。我说的是真心话，在她看来就是口嗨？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 75, facing: 'left', pose: 'hurt', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 3: 话语权之争 ──
    {
      id: 3,
      intensity: 0.55,
      narrator: 'A觉得自己的声音从来不被听见，只有B在主导一切',
      dialogue: { speaker: 'A', text: '都是你说就对，我一说你就急' },
      thoughts: {
        A: {
          text: '从出去玩到以后的计划，全是他在定。我一说不同意见他就急了。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我真的是这样吗……她一说我就急？我只是怕她不要我了才急的啊。',
          emotion: 'reflective',
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

    // ── Beat 4: B的焦虑螺旋 ──
    {
      id: 4,
      intensity: 0.5,
      narrator: 'B承认了自己的焦虑——不是不信任，是控制不住的害怕',
      dialogue: { speaker: 'B', text: '怕这是你疏远我的表现' },
      thoughts: {
        A: {
          text: '为什么不同意他的就是疏远？他到底能不能信任我一次。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '我也不想这样，但心里就会怕。约她见面都排到十月了，她的九月真的没有我的位置吗。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'defensive', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'anxious', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── Beat 5: "胡闹"的伤口 ──
    {
      id: 5,
      intensity: 0.6,
      narrator: '"胡闹"这个词变成了两人之间反复撕裂的伤口',
      dialogue: { speaker: 'A', text: '我说你胡闹的都是你自己真在乱说' },
      thoughts: {
        A: {
          text: '我说胡闹是因为他确实在乱说。他自己点进去看看那些消息，哪条不是过分的。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '好怕闹闹猫被扔掉了。她总说我胡闹，可我说的都是真心话。在她眼里我永远是在无理取闹。',
          emotion: 'hurt',
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

    // ── Beat 6: B意识到恶性循环 ──
    {
      id: 6,
      intensity: 0.55,
      narrator: 'B发现自己陷入了越怕越不敢找、越不找越怕的死循环',
      dialogue: { speaker: 'B', text: '我感觉我都有点开始怕找你了' },
      thoughts: {
        A: {
          text: '他终于看到了这个循环。但他得出的结论不是改掉这个习惯，而是干脆不找我了？',
          emotion: 'surprised',
          bubbleType: 'cloud',
        },
        B: {
          text: '她忙，我一找她就可能说错话，说错话又是胡闹。那不如做少错少。可是不找她我又更怕。',
          emotion: 'withdrawn',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'surprised', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'withdrawn', lean: 'back', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 7: A的挫败感爆发 ──
    {
      id: 7,
      intensity: 0.65,
      narrator: '两人同时觉得对方在轻视自己，互相指责的声音越来越大',
      dialogue: { speaker: 'A', text: '一次不和你吃饭就是不要你了吗' },
      thoughts: {
        A: {
          text: '我今天本来就不舒服，就想休息一下。为什么一次不见面就变成了天大的事。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '你明明就是先轻视我。每次你一忙起来就开始轻视我，我总觉得我是最先被优化掉的。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 20, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 80, facing: 'left', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 8: 核心需求暴露 ──
    {
      id: 8,
      intensity: 0.5,
      narrator: 'B终于说出了最底层的需要——不是控制，是渴望被重视的日常连接',
      dialogue: { speaker: 'B', text: '我很看重日常的这种定期跟你的互动' },
      thoughts: {
        A: {
          text: '他说的我懂，但我真的做不到他要求的那种频率。我不是不想见他，是真的分身乏术。',
          emotion: 'reflective',
          bubbleType: 'cloud',
        },
        B: {
          text: '和我见面对于你来说感觉是一种负担了。我能看出她很努力，但努力本身就说明见面不再是享受了。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'reflective', lean: 'none', scale: 1.0, visible: true },
        B: { x: 72, facing: 'left', pose: 'hurt', lean: 'forward', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },

    // ── Beat 9: 悬而未决的张力 ──
    {
      id: 9,
      intensity: 0.4,
      narrator: '两人都想要对方，但对"在一起"的方式有着根本不同的想象',
      dialogue: { speaker: 'A', text: '我还是很想和你见' },
      thoughts: {
        A: {
          text: '我是真的想见他，但我需要他理解我不可能随时都有空。爱不等于时时刻刻在一起。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
        B: {
          text: '但久了后呢。她现在还想见我，可如果越来越忙、越来越累，我最终还是会被放弃的吧。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'apart', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'warm', lean: 'forward', scale: 1.0, visible: true },
        B: { x: 70, facing: 'left', pose: 'anxious', lean: 'none', scale: 1.0, visible: true },
      },
      duration: 5500,
      isPausePoint: false,
    },
  ],
}
