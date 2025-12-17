export const locales = ['ja', 'zh', 'vi'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ja'

export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  zh: '中文',
  vi: 'Tiếng Việt',
}

export const localeFlags: Record<Locale, string> = {
  ja: '🇯🇵',
  zh: '🇨🇳',
  vi: '🇻🇳',
}
