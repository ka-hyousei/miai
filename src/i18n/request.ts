import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, locales, type Locale } from './config'

// 浏览器语言代码到我们支持的语言的映射
const languageMapping: Record<string, Locale> = {
  'ja': 'ja',
  'ja-JP': 'ja',
  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
  'vi': 'vi',
  'vi-VN': 'vi',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'ko': 'ko',
  'ko-KR': 'ko',
}

// 从Accept-Language头解析浏览器首选语言
function getPreferredLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null

  // Accept-Language格式: "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=')
      return {
        code: code.trim(),
        quality: q ? parseFloat(q) : 1.0
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // 找到第一个匹配的语言
  for (const { code } of languages) {
    // 先尝试完整匹配 (如 zh-CN)
    if (languageMapping[code]) {
      return languageMapping[code]
    }
    // 再尝试主语言匹配 (如 zh)
    const primaryLang = code.split('-')[0]
    if (languageMapping[primaryLang]) {
      return languageMapping[primaryLang]
    }
  }

  return null
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const localeCookie = cookieStore.get('locale')?.value

  let locale: Locale = defaultLocale

  // 1. 优先使用用户手动设置的语言（cookie）
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale
  } else {
    // 2. 如果没有cookie，根据浏览器语言自动选择
    const acceptLanguage = headerStore.get('accept-language')
    const detectedLocale = getPreferredLocale(acceptLanguage)
    if (detectedLocale) {
      locale = detectedLocale
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
