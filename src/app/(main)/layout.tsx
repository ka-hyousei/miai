'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Search, Heart, MessageCircle, User, LogOut, Home } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Home className="w-5 h-5 text-pink-400 group-hover:text-pink-500 transition-colors" />
            <span className="text-base font-medium text-gray-600 group-hover:text-pink-500 transition-colors">
              {t('backToHome')}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
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

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-100 md:hidden shadow-lg">
        <div className="flex justify-around py-2 safe-area-bottom">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-pink-500' : ''}`}>{getNavLabel(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:block fixed left-0 top-[57px] bottom-0 w-64 bg-white border-r border-pink-100">
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-500 shadow-sm border border-pink-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-pink-500' : ''}`} />
                <span className="font-medium">{getNavLabel(item.labelKey)}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-pink-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop content offset */}
      <div className="hidden md:block w-64" />
    </div>
  )
}
