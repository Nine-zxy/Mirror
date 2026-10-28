// Authored fictional example. No participant dialogue or study records are used.
export function createDemoScenario(language = 'zh') {
  const text = (zh, en) => language === 'en' ? en : zh
  const lines = [
    ['A', '我以为我们说好七点一起做饭。', 'I thought we agreed to cook together at seven.', '我一直在等，也希望计划能被记住。', 'I have been waiting and wanted our plan to matter.', '我以为时间还可以商量，没有意识到对方在等。', 'I thought the time was flexible and did not realize they were waiting.'],
    ['B', '会议拖长了，我刚结束。', 'The meeting ran late. I just finished.', '我知道工作会有变化，但没有消息让我很失落。', 'I know work changes, but hearing nothing felt disappointing.', '我很累，想先说明发生了什么。', 'I am tired and want to explain what happened first.'],
    ['A', '你可以提前告诉我一声。', 'You could have sent me a message.', '我需要的不是道歉，而是不用一直猜。', 'I want not to be left guessing, more than an apology.', '这听起来像指责，我有点急于辩解。', 'That sounds like criticism, and I feel an urge to defend myself.'],
    ['B', '当时大家都在讲话，我没顾上。', 'Everyone was talking and I forgot to check my phone.', '我不确定对方是否理解我为什么在意。', 'I am unsure whether they understand why this matters to me.', '我是在解释，但也许听起来像借口。', 'I am explaining, but perhaps it sounds like an excuse.'],
    ['A', '那我以后都不要等了吗？', 'Should I just stop waiting next time?', '我说得有点重，因为我担心以后还是这样。', 'That came out strongly because I worry this will happen again.', '我不想让一次迟到变成对我们关系的判断。', 'I do not want one delay to become a judgment about our relationship.'],
    ['B', '我不是不想和你吃饭。', 'It is not that I do not want to eat with you.', '听到这句话，我稍微放松了一点。', 'Hearing that helps me relax a little.', '我想让对方知道，我仍然重视这个约定。', 'I want them to know our plan still matters to me.'],
    ['A', '下次如果赶不上，给我发一句就好。', 'Next time, just send a short message if you will be late.', '我想把需要说得具体一些。', 'I want to make my request more specific.', '这个要求比我刚才想象的更容易做到。', 'That request feels more manageable than I first thought.'],
    ['B', '好。我们现在一起准备吧。', 'Okay. Shall we get started now?', '我愿意继续一起做饭，也希望这次真的被听见。', 'I want to cook together and hope my concern was heard.', '我想用行动重新参与，而不只是结束争论。', 'I want to take part again, not just end the argument.'],
  ]
  const persona = (id, name, color, darkColor, hairStyle) => ({
    id, name, spriteType: id === 'A' ? 'female' : 'male', label: `PARTNER ${id}`, color, darkColor, glowColor: `${color}88`,
    thoughtBg: `${color}22`, thoughtBorder: color, hairColor: '#49342c',
    outfitColor: color, outfitDark: darkColor, hairStyle, outfitStyle: 'casual', accessory: 'none',
  })
  const spatial = {
    A: { x: 30, facing: 'right', pose: 'neutral', lean: 'none', scale: 1, visible: true },
    B: { x: 70, facing: 'left', pose: 'neutral', lean: 'none', scale: 1, visible: true },
  }
  const intensities = [0.25, 0.35, 0.55, 0.65, 0.8, 0.5, 0.3, 0.15]
  return {
    id: 'fictional_dinner_plan',
    title: text('晚餐的约定', 'The Dinner Plan'),
    subtitle: text('虚构演示 · 不含研究数据', 'Fictional demonstration · No study data'),
    scene: 'livingroom_evening',
    sceneElements: ['window', 'sofa', 'table', 'lamp', 'plant'],
    personas: {
      A: persona('A', text('小林', 'Alex'), '#7ab0e8', '#4a80c8', 'medium'),
      B: persona('B', text('小安', 'Sam'), '#e87a7a', '#b84a4a', 'short'),
    },
    beats: [
      { id: 0, duration: 3000, intensity: 0.1, narrator: text('晚上，客厅。', 'Evening, in the living room.'),
        spatial: structuredClone(spatial), proxemic: { state: 'neutral', divider: false },
        thoughts: { A: null, B: null }, dialogue: null },
      ...lines.map((line, index) => ({
        id: index + 1, duration: 4500, intensity: intensities[index], narrator: null,
        spatial: structuredClone(spatial), proxemic: { state: index < 5 ? 'tension' : 'neutral', divider: index < 5 },
        dialogue: { speaker: line[0], text: text(line[1], line[2]) },
        thoughts: {
          A: { text: text(line[3], line[4]), emotion: index < 5 ? 'anxious' : 'warm', bubbleType: 'cloud' },
          B: { text: text(line[5], line[6]), emotion: index < 5 ? 'defensive' : 'reflective', bubbleType: 'cloud' },
        },
      })),
    ],
  }
}
