'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { User, Settings, LogOut, Camera, Briefcase, Globe, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  nickname: string
  gender: string
  birthDate: string
  prefecture: string
  city: string | null
  bio: string | null
  height: number | null
  occupation: string | null
  visaType: string | null
  yearsInJapan: number | null
  japaneseLevel: string | null
  futurePlan: string | null
  nationality: string | null
  hometown: string | null
  isVerified: boolean
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('mypage')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [photos, setPhotos] = useState<{ url: string; isMain: boolean }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          setPhotos(data.photos || [])
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  const mainPhoto = photos.find(p => p.isMain) || photos[0]

  return (
    <div className="md:ml-64">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Profile Header - 中国风 */}
        <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm mb-6 border-2 border-red-200 relative">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg z-10" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg z-10" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg z-10" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg z-10" />

          <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 h-24 relative rounded-t-lg">
            {/* 装饰性图案 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-6xl text-yellow-300">囍</span>
            </div>
          </div>
          <div className="px-6 pb-6">
            {/* 写真とニックネーム */}
            <div className="flex items-start gap-4 mb-4">
              {/* 写真 - 上に突き出す */}
              <div className="-mt-12 relative z-20 shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-lg overflow-hidden">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto.url}
                      alt={profile?.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-red-100 to-orange-100">
                      <User className="w-12 h-12 text-red-300" />
                    </div>
                  )}
                </div>
              </div>
              {/* ニックネーム - 通常位置 */}
              <div className="pt-2">
                <h1 className="text-xl font-bold text-red-700 flex items-center gap-2">
                  {profile?.nickname || t('user')}
                  <span className="text-yellow-500 text-sm">✿</span>
                </h1>
                {profile && (
                  <p className="text-gray-600">
                    {calculateAge(profile.birthDate)}{t('yearsOld')} • {profile.prefecture}
                  </p>
                )}
              </div>
            </div>

            {profile ? (
              <div className="space-y-3">
                {profile.occupation && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 text-red-400" />
                    <span>{profile.occupation}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-red-400" />
                    <span>{profile.nationality}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-gray-700 mt-4 p-3 bg-red-50/50 rounded-lg border border-red-100">{profile.bio}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">{t('pleaseSetupProfile')}</p>
                <Link href="/profile/setup">
                  <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">{t('setupProfile')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items - 中国风 */}
        <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm overflow-hidden border-2 border-red-200 relative">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg z-10" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg z-10" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg z-10" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg z-10" />

          <Link href="/profile/edit" className="flex items-center gap-4 p-4 hover:bg-red-50/50 border-b border-red-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center border border-red-200">
              <User className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('editProfile')}</p>
              <p className="text-sm text-gray-500">{t('editProfileDesc')}</p>
            </div>
          </Link>

          <Link href="/photos" className="flex items-center gap-4 p-4 hover:bg-red-50/50 border-b border-red-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-purple-200">
              <Camera className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('photoManagement')}</p>
              <p className="text-sm text-gray-500">{t('photoManagementDesc')}</p>
            </div>
          </Link>

          <Link href="/premium" className="flex items-center gap-4 p-4 hover:bg-red-50/50 border-b border-red-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center border border-yellow-200">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('premium')}</p>
              <p className="text-sm text-gray-500">{t('premiumDesc')}</p>
            </div>
          </Link>

          <Link href="/settings" className="flex items-center gap-4 p-4 hover:bg-red-50/50 border-b border-red-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('settings')}</p>
              <p className="text-sm text-gray-500">{t('settingsDesc')}</p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-4 hover:bg-red-50/50 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
              <LogOut className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('logout')}</p>
              <p className="text-sm text-gray-500">{t('logoutDesc')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
