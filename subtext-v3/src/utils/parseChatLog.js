// parseChatLog — Multi-format WeChat / chat log parser (copied from Mirror v1)
// Returns: { text: string, format: string, messageCount: number }

function detectFormat(raw) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('<') || /<html/i.test(trimmed)) {
    if (
      trimmed.includes('message_content') || trimmed.includes('msg-item') ||
      trimmed.includes('chat-record') || /class="[^"]*nick/i.test(trimmed) ||
      /class="[^"]*sender/i.test(trimmed)
    ) return 'wechat-html-native'
    if (trimmed.includes('<body')) return 'wechat-html-tool'
  }
  if (/^\[.+?\]\s*\[\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}/.test(trimmed)) return 'wechat-txt'
  if (/^.+\s+\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}:\d{2}/m.test(trimmed)) return 'wechat-copy'
  if (/^.+\s+\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}\b/m.test(trimmed)) return 'wechat-copy'
  const colonLines = trimmed.split('\n').filter(l => /^[^:：]{1,20}[:：]/.test(l.trim()))
  if (colonLines.length >= 2) return 'simple-colon'
  return 'freetext'
}

function parseHTML(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const msgs = []
  const SENDER_SELECTORS = ['.message_nickname','.nickname','.msg-nickname','.chat-record-item__name','.msg_sender','.sender','[class*="nick"]','[class*="sender"]','[class*="name"]']
  const CONTENT_SELECTORS = ['.message_content','.content','.msg-content','.chat-record-item__content','.msg_content','.bubble','[class*="content"]','[class*="bubble"]','[class*="text"]']
  const findText = (root, selectors) => { for (const sel of selectors) { try { const el = root.querySelector(sel); if (el) return el.textContent.trim() } catch {} } return null }
  const CONTAINER_SELECTORS = ['.message','.msg','.msg-item','.chat-item','.message-item','.chat-record-item','[class*="message-wrap"]']
  let containers = []
  for (const sel of CONTAINER_SELECTORS) { containers = Array.from(doc.querySelectorAll(sel)); if (containers.length > 0) break }
  for (const el of containers) {
    const sender = findText(el, SENDER_SELECTORS)
    const content = findText(el, CONTENT_SELECTORS)
    if (sender && content && content.length > 0) msgs.push({ sender, text: content })
  }
  if (msgs.length === 0) {
    const allDivs = Array.from(doc.querySelectorAll('div, p'))
    for (let i = 0; i < allDivs.length - 1; i++) {
      const el = allDivs[i]; const text = el.textContent.trim()
      if (text.length > 0 && text.length <= 20 && !text.includes('\n')) {
        const next = allDivs[i+1]?.textContent?.trim()
        if (next && next.length > 0 && next.length > text.length) { msgs.push({ sender: text, text: next }); i++ }
      }
    }
  }
  if (msgs.length === 0) return { text: doc.body?.textContent?.trim() ?? html, messageCount: 0 }
  return { text: messagesToText(msgs), messageCount: msgs.length }
}

function parseWeChatTxt(raw) {
  const lines = raw.split('\n'); const msgs = []; let current = null
  for (const line of lines) {
    const m = line.match(/^\[(.+?)\]\s*\[.+?\]/)
    if (m) { if (current?.text.trim()) msgs.push(current); current = { sender: m[1].trim(), text: '' } }
    else if (current) { const t = line.trim(); if (t) current.text += (current.text ? '\n' : '') + t }
  }
  if (current?.text.trim()) msgs.push(current)
  return { text: messagesToText(msgs), messageCount: msgs.length }
}

function parseWeChatCopy(raw) {
  const lines = raw.split('\n'); const msgs = []; let current = null
  const HEADER = /^(.{1,20})\s+\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}/
  for (const line of lines) {
    const m = line.trim().match(HEADER)
    if (m) { if (current?.text.trim()) msgs.push(current); current = { sender: m[1].trim(), text: '' } }
    else if (current) { const t = line.trim(); if (t) current.text += (current.text ? '\n' : '') + t }
  }
  if (current?.text.trim()) msgs.push(current)
  return { text: messagesToText(msgs), messageCount: msgs.length }
}

function parseSimpleColon(raw) {
  const msgs = raw.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => { const m = l.match(/^(.{1,20})\s*[:：]\s*(.+)$/); return m ? { sender: m[1].trim(), text: m[2].trim() } : null })
    .filter(Boolean)
  return { text: messagesToText(msgs), messageCount: msgs.length }
}

function messagesToText(msgs) {
  return msgs
    .filter(m => m.text && !m.text.match(/^\[(图片|语音|视频|文件|位置|表情|链接)\]$/) && m.text.trim().length > 1)
    .map(m => `${m.sender}：${m.text}`)
    .join('\n\n')
}

export function parseChatLog(raw) {
  if (!raw?.trim()) return { text: '', format: 'empty', messageCount: 0 }
  const format = detectFormat(raw)
  switch (format) {
    case 'wechat-html-native':
    case 'wechat-html-tool': return { ...parseHTML(raw), format }
    case 'wechat-txt':       return { ...parseWeChatTxt(raw), format }
    case 'wechat-copy':      return { ...parseWeChatCopy(raw), format }
    case 'simple-colon':     return { ...parseSimpleColon(raw), format }
    default:                 return { text: raw.trim(), format: 'freetext', messageCount: 0 }
  }
}

export const FORMAT_LABELS = {
  'wechat-html-native': '微信 HTML 记录',
  'wechat-html-tool':   '第三方工具 HTML',
  'wechat-txt':         '微信 TXT 导出',
  'wechat-copy':        '微信复制记录',
  'simple-colon':       '姓名: 内容 格式',
  'freetext':           '自由描述',
  'empty':              '空',
}
