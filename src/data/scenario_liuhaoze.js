// ─────────────────────────────────────────────────────────────
//  RSL v2 — 刘晓艺 & 李浩哲
//  "那局游戏之后 / After That Game"
//
//  背景：王者荣耀10v10，晓艺(鲁班)打了红buff被大司命玩家说了，
//  游戏结束后两人在微信上因此吵架，从游戏规则争执升级到沟通方式的冲突。
//  恋爱2-3年，冲突频率每月几次。
//
//  冲突弧线（Gottman, 10幕）：
//    1. Trigger → 2. Defense → 3. Escalation → 4. Deadlock
//    → 5. Forced Closure → 6. Grudge → 7. Meta-Conflict
//    → 8. Blame Spiral → 9. Breakdown → 10. Repair
// ─────────────────────────────────────────────────────────────

export const scenario_liuhaoze = {
  id: 'game_conflict_liuhaoze',
  title: '那局游戏之后',
  subtitle: 'After That Game',
  scene: 'bedroom_night',
  sceneElements: ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf'],

  personas: {
    A: {
      id: 'A',
      name: '晓艺',
      label: 'PARTNER A',
      color: '#7ab0e8',
      darkColor: '#4a80c8',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)',
      thoughtBorder: '#5882d0',
      spriteType: 'female',
      hairStyle: 'medium',
      outfitStyle: 'casual',
      accessory: 'none',
    },
    B: {
      id: 'B',
      name: '浩哲',
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
    // ── 第1幕：起因 Trigger ──
    {
      id: 0,
      intensity: 0.2,
      narrator: '一局10v10结束后，浩哲提起了游戏里发生的事',
      dialogue: { speaker: 'B', text: '因为人家是打野呀，你把他的钱都吃了，他经济比辅助还低' },
      thoughts: {
        A: {
          text: '不就是打了个红buff吗，至于这么较真吗？我又不是故意的，我都不知道大司命是打野的。',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '我想跟她解释一下游戏规则，这不是什么大事，说清楚就好了。',
          emotion: 'neutral',
          bubbleType: 'cloud',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 30, facing: 'right', pose: 'neutral', lean: 'none', scale: 1.0 },
        B: { x: 70, facing: 'left', pose: 'neutral', lean: 'none', scale: 1.0 },
      },
      duration: 6000,
      isPausePoint: false,
    },

    // ── 第2幕：防御 Defense ──
    {
      id: 1,
      intensity: 0.35,
      narrator: '晓艺不觉得自己有问题，开始为自己辩护',
      dialogue: { speaker: 'A', text: '找不到是他没本事。他可以去其他片区的' },
      thoughts: {
        A: {
          text: '10v10又没那么多规矩，野怪一直有的，他可以去别的地方打。为什么要怪我？',
          emotion: 'defensive',
          bubbleType: 'cloud',
        },
        B: {
          text: '她还在为自己找理由……打野就是打野的，其他线是其他人的，这不是很基本的道理吗？',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'neutral', divider: false },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'defensive', lean: 'none', scale: 1.0 },
        B: { x: 70, facing: 'left', pose: 'anxious', lean: 'none', scale: 1.0 },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── 第3幕：升级 Escalation ──
    {
      id: 2,
      intensity: 0.55,
      narrator: '晓艺开始用激将的方式回应',
      dialogue: { speaker: 'A', text: '我就抢，我就缺德，他来打我好了' },
      thoughts: {
        A: {
          text: '他在指责我，我又没做错什么。他为什么要站在别人那边说我？那我就缺德好了。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她怎么还这样说？本来只是想解释一下，她为什么要骂人家没本事？越说越过分了。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'distancing', divider: false },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0 },
        B: { x: 72, facing: 'left', pose: 'defensive', lean: 'back', scale: 1.0 },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── 第4幕：僵局 Deadlock ──
    {
      id: 3,
      intensity: 0.7,
      narrator: '双方各执一词，谁也不肯先退让',
      dialogue: { speaker: 'A', text: '手长在我身上，我想打就打' },
      thoughts: {
        A: {
          text: '凭什么只有我的问题？他自己也打过野怪，凭什么说我？我不服。',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '我已经在克制自己了，她为什么不停？我不想吵架，但她一副理所当然的样子让我越来越难受。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 22, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0 },
        B: { x: 78, facing: 'left', pose: 'hurt', lean: 'back', scale: 0.95 },
      },
      duration: 6000,
      isPausePoint: true,
    },

    // ── 第5幕：强制结束 Forced Closure ──
    {
      id: 4,
      intensity: 0.5,
      narrator: '浩哲试图终止争论',
      dialogue: { speaker: 'B', text: '你再和我犟也没用，现在知道了就不要再吵了。要准备睡觉了宝贝' },
      thoughts: {
        A: {
          text: '他又在压我。为什么每次都是我要闭嘴？他说完了我就要停？',
          emotion: 'withdrawn',
          bubbleType: 'cloud',
        },
        B: {
          text: '求求了别说了，再说下去只会更糟。我想赶紧结束这件事，明天还要早起。',
          emotion: 'anxious',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'withdrawn', lean: 'none', scale: 1.0 },
        B: { x: 75, facing: 'left', pose: 'anxious', lean: 'back', scale: 1.0 },
      },
      duration: 5000,
      isPausePoint: false,
    },

    // ── 第6幕：记账 Grudge Logging ──
    {
      id: 5,
      intensity: 0.55,
      narrator: '晓艺开始把吵架的事记下来，浩哲看到后更难受了',
      dialogue: { speaker: 'B', text: '我看到更不舒服了。为什么我们要记仇' },
      thoughts: {
        A: {
          text: '记下来吧，记完心里舒服一点。这两天吵太多了，我需要一个出口。我不是记仇，是记录。',
          emotion: 'withdrawn',
          bubbleType: 'cloud',
        },
        B: {
          text: '她在记仇？她把我们吵架的事都写下来了？我看到那些字好难受，为什么要这样？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'withdrawn', lean: 'none', scale: 1.0 },
        B: { x: 75, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0 },
      },
      duration: 6000,
      isPausePoint: false,
    },

    // ── 第7幕：元冲突 Meta-Conflict ──
    {
      id: 6,
      intensity: 0.8,
      narrator: '话题从游戏转向了沟通方式——他们开始争论"怎么吵架"',
      dialogue: { speaker: 'A', text: '是因为我难受了，所以才开始阴阳怪气的。你的话语和情绪让我难受了' },
      thoughts: {
        A: {
          text: '我知道阴阳怪气不好，但我是被他先伤到了才这样的。我感觉受到攻击的时候就会反击。',
          emotion: 'hurt',
          bubbleType: 'cloud',
        },
        B: {
          text: '她每次都用阴阳怪气来回应我，我真的受不了这种方式。我只想好好讲道理，为什么她就不能好好说话？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 28, facing: 'right', pose: 'hurt', lean: 'none', scale: 1.0 },
        B: { x: 72, facing: 'left', pose: 'hurt', lean: 'none', scale: 1.0 },
      },
      duration: 7000,
      isPausePoint: true,
    },

    // ── 第8幕：指责螺旋 Blame Spiral ──
    {
      id: 7,
      intensity: 0.85,
      narrator: '双方都觉得是对方先开始的',
      dialogue: { speaker: 'B', text: '为什么都是我的错？你以前还说刺激我很好玩，我越来越难受' },
      thoughts: {
        A: {
          text: '一个巴掌拍不响，为什么他只看到我的问题？他说那些话的时候就没想过我的感受吗？',
          emotion: 'angry',
          bubbleType: 'aggressive',
        },
        B: {
          text: '她一直在刺激我，我不阴阳怪气她，是因为我喜欢她尊重她，不是因为我说不过她。她为什么不懂？',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'far', divider: true },
      spatial: {
        A: { x: 25, facing: 'right', pose: 'angry', lean: 'forward', scale: 1.0 },
        B: { x: 75, facing: 'left', pose: 'hurt', lean: 'back', scale: 0.9 },
      },
      duration: 6000,
      isPausePoint: false,
    },

    // ── 第9幕：情绪崩溃 Breakdown ──
    {
      id: 8,
      intensity: 0.95,
      narrator: '浩哲情绪崩溃了',
      dialogue: { speaker: 'B', text: '我受不了了，我哭的好厉害。为什么老是这样子，我以前都不怎么哭的' },
      thoughts: {
        A: {
          text: '他哭了……是我太过分了吗？我不想让他这么难过的。看到他哭我才意识到自己的攻击性有多伤人。',
          emotion: 'warm',
          bubbleType: 'cloud',
        },
        B: {
          text: '为什么我们总是这样？我不想吵架，我只是想好好在一起。我越来越控制不住自己的情绪了。我好累。',
          emotion: 'hurt',
          bubbleType: 'hesitation',
        },
      },
      proxemic: { state: 'distancing', divider: false },
      spatial: {
        A: { x: 35, facing: 'right', pose: 'warm', lean: 'forward', scale: 1.0 },
        B: { x: 68, facing: 'left', pose: 'hurt', lean: 'back', scale: 0.9 },
      },
      duration: 7000,
      isPausePoint: true,
    },

    // ── 第10幕：修复 Repair ──
    {
      id: 9,
      intensity: 0.35,
      narrator: '两个人开始坦诚地面对各自的问题',
      dialogue: { speaker: 'A', text: '我最大的不好就是攻击最亲近的人。我现在找不到平替的方法' },
      thoughts: {
        A: {
          text: '我知道自己的问题——受伤的时候就用攻击来保护自己。我不想这样，但我不知道怎么改。睡觉吧，我爱你。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
        B: {
          text: '她终于愿意面对了。我也有问题，我这段时间太较真了。我只希望她有话好好说。阴阳怪气解决不了问题，只会激化矛盾。',
          emotion: 'reflective',
          bubbleType: 'warm',
        },
      },
      proxemic: { state: 'close', divider: false },
      spatial: {
        A: { x: 38, facing: 'right', pose: 'warm', lean: 'forward', scale: 1.0 },
        B: { x: 62, facing: 'left', pose: 'warm', lean: 'forward', scale: 1.0 },
      },
      duration: 7000,
      isPausePoint: false,
    },
  ],
}
