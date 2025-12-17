'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { User, Settings, Heart, MessageCircle, LogOut, Camera, Briefcase, Globe, Crown } from 'lucide-react'
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
  const tLikes = useTranslations('likes')
  const tMessages = useTranslations('messages')

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  const mainPhoto = photos.find(p => p.isMain) || photos[0]

  return (
    <div className="md:ml-64">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-24" />
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                {mainPhoto ? (
                  <img
                    src={mainPhoto.url}
                    alt={profile?.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="ml-4 mb-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile?.nickname || tMessages('user')}
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
                    <Briefcase className="w-4 h-4" />
                    <span>{profile.occupation}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{profile.nationality}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-gray-700 mt-4">{profile.bio}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">{t('pleaseSetupProfile')}</p>
                <Link href="/profile/setup">
                  <Button>{t('setupProfile')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Link href="/profile/edit" className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <User className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('editProfile')}</p>
              <p className="text-sm text-gray-500">{t('editProfileDesc')}</p>
            </div>
          </Link>

          <Link href="/photos" className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('photoManagement')}</p>
              <p className="text-sm text-gray-500">{t('photoManagementDesc')}</p>
            </div>
          </Link>

          <Link href="/likes" className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{tLikes('title')}</p>
              <p className="text-sm text-gray-500">{t('likesDesc')}</p>
            </div>
          </Link>

          <Link href="/messages" className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{tMessages('title')}</p>
              <p className="text-sm text-gray-500">{t('messagesDesc')}</p>
            </div>
          </Link>

          <Link href="/premium" className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('premium')}</p>
              <p className="text-sm text-gray-500">{t('premiumDesc')}</p>
            </div>
          </Link>

          <Link href="/settings" className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{t('settings')}</p>
              <p className="text-sm text-gray-500">{t('settingsDesc')}</p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
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
