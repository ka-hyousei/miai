'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Search, Heart, MessageCircle, User, LogOut } from 'lucide-react'
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

  const navItems = [
    { href: '/discover', icon: Search, labelKey: 'discover' as const },
    { href: '/likes', icon: Heart, labelKey: 'likes' as const },
    { href: '/messages', icon: MessageCircle, labelKey: 'messages' as const },
    { href: '/mypage', icon: User, labelKey: 'mypage' as const },
  ]

  if (!session) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-pink-500">
            お見合い
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">{tCommon('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 ${
                  isActive ? 'text-pink-500' : 'text-gray-500'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r">
        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-pink-50 text-pink-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{t(item.labelKey)}</span>
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
