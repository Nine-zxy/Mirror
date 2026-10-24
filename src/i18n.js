// Language is selected before a session; changing it reloads the application.
export const language = new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'zh'
export const t = (zh, en) => language === 'en' ? en : zh
document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN'
