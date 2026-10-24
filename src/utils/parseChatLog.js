// ─────────────────────────────────────────────────────────────
//  parseChatLog — Multi-format WeChat / chat log parser
//
//  Supported input formats (auto-detected):
//
//  1. wechat-html-native
//     WeChat PC  "合并转发" → 发送给文件传输助手 → 下载 的HTML
//     WeChat Mac "导出聊天记录" 生成的HTML
//
//  2. wechat-html-tool
//     第三方工具 (WechatExporter / Memotrace / WeChatMsg) 导出HTML
//
//  3. wechat-txt
//     微信PC  "转发到邮件" / 设置 → 通用 → 导出聊天记录 → .txt
//     格式:  [名字] [2024-01-15 14:30]↵内容
//
//  4. wechat-copy
//     手机端 长按→更多→多选→复制 或 PC端框选复制
//     格式:  名字 时间↵内容  （无括号）
//
//  5. simple-colon
//     名字: 内容  或  名字：内容  逐行格式
//
//  6. freetext
//     自由描述 / 无结构文本 → 直接原样传给 generateScenario
//
//  Returns: { text: string, format: string, messageCount: number }
// ─────────────────────────────────────────────────────────────

// ── Format detection ──────────────────────────────────────────
function detectFormat(raw) {
  const trimmed = raw.trim()

  // HTML?
  if (trimmed.startsWith('<') || /<html/i.test(trimmed)) {
    // Does it look like WeChat native merged-forward HTML?
    if (
      trimmed.includes('message_content') ||
      trimmed.includes('msg-item') ||
      trimmed.includes('chat-record') ||
      /class="[^"]*nick/i.test(trimmed) ||
      /class="[^"]*sender/i.test(trimmed)
    ) return 'wechat-html-native'

    // Other tool-generated HTML
    if (trimmed.includes('<body')) return 'wechat-html-tool'
  }

  // WeChat TXT export: [Name] [YYYY-MM-DD HH:mm] or [Name] [YYYY/MM/DD HH:mm]
  if (/^\[.+?\]\s*\[\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}/.test(trimmed)) {
    return 'wechat-txt'
  }

  // WeChat copy-paste: Name YYYY/M/D HH:mm:ss\nContent
  if (/^.+\s+\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}:\d{2}/m.test(trimmed)) {
    return 'wechat-copy'
  }
  // Same without seconds
  if (/^.+\s+\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}\b/m.test(trimmed)) {
    return 'wechat-copy'
  }

  // "Name: content" or "Name：content" (at least 3 lines)
  const colonLines = trimmed.split('\n').filter(l => /^[^:：]{1,20}[:：]/.test(l.trim()))
  if (colonLines.length >= 2) return 'simple-colon'

  return 'freetext'
}

// ── HTML parsers ──────────────────────────────────────────────

function parseHTML(html) {
  // Use DOMParser in browser context
  const parser = new DOMParser()
  const doc    = parser.parseFromString(html, 'text/html')
  const msgs   = []

  // Strategy 1 — WeChat native merged-forward HTML
  //  Tries multiple possible class patterns across WeChat versions
  const SENDER_SELECTORS = [
    '.message_nickname', '.nickname', '.msg-nickname',
    '.chat-record-item__name', '.msg_sender', '.sender',
    '[class*="nick"]', '[class*="sender"]', '[class*="name"]',
  ]
  const CONTENT_SELECTORS = [
    '.message_content', '.content', '.msg-content',
    '.chat-record-item__content', '.msg_content', '.bubble',
    '[class*="content"]', '[class*="bubble"]', '[class*="text"]',
  ]

  const findText = (root, selectors) => {
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel)
        if (el) return el.textContent.trim()
      } catch { /* ignore bad selector */ }
    }
    return null
  }

  // Try containers first
  const CONTAINER_SELECTORS = [
    '.message', '.msg', '.msg-item', '.chat-item',
    '.message-item', '.chat-record-item', '[class*="message-wrap"]',
  ]
  let containers = []
  for (const sel of CONTAINER_SELECTORS) {
    containers = Array.from(doc.querySelectorAll(sel))
    if (containers.length > 0) break
  }

  for (const el of containers) {
    const sender  = findText(el, SENDER_SELECTORS)
    const content = findText(el, CONTENT_SELECTORS)
    if (sender && content && content.length > 0) {
      msgs.push({ sender, text: content })
    }
  }

  // Strategy 2 — Generic row-by-row scan
  //  Look for any repeated pattern of [name element, content element]
  if (msgs.length === 0) {
    const allDivs = Array.from(doc.querySelectorAll('div, p'))
    for (let i = 0; i < allDivs.length - 1; i++) {
      const el = allDivs[i]
      const text = el.textContent.trim()
      // Heuristic: short text (≤20 chars) next to longer text = name + message
      if (text.length > 0 && text.length <= 20 && !text.includes('\n')) {
        const next = allDivs[i + 1]?.textContent?.trim()
        if (next && next.length > 0 && next.length > text.length) {
          msgs.push({ sender: text, text: next })
          i++ // skip content el
        }
      }
    }
  }

  // Strategy 3 — Just extract all visible text as fallback
  if (msgs.length === 0) {
    return { text: doc.body?.textContent?.trim() ?? html, messageCount: 0 }
  }

  return { text: messagesToText(msgs), messageCount: msgs.length }
}

// ── WeChat TXT export parser ─────────────────────────────────
//  Format:  [Name] [2024-01-15 14:30]
//           Message content line 1
//           Message content line 2
function parseWeChatTxt(raw) {
  const lines = raw.split('\n')
  const msgs  = []
  let current = null

  for (const line of lines) {
    // Header line: [Name] [date time]
    const m = line.match(/^\[(.+?)\]\s*\[.+?\]/)
    if (m) {
      if (current && current.text.trim()) msgs.push(current)
      current = { sender: m[1].trim(), text: '' }
    } else if (current) {
      const t = line.trim()
      if (t) current.text += (current.text ? '\n' : '') + t
    }
  }
  if (current?.text.trim()) msgs.push(current)

  return { text: messagesToText(msgs), messageCount: msgs.length }
}

// ── WeChat copy-paste parser ──────────────────────────────────
//  Format (PC/mobile copy):
//    Name 2024/1/15 14:32:01
//    Message content
function parseWeChatCopy(raw) {
  const lines   = raw.split('\n')
  const msgs    = []
  let current   = null
  // Matches: "Name<spaces>date time" or "Name<tab>date"
  const HEADER  = /^(.{1,20})\s+\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}/

  for (const line of lines) {
    const m = line.trim().match(HEADER)
    if (m) {
      if (current?.text.trim()) msgs.push(current)
      current = { sender: m[1].trim(), text: '' }
    } else if (current) {
      const t = line.trim()
      if (t) current.text += (current.text ? '\n' : '') + t
    }
  }
  if (current?.text.trim()) msgs.push(current)

  return { text: messagesToText(msgs), messageCount: msgs.length }
}

// ── Simple colon format ───────────────────────────────────────
//  Name: content  or  Name：content
function parseSimpleColon(raw) {
  const msgs = raw.split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const m = l.match(/^(.{1,20})\s*[:：]\s*(.+)$/)
      return m ? { sender: m[1].trim(), text: m[2].trim() } : null
    })
    .filter(Boolean)

  return { text: messagesToText(msgs), messageCount: msgs.length }
}

// ── Convert parsed messages to readable text for LLM / display ─
function messagesToText(msgs) {
  return msgs
    .filter(m => {
      // Filter out common WeChat system messages and media placeholders
      const t = m.text
      return (
        t &&
        !t.match(/^\[(图片|语音|视频|文件|位置|表情|链接)\]$/) &&
        !t.match(/^[\s\r\n]*$/) &&
        t.length > 1
      )
    })
    .map(m => `${m.sender}：${m.text}`)
    .join('\n\n')
}

// ── Public API ────────────────────────────────────────────────
export function parseChatLog(raw) {
  if (!raw || !raw.trim()) {
    return { text: '', format: 'empty', messageCount: 0 }
  }

  const format = detectFormat(raw)

  switch (format) {
    case 'wechat-html-native':
    case 'wechat-html-tool': {
      const result = parseHTML(raw)
      return { ...result, format }
    }
    case 'wechat-txt':
      return { ...parseWeChatTxt(raw), format }

    case 'wechat-copy':
      return { ...parseWeChatCopy(raw), format }

    case 'simple-colon':
      return { ...parseSimpleColon(raw), format }

    default:
      return { text: raw.trim(), format: 'freetext', messageCount: 0 }
  }
}

// Human-readable format labels (for UI)
export const FORMAT_LABELS = {
  'wechat-html-native': '微信 HTML 记录',
  'wechat-html-tool':   '第三方工具 HTML',
  'wechat-txt':         '微信 TXT 导出',
  'wechat-copy':        '微信复制记录',
  'simple-colon':       '姓名: 内容 格式',
  'freetext':           '自由描述',
  'empty':              '空',
}
