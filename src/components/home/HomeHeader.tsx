'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Heart, Sparkles, User, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

interface UserProfile {
  nickname: string
  mainPhoto: string | null
}

export function HomeHeader() {
  const { data: session, status } = useSession()
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          const mainPhoto = data.photos?.find((p: any) => p.isMain)?.url || data.photos?.[0]?.url || null
          setProfile({
            nickname: data.profile.nickname,
            mainPhoto,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  return (
    <nav className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
        <div className="relative">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1" />
        </div>
        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
          {t('title')}
        </span>
        <span className="text-sm sm:text-xl text-yellow-500 font-bold">囍</span>
      </Link>
      <div className="flex gap-1.5 sm:gap-3 items-center">
        <LanguageSwitcher />
        {status === 'loading' ? (
          <div className="w-10 sm:w-20 h-8 sm:h-10 bg-gray-200 animate-pulse rounded-lg" />
        ) : session ? (
          // ログイン済み
          <>
            <Link
              href="/mypage"
              className="flex items-center gap-1 sm:gap-2 p-1 sm:px-3 sm:py-1.5 bg-white border-2 border-pink-200 rounded-full hover:border-pink-400 hover:bg-pink-50 transition-all group"
            >
              {profile?.mainPhoto ? (
                <img
                  src={profile.mainPhoto}
                  alt={profile.nickname || ''}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-pink-300"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center border-2 border-pink-200">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 hidden md:inline pr-1">
                {profile?.nickname || tNav('mypage')}
              </span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title={tCommon('logout')}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm font-medium">{tCommon('logout')}</span>
            </button>
          </>
        ) : (
          // 未ログイン
          <>
            <Link
              href="/login"
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-pink-500 hover:text-pink-600 font-medium"
            >
              {tCommon('login')}
            </Link>
            <Link
              href="/register"
              className="px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium"
            >
              {tCommon('register')}
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
