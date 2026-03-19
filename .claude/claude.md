# ASIDE Project — Master TODO

> 目标：完成 UIST 2026 投稿，系统可用 + 论文完整
> 更新时间：2026-03-19

---

## 🔴 P0: 系统跑通（本周内）

### 1. Together 模式双设备同步 bug 修复
- [ ] 用户反馈：加入房间后没有同步
- [ ] 排查 WebSocket sync server（端口 3001）连接逻辑
- [ ] 房间码已改为 4 位（确认实现）
- [ ] 测试：两个浏览器标签页完整走通 Together 流程
- [ ] 测试：局域网两台设备走通（`http://局域网IP:5173`）
- 验收标准：两台设备从 intro → solo_viewing → self_confirm → together_viewing → divergence 全流程无报错

### 2. ConflictInput 页面字段重构
- [ ] 聊天记录：只需一方上传，上传后增加"你是对话中的哪一位？"
- [ ] Together 模式：上传方的记录通过 sync 共享给对方
- [ ] 关切字段改为：① "你最想让对方理解的是什么？" ② "你当时最强烈的感受是什么？"
- [ ] "前置情境（可选）" → 改为必填 "一句话背景"
- [ ] 同步提示语升级："对方此刻正在独立完成同样的描述…"
- [ ] 保留沟通风格投票（每人只选自己的）
- 参考：会议记录 3.18 讨论内容 + 防遗漏check文件

### 3. 时间轴改平
- [ ] ConflictTimeline 去掉坡度/gradient，改为平直
- [ ] 苏老师+Stephy 都确认不需要坡度
- 参考：会议记录 3.18

### 4. 角色位置调整
- [ ] 人物往画面下方移动，站在背景的地板上
- [ ] 确认 3x 放大后位置仍合理

---

## 🟡 P1: 论文核心内容（本周-下周）

### 5. Contribution 三层定稿
苏老师批评："罗列的都是手段上的东西"，要拔高。
Stephy 建议参考天健的三层结构。
用户不想做设计指导(design guidelines)，改为：

```
C1 (Conceptual): Dyadic Spectator Reflection (DSR)
  — 概念贡献：从参与者到共同旁观者的视角转换范式
  — operationalize perspective mistaking (Eyal 2018)
  — 反思引入双方贡献（苏老师原话）

C2 (Interaction/Technical): Cross-Perspective Editing Protocol
  — 交互贡献：独立编辑→自我确认→共同揭示→分歧呈现
  — AI as scaffolding, not ground truth

C3 (System + Empirical): ASIDE + exploratory study findings
```

- [ ] 更新 论文定位与贡献.md（已部分完成，需检查是否与上述一致）
- [ ] 更新 paper/01-Introduction.md 或创建 Introduction section
- [ ] 确保 paper/03-Design-Process-and-Principles.md 中 C1/C2/C3 映射清晰
- 参考：judge现在的问题.md 的评估 + 防遗漏check文件

### 6. RQ 重写为 UIST 语言
三个 RQ 都问**交互行为**，不是心理效果：

```
RQ1: 用户如何通过 editing 和 emotion-tagging
     协商 AI 对伴侣内心状态的推断？

RQ2: 当 cross-perspective divergence 变得可见时，
     用户产生了哪些交互行为和对话模式？

RQ3: 像素抽象化和戏剧化框架如何影响用户
     与冲突素材的 engagement 方式？
```

- [ ] 更新到 论文定位与贡献.md
- [ ] 更新到 paper section（Evaluation/Study Design）
- 参考：防遗漏check文件中的 RQ 讨论 + judge评估中"RQ2偏CHI"的风险

### 7. RSL v2 提升为独立贡献
judge评估指出 RSL 被低估了，需要：
- [ ] 在 paper/04 中将 RSL v2 单独提升为 subsection
- [ ] 加 schema 设计决策表（字段→理论依据→设计决策）
- [ ] proxemic→Hall(1966), intensity→Gottman(1992), bubbleType→Plutchik
- 参考：judge现在的问题.md

### 8. 关键设计决策论证补全
judge 指出设计决策论证严密性是最薄弱环节（6/10）：
- [ ] "assumption layer vs utterance layer" 写成 design principle
- [ ] 7 个 beats 的依据（Gottman conflict arc? pilot 验证?）
- [ ] Phase 2 不显示 AI 原始推断的论证（已有理论，需写入paper）
- [ ] 像素风而非其他抽象形式的依据（pilot 里收集用户反馈）
- 参考：judge现在的问题.md 决策表

### 9. Evaluation section 撰写
- [ ] 实验设计：Pre-post exploratory evaluation（不是对照实验）
- [ ] 量表体系：S1-S7 已定稿（见之前对话）
- [ ] 论文里写清楚 justify：为什么不做 counterbalance
- [ ] 引用 UIST 先例（Augmented Physics 2024 Best Paper: N=12, no control）
- [ ] 行为日志分析计划：每个 RQ 对应哪些数据源
- [ ] 前 2-3 对兼做 pilot 的合并策略写法
- 参考：Evaluation.md + user study.md

### 10. Introduction 中的核心区分
judge 说 best paper 让 reviewer 读完第一页就知道 novelty：
- [ ] 在 Introduction 明确区分 ASIDE vs Rehearsal/所有现有系统
- [ ] 加入："Our contribution is not the system itself, but the interaction paradigm of cross-perspective revelation..."
- [ ] 系统 general，实验 specific（romantic couples as probe scenario）
- 参考：防遗漏check文件中的 intro 思路

---

## 🟢 P2: 视觉与 UI 优化（Study 前完成）

### 11. 像素风 UI 统一
- [x] IntroScreen 剧场风格重设计（已完成）
- [ ] 生成 UI 素材指南（UI_ASSET_GUIDE.md），像 SPRITE_GUIDE 一样
- [ ] 对话框用像素矩形+尖角（说出来的话）
- [ ] 思维泡用圆形/云朵+小圆点（没说出来的想法）
- [ ] Phase 1 思维泡：⚙️图标表示"AI生成"，编辑后变✏️
- [ ] Phase 2 思维泡：虚线/发光边框，表示"对方理解的"
- [ ] 颜色体系：A蓝色系 / B红色系，对话框实色、思维泡半透明
- 参考：用户的三维编码系统设计（形状×颜色×字体质感）

### 12. Header 按钮像素化
- [x] 💭 → thought.png（已完成）
- [ ] 📜 剧本 → script.svg
- [ ] 🎭 设定 → setting.svg

### 13. Divergence 后引导问题
- [ ] 1-2 个宽泛的开放问题，不是 AI 生成的
- [ ] 苏老师："不能是AI干预"
- [ ] Stephy："只要问一两个宽泛的问题能达到你的目的就行"
- 例如："在这个过程中，有没有某个时刻让你对对方有了新的认识？"

---

## 🔵 P3: 论文写作（Study 期间/之后）

### 14. Paper sections 完成度
- [x] 03a-Formative-Study.md（已创建）
- [x] 03-Design-Process-and-Principles.md（已有，需微调）
- [x] 04-Design-and-Implementation.md（已有，需更新）
- [ ] 01-Introduction.md
- [ ] 02-Related-Work.md
- [ ] 05-Evaluation.md（方法+结果框架，数据后填）
- [ ] 06-Discussion.md（框架）
- [ ] 07-Limitations-and-Future-Work.md

### 15. 防遗漏 check 文件中的补充项
- [ ] Intro 思路："需要两个人参与 但现有研究都多是一个人使用"
- [ ] Counterfactual Branching 删除的解释（assumption layer vs utterance layer）
- [ ] "no-advice stance" 更强的防御
- [ ] Discussion: Generalizability Beyond Romantic Couples subsection
- [ ] Discussion: AI 发展速度——contribution 是 design knowledge 不是 demo
- 参考：防遗漏check文件 + judge评估

---

## 📅 时间线

```
3/19-3/23:  P0 全部完成（系统可用于 study）
3/24-3/28:  P1 #5-#10 论文核心内容
            开始招被试，前 2-3 对兼做 pilot
3/29-4/12:  正式 study（12 对）
            同步进行 P2 视觉优化 + P3 论文写作
4/13-4/20:  数据分析 + 完成论文
4/21-4/25:  内部审稿 + 修改 + 提交
```

---

## 重要原则（会议记录 + 老师反馈）

1. **Stephy**: "如果一直加就特别像在做产品设计" → 每个功能都需要研究理由
2. **苏老师**: "贡献要往上拔高，不能只是手段" → C1 要是概念层面的
3. **苏老师**: "反思引入双方贡献" → 这是交互创新的核心
4. **Stephy**: "baseline 做得够差你永远能发现好处" → 用 pre-post 不用对照
5. **苏老师**: "AI 不做干预" → post-viewing 只能是固定模板引导问题
6. **Stephy**: "target romantic 不会有问题" → 但要确认创新点不是因为领域细才新
7. **judge 评估**: 设计决策论证严密性是最弱环节 → 每个决策都要能回答"为什么不是别的"
