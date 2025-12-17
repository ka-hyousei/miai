'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, LogOut } from 'lucide-react'

export function HomeHero() {
  const { data: session, status } = useSession()
  const t = useTranslations('home')
  const tCommon = useTranslations('common')

  if (status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="h-12 w-64 bg-red-100 animate-pulse rounded-lg mx-auto mb-6" />
        <div className="h-6 w-96 bg-red-100 animate-pulse rounded-lg mx-auto mb-8" />
        <div className="h-14 w-48 bg-red-100 animate-pulse rounded-full mx-auto" />
      </div>
    )
  }

  if (session) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        {/* 装饰性边框 */}
        <div className="inline-block mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-yellow-500">✿</span>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
              {t('welcomeBack')}
            </h2>
            <span className="text-2xl text-yellow-500">✿</span>
          </div>
        </div>
        <p className="text-xl text-gray-600 mb-10">
          {t('loggedInSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-medium rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl border-2 border-yellow-400/30"
          >
            <Search className="w-5 h-5" />
            {t('startDiscover')}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-600 text-lg font-medium rounded-full hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border-2 border-gray-200"
          >
            <LogOut className="w-5 h-5" />
            {tCommon('logout')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      {/* 传统装饰框 */}
      <div className="relative inline-block mb-8">
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

        <div className="px-8 py-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-3xl">🏮</span>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
              {t('subtitle')}
            </h2>
            <span className="text-3xl">🏮</span>
          </div>
        </div>
      </div>

      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        {t('description')}
      </p>

      {/* 装饰性分隔线 */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-red-300" />
        <span className="text-yellow-500 text-xl">❀</span>
        <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-red-300" />
      </div>

      <Link
        href="/register"
        className="inline-block px-10 py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white text-lg font-bold rounded-full hover:from-red-600 hover:via-red-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-yellow-400/30"
      >
        <span className="flex items-center gap-2">
          <span className="text-yellow-300">✨</span>
          {t('startButton')}
          <span className="text-yellow-300">✨</span>
        </span>
      </Link>

      {/* 底部装饰 */}
      <div className="mt-12 flex items-center justify-center gap-2 text-red-300 text-sm">
        <span>—</span>
        <span className="text-yellow-500">囍</span>
        <span>缘定今生</span>
        <span className="text-yellow-500">囍</span>
        <span>—</span>
      </div>
    </div>
  )
}
