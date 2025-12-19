'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Search, Heart, MessageCircle, User, LogOut, Home, Sparkles, Navigation } from 'lucide-react'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const [userGender, setUserGender] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile?.gender) {
          setUserGender(data.profile.gender)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Get discover label based on user gender
  // Female users see "寻找他" (find him), Male users see "寻找她" (find her)
  const getDiscoverLabel = () => {
    if (userGender === 'FEMALE') {
      return t('discoverHim')
    } else if (userGender === 'MALE') {
      return t('discoverHer')
    }
    return t('discover')
  }

  const navItems = [
    { href: '/discover', icon: Search, labelKey: 'discover' as const },
    { href: '/nearby', icon: Navigation, labelKey: 'nearby' as const },
    { href: '/likes', icon: Heart, labelKey: 'likes' as const },
    { href: '/messages', icon: MessageCircle, labelKey: 'messages' as const },
    { href: '/mypage', icon: User, labelKey: 'mypage' as const },
  ]

  // Get label for nav item (special handling for discover)
  const getNavLabel = (labelKey: string) => {
    if (labelKey === 'discover') {
      return getDiscoverLabel()
    }
    return t(labelKey as any)
  }

  if (!session) {
    return children
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-yellow-50">
      {/* Header - 中国风 */}
      <header className="bg-gradient-to-r from-red-50 to-orange-50 backdrop-blur-md border-b-2 border-red-200 sticky top-0 z-50 shadow-sm">
        {/* 装饰性顶边 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50" />

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Home className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-base font-medium text-red-600 group-hover:text-red-700 transition-colors">
              {t('backToHome')}
            </span>
            <span className="text-yellow-600 text-sm">囍</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">{tCommon('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) - 中国风 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-50 to-orange-50 backdrop-blur-md border-t-2 border-red-200 md:hidden shadow-lg">
        {/* 装饰性顶边 */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

        <div className="flex justify-around py-2 safe-area-bottom">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-red-600 bg-red-100/50'
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-red-600' : ''}`}>{getNavLabel(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Side Navigation (Desktop) - 中国风 */}
      <nav className="hidden md:block fixed left-0 top-[57px] bottom-0 w-64 bg-gradient-to-b from-red-50 to-orange-50 border-r-2 border-red-200">
        {/* 装饰性边框 */}
        <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-red-300 to-yellow-400 opacity-30" />

        <div className="p-4 space-y-1">
          {/* 装饰性标题 */}
          <div className="flex items-center justify-center gap-2 pb-4 mb-4 border-b border-red-200">
            <span className="text-yellow-600">◈</span>
            <span className="text-red-500 text-sm font-medium">メニュー</span>
            <span className="text-yellow-600">◈</span>
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-600 shadow-sm border border-red-200'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-red-500' : ''}`} />
                <span className="font-medium">{getNavLabel(item.labelKey)}</span>
                {isActive && (
                  <div className="ml-auto text-yellow-600 text-sm">囍</div>
                )}
              </Link>
            )
          })}
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-red-300 text-xs">
          <span>— 囍 缘定今生 囍 —</span>
        </div>
      </nav>

      {/* Desktop content offset */}
      <div className="hidden md:block w-64" />
    </div>
  )
}
