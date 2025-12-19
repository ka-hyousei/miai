'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Heart, MapPin, Briefcase, Globe, Navigation, RefreshCw, Settings, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface UserProfile {
  id: string
  userId: string
  nickname: string
  gender: string
  birthDate: string
  prefecture: string
  bio: string | null
  occupation: string | null
  nationality: string | null
  hometown: string | null
  distance: number
  distanceText: string
  user: {
    photos: { url: string; isMain: boolean }[]
  }
}

const DISTANCE_OPTIONS = [
  { value: '0.1', label: '100m' },
  { value: '1', label: '1km' },
  { value: '5', label: '5km' },
  { value: '10', label: '10km' },
  { value: '20', label: '20km' },
  { value: '50', label: '50km' },
]

const NEARBY_GENDER_OPTIONS = [
  { value: '', label: '全員' },
  { value: 'MALE', label: '男性' },
  { value: 'FEMALE', label: '女性' },
]

export default function NearbyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('nearby')
  const tProfile = useTranslations('profile')
  const tDiscover = useTranslations('discover')

  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsEnable, setNeedsEnable] = useState(false)
  const [needsLocation, setNeedsLocation] = useState(false)
  const [defaultGender, setDefaultGender] = useState<string>('')
  const [filters, setFilters] = useState({
    gender: '',
    distance: '5',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setNeedsEnable(false)
    setNeedsLocation(false)

    try {
      const params = new URLSearchParams()
      if (filters.gender) params.append('gender', filters.gender)
      if (filters.distance) params.append('distance', filters.distance)

      const response = await fetch(`/api/nearby?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '附近の人の取得に失敗しました')
        return
      }

      // 機能が有効になっていない場合
      if (data.needsEnable) {
        setNeedsEnable(true)
        return
      }

      // 位置情報が設定されていない場合
      if (data.needsLocation) {
        setNeedsLocation(true)
        return
      }

      setProfiles(data.profiles || [])
      if (data.likedUserIds) {
        setLikedUserIds(new Set(data.likedUserIds))
      }
      if (data.defaultGender && !filters.gender) {
        setDefaultGender(data.defaultGender)
        setFilters(prev => ({ ...prev, gender: data.defaultGender }))
      }
    } catch (err) {
      console.error('Failed to fetch nearby profiles:', err)
      setError('附近の人の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [filters.gender, filters.distance])

  useEffect(() => {
    if (session) {
      fetchProfiles()
    }
  }, [session, fetchProfiles])

  const updateLocation = async () => {
    setIsUpdatingLocation(true)
    setError(null)

    try {
      // ブラウザが位置情報APIをサポートしているか確認
      if (!navigator.geolocation) {
        setError('お使いのブラウザは位置情報をサポートしていません。')
        setIsUpdatingLocation(false)
        return
      }

      // 获取浏览器位置
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // 发送到服务器
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      })

      if (!response.ok) {
        throw new Error('位置情報の更新に失敗しました')
      }

      // 重新获取附近的人
      await fetchProfiles()
    } catch (err: unknown) {
      // GeolocationPositionError の判定
      const geoError = err as { code?: number; PERMISSION_DENIED?: number; POSITION_UNAVAILABLE?: number; TIMEOUT?: number }
      if (geoError.code !== undefined) {
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            setError('位置情報の使用が拒否されました。ブラウザの設定で位置情報を許可してください。')
            break
          case 2: // POSITION_UNAVAILABLE
            setError('位置情報が取得できませんでした。')
            break
          case 3: // TIMEOUT
            setError('位置情報の取得がタイムアウトしました。')
            break
          default:
            setError('位置情報の取得に失敗しました。')
        }
      } else {
        setError('位置情報の更新に失敗しました')
      }
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  const enableNearby = async () => {
    try {
      const response = await fetch('/api/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showNearby: true }),
      })

      if (!response.ok) {
        throw new Error('設定の更新に失敗しました')
      }

      // 更新位置并获取附近的人
      await updateLocation()
    } catch (err) {
      setError('機能の有効化に失敗しました')
    }
  }

  const handleLike = async (userId: string) => {
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId }),
      })
      setLikedUserIds(prev => new Set(prev).add(userId))
    } catch (error) {
      console.error('Failed to like:', error)
    }
  }

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

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  // 需要开启功能
  if (needsEnable) {
    return (
      <div className="md:ml-64">
        <div className="p-4">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <Navigation className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('enableTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('enableDescription')}</p>
            <Button
              onClick={enableNearby}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {t('enableButton')}
            </Button>
            <p className="text-sm text-gray-500 mt-4">{t('privacyNote')}</p>
          </div>
        </div>
      </div>
    )
  }

  // 需要更新位置
  if (needsLocation) {
    return (
      <div className="md:ml-64">
        <div className="p-4">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('locationTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('locationDescription')}</p>
            <Button
              onClick={updateLocation}
              disabled={isUpdatingLocation}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {isUpdatingLocation ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('updating')}
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('updateLocation')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="md:ml-64">
      <div className="p-4">
        {/* 标题和控制区域 */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-6 shadow-sm border-2 border-red-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">◈</span>
              <h2 className="font-semibold text-red-700">{t('title')}</h2>
              <span className="text-yellow-600">◈</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={updateLocation}
                disabled={isUpdatingLocation}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                {isUpdatingLocation ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Link href="/settings">
                <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-100 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="gender"
              options={NEARBY_GENDER_OPTIONS}
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              placeholder={tProfile('gender')}
            />
            <Select
              id="distance"
              options={DISTANCE_OPTIONS}
              value={filters.distance}
              onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
              placeholder={t('distance')}
            />
          </div>
        </div>

        {/* 加载中 */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-red-300 text-4xl mb-4">🏮</div>
            <p className="text-gray-500">{t('noNearby')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('tryExpand')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-red-100 hover:border-red-300 group"
              >
                <Link href={`/profile/${profile.id}`}>
                  <div className="aspect-[3/4] bg-gray-200 relative">
                    {profile.user.photos[0] ? (
                      <img
                        src={profile.user.photos[0].url}
                        alt={profile.nickname}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Photo
                      </div>
                    )}
                    {/* 距离标签 */}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {profile.distanceText}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        {profile.nickname}, {calculateAge(profile.birthDate)}
                        <span className="text-yellow-400 text-sm">✿</span>
                      </h3>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin className="w-3 h-3" />
                        {profile.prefecture}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="p-3">
                  {profile.occupation && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <Briefcase className="w-3 h-3 text-red-400" />
                      {profile.occupation}
                    </div>
                  )}
                  {profile.hometown && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <Globe className="w-3 h-3 text-red-400" />
                      {profile.hometown}
                    </div>
                  )}
                  {likedUserIds.has(profile.userId) ? (
                    <Button
                      className="w-full bg-gray-400 hover:bg-gray-400 cursor-default"
                      size="sm"
                      disabled
                    >
                      <Heart className="w-4 h-4 mr-1 fill-white" />
                      {tDiscover('liked')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleLike(profile.userId)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {tDiscover('like')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
