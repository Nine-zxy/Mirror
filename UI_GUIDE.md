# UI Asset Generation Guide — Pixel Art Style

> 本指南用于生成与角色精灵图风格统一的 UI 元素。
> 使用 Gemini 或其他图像生成工具，保持与 SPRITE_GUIDE.md 相同的视觉语言。

---

## 整体风格规范

- **风格**: 像素艺术 (Pixel Art)，与星露谷物语/Undertale 类似
- **调色板**: 深色系 UI（匹配深色背景），温暖的强调色
- **渲染**: `image-rendering: pixelated`，不抗锯齿
- **一致性**: 所有 UI 元素必须和角色精灵图看起来像同一个游戏的产物

---

## 一、三维编码系统

### 维度一：形状（区分"说出口" vs "没说出口"）

**对话框（Dialogue Box）**
- 像素矩形，底部有三角尖角指向说话者
- 对应"发出去的消息"
- 用户对这个符号已有认知（微信/漫画通用）

**思维泡（Thought Bubble）**
- 圆形/云朵边缘，用小圆点串联连接角色头部
- 经典漫画语言，全球通用
- 视觉暗示"飘在脑袋里的想法"

### 维度二：颜色（区分"谁的"）

```
角色A（小美/女方）:
  对话框 = 蓝色边框 (#7ab0e8)
  思维泡 = 蓝色半透明填充（更浅，暗示私密）

角色B（小凯/男方）:
  对话框 = 红色边框 (#e87a7a)
  思维泡 = 红色半透明填充（更浅）
```

颜色保持一致，对话框和思维泡用同一色系，只用透明度区分外显和内隐。

### 维度三：字体质感（区分"确定性"）

```
对话框内文字: 像素等宽字体，清晰实心
  → 暗示"这是事实，已经说出去了"

思维泡内文字: 像素手写字体，或者斜体
  → 暗示"这是推断，可能不准确"
  → 视觉上就在说"这是AI猜的"
```

### Phase 区分

```
Phase 1（Solo Viewing）:
  思维泡 = AI推断（用户可编辑）
  → 左上角小图标：⚙️像素版 表示"AI生成"
  → 用户编辑后变成 ✏️像素版 表示"已修改"
  → 边框：实线

Phase 2（Together Viewing）:
  思维泡 = 对方编辑的版本（对方眼中的你）
  → 边框：发光虚线框 或 双线框
  → 暗示"这不是AI猜的，这是对方理解的"
  → 这个视觉差异对应核心的 revelation moment
```

---

## 二、需要生成的 UI 素材清单

### 2.1 对话框和思维泡（最重要）

使用 **9-slice** 格式（角+边+中心分开），方便程序拉伸到任意尺寸。

| 素材 | 描述 | 建议原始尺寸 | 变体 |
|-----|------|------------|------|
| `dialogue_box_blue.png` | A的对话框，蓝色边框，像素矩形+底部三角 | 96×64 (9-slice) | — |
| `dialogue_box_red.png` | B的对话框，红色边框 | 96×64 | — |
| `thought_bubble_blue.png` | A的思维泡，蓝色云朵边缘+小圆点尾巴 | 96×64 (9-slice) | `_ai` / `_edited` / `_partner` |
| `thought_bubble_red.png` | B的思维泡，红色云朵边缘 | 96×64 | `_ai` / `_edited` / `_partner` |
| `thought_bubble_glow.png` | Phase 2 揭示版本，发光虚线边框 | 96×64 | 蓝/红两色 |

**9-slice 说明**：
```
┌────┬────────────┬────┐
│ TL │    TOP     │ TR │  ← 角和边是固定的
├────┼────────────┼────┤
│ L  │  CENTER    │ R  │  ← 中心和边可以拉伸
├────┼────────────┼────┤
│ BL │   BOTTOM   │ BR │
└────┴────────────┴────┘
```
如果不方便做 9-slice，生成一个完整的大尺寸框（如 384×256），我用 CSS border-image 处理。

### 2.2 按钮

| 素材 | 描述 | 建议尺寸 |
|-----|------|---------|
| `btn_normal.png` | 默认状态像素按钮 | 120×40 |
| `btn_hover.png` | 悬停状态（稍亮） | 120×40 |
| `btn_pressed.png` | 按下状态（稍暗/凹陷） | 120×40 |
| `btn_accent.png` | 强调按钮（绿色/金色，用于"开始"类） | 120×40 |

### 2.3 小图标（替代 emoji）

所有图标 **16×16 或 24×24**，透明背景 PNG。

| 文件名                 | 替代  | 描述              |
| ------------------- | --- | --------------- |
| `icon_thought.png`  | 💭  | 思维泡泡图标（气泡可见性切换） |
| `icon_script.png`   | 📜  | 剧本/卷轴图标         |
| `icon_settings.png` | 🎭  | 设定/齿轮图标         |
| `icon_play.png`     | ▶   | 播放三角            |
| `icon_pause.png`    | ⏸   | 暂停双竖线           |
| `icon_mark.png`     | 🏷  | 标记/旗帜图标         |
| `icon_ai.png`       | ⚙️  | AI生成标识（小齿轮或星星）  |
| `icon_edited.png`   | ✏️  | 已编辑标识（铅笔）       |
| `icon_partner.png`  | 👤  | 对方视角标识（人形轮廓）    |
| `icon_confirm.png`  | ✓   | 确认（绿色勾）         |
| `icon_edit.png`     | ✎   | 编辑（铅笔）          |

### 2.4 情绪标签图标

替代 EmotionBar 和 SelfConfirmScreen 中的 emoji 情绪标签。

| 文件名 | 情绪 | 描述 |
|-------|------|------|
| `emo_anxious.png` | 焦虑 | 旋涡/波浪线 |
| `emo_defensive.png` | 防备 | 盾牌 |
| `emo_angry.png` | 愤怒 | 火焰/闪电 |
| `emo_hurt.png` | 受伤 | 碎心/泪滴 |
| `emo_withdrawn.png` | 退缩 | 缩小的圆/龟壳 |
| `emo_warm.png` | 温暖 | 太阳/爱心 |
| `emo_reflective.png` | 反思 | 镜子/问号 |
| `emo_surprised.png` | 惊讶 | 感叹号/闪光 |
| `emo_neutral.png` | 平静 | 圆点/平线 |

尺寸：**16×16**，透明背景，与角色精灵图同一调色板。

---

## 三、Gemini 生成提示模板

### 对话框 Prompt

```
请生成一个像素艺术风格的对话框UI素材。

规格要求：
- 尺寸：384×256像素
- 风格：复古RPG/星露谷物语风格的像素对话框
- 边框颜色：[蓝色 #7ab0e8 / 红色 #e87a7a]
- 背景：深色半透明（rgba风格，暗示这是游戏UI叠层）
- 底部中央有一个小三角指向下方（表示说话者）
- 边框宽度约3-4像素
- 圆角约8像素
- 透明背景（PNG格式）
- image-rendering: pixelated 风格，不要抗锯齿
- 不要包含任何文字内容
```

### 思维泡 Prompt

```
请生成一个像素艺术风格的思维气泡UI素材。

规格要求：
- 尺寸：384×256像素
- 风格：复古RPG游戏中的思维/想法气泡
- 形状：云朵形边缘（不是矩形），底部有3个逐渐变小的圆点连接
- 边框颜色：[蓝色 #7ab0e8 / 红色 #e87a7a]
- 填充：半透明的[蓝色/红色]（约15%不透明度），暗示私密/内心想法
- 云朵边缘要有像素锯齿感，不要平滑
- 透明背景（PNG格式）
- 不要包含任何文字
```

### 按钮 Prompt

```
请生成一组像素艺术风格的UI按钮素材（一张图包含4个状态排列）。

规格要求：
- 每个按钮尺寸：120×40像素，4个水平排列
- 状态从左到右：默认 / 悬停（稍亮）/ 按下（稍暗凹陷）/ 强调（绿色/金色）
- 风格：复古RPG菜单按钮，像素边框
- 默认颜色：深灰色边框，深色填充
- 圆角约4像素
- 像素锯齿感，不抗锯齿
- 透明背景
- 不要包含文字
```

### 图标 Prompt

```
请生成一组16×16像素的像素艺术小图标（一张图排列成网格）。

图标列表（4×3网格，共12个）：
第1行：思维泡泡、卷轴/剧本、齿轮/设定、播放三角
第2行：暂停双线、旗帜/标记、AI星星、铅笔/编辑
第3行：人形轮廓、绿色勾、红色叉、放大镜

规格要求：
- 每个图标精确16×16像素，间距4像素
- 风格：与星露谷物语UI图标一致
- 主色调：白色/浅色轮廓，内部用对应的语义色
- 透明背景
- 像素精确，不抗锯齿
```

---

## 四、文件组织

```
public/
└── assets/
    └── ui/
        ├── dialogue/
        │   ├── dialogue_box_blue.png
        │   ├── dialogue_box_red.png
        │   ├── thought_bubble_blue.png
        │   ├── thought_bubble_blue_ai.png
        │   ├── thought_bubble_blue_edited.png
        │   ├── thought_bubble_blue_partner.png
        │   ├── thought_bubble_red.png
        │   ├── thought_bubble_red_ai.png
        │   ├── thought_bubble_red_edited.png
        │   └── thought_bubble_red_partner.png
        ├── buttons/
        │   ├── btn_normal.png
        │   ├── btn_hover.png
        │   ├── btn_pressed.png
        │   └── btn_accent.png
        ├── icons/
        │   ├── icon_thought.png
        │   ├── icon_script.png
        │   ├── icon_settings.png
        │   ├── icon_play.png
        │   ├── icon_pause.png
        │   ├── icon_mark.png
        │   ├── icon_ai.png
        │   ├── icon_edited.png
        │   ├── icon_partner.png
        │   ├── icon_confirm.png
        │   └── icon_edit.png
        └── emotions/
            ├── emo_anxious.png
            ├── emo_defensive.png
            ├── emo_angry.png
            ├── emo_hurt.png
            ├── emo_withdrawn.png
            ├── emo_warm.png
            ├── emo_reflective.png
            ├── emo_surprised.png
            └── emo_neutral.png
```

---

## 五、实施说明

### CSS border-image 实现可拉伸对话框

```css
.dialogue-box {
  border: 12px solid transparent;
  border-image: url('/assets/ui/dialogue/dialogue_box_blue.png') 12 fill / 12px / 0 stretch;
  image-rendering: pixelated;
}
```

### 替代方案：CSS 纯像素风

如果生成素材不理想，也可以用 CSS `box-shadow` 模拟像素边框：
```css
.pixel-box {
  box-shadow:
    inset 0 0 0 3px #7ab0e8,
    inset 0 0 0 6px rgba(122,176,232,0.15);
  border-radius: 0; /* 保持像素感 */
}
```

---

*参见: [[SPRITE_GUIDE.md]] — 角色精灵图生成指南*
