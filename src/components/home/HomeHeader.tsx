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
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative">
          <Heart className="w-8 h-8 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
          <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
          {t('title')}
        </span>
        <span className="text-xl text-yellow-500 font-bold">囍</span>
      </Link>
      <div className="flex gap-3 items-center">
        <LanguageSwitcher />
        {status === 'loading' ? (
          <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-lg" />
        ) : session ? (
          // ログイン済み
          <>
            <Link
              href="/mypage"
              className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-pink-200 rounded-full hover:border-pink-400 hover:bg-pink-50 transition-all group"
            >
              {profile?.mainPhoto ? (
                <img
                  src={profile.mainPhoto}
                  alt={profile.nickname || ''}
                  className="w-8 h-8 rounded-full object-cover border-2 border-pink-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center border-2 border-pink-200">
                  <User className="w-4 h-4 text-pink-400" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 hidden sm:inline pr-1">
                {profile?.nickname || tNav('mypage')}
              </span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title={tCommon('logout')}
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">{tCommon('logout')}</span>
            </button>
          </>
        ) : (
          // 未ログイン
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-pink-500 hover:text-pink-600 font-medium"
            >
              {tCommon('login')}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium"
            >
              {tCommon('register')}
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
