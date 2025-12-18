'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Heart, MapPin, Briefcase, Globe, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { PREFECTURES, GENDER_OPTIONS, NATIONALITY_OPTIONS, VISA_TYPE_OPTIONS } from '@/lib/constants'

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
  user: {
    photos: { url: string; isMain: boolean }[]
  }
}

export default function DiscoverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('discover')
  const tProfile = useTranslations('profile')

  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [defaultGender, setDefaultGender] = useState<string>('')
  const [filters, setFilters] = useState({
    gender: '',
    prefecture: '',
    ageMin: '',
    ageMax: '',
    nationality: '',
    visaType: '',
  })
  const [searchTrigger, setSearchTrigger] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchProfiles = async (isInitial = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.gender) params.append('gender', filters.gender)
      if (filters.prefecture) params.append('prefecture', filters.prefecture)
      if (filters.ageMin) params.append('ageMin', filters.ageMin)
      if (filters.ageMax) params.append('ageMax', filters.ageMax)
      if (filters.nationality) params.append('nationality', filters.nationality)
      if (filters.visaType) params.append('visaType', filters.visaType)

      const response = await fetch(`/api/discover?${params.toString()}`)
      const data = await response.json()
      setProfiles(data.profiles || [])

      // 已点赞的用户ID列表
      if (data.likedUserIds) {
        setLikedUserIds(new Set(data.likedUserIds))
      }

      if (isInitial && data.defaultGender) {
        setDefaultGender(data.defaultGender)
        setFilters(prev => ({ ...prev, gender: data.defaultGender }))
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchProfiles(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (session && searchTrigger > 0) {
      fetchProfiles()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrigger])

  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1)
  }

  const handleClear = () => {
    setFilters({
      gender: defaultGender,
      prefecture: '',
      ageMin: '',
      ageMax: '',
      nationality: '',
      visaType: '',
    })
    setSearchTrigger(prev => prev + 1)
  }

  const handleNationalityChange = (value: string) => {
    setFilters({
      ...filters,
      nationality: value,
      visaType: value === '日本' ? '' : filters.visaType,
    })
  }

  const showVisaTypeFilter = filters.nationality && filters.nationality !== '日本'

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

  const prefectureOptions = PREFECTURES.map((p) => ({ value: p, label: p }))
  const ageOptions = Array.from({ length: 53 }, (_, i) => ({
    value: String(18 + i),
    label: `${18 + i}${t('yearsOld')}`,
  }))

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  return (
    <div className="md:ml-64">
      <div className="p-4">
        {/* Filters - 中国风 */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-6 shadow-sm border-2 border-red-200 relative overflow-hidden">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-600">◈</span>
            <h2 className="font-semibold text-red-700">{t('searchConditions')}</h2>
            <span className="text-yellow-600">◈</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              id="gender"
              options={GENDER_OPTIONS}
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              placeholder={tProfile('gender')}
            />
            <Select
              id="prefecture"
              options={prefectureOptions}
              value={filters.prefecture}
              onChange={(e) => setFilters({ ...filters, prefecture: e.target.value })}
              placeholder={t('region')}
            />
            <Select
              id="ageMin"
              options={ageOptions}
              value={filters.ageMin}
              onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
              placeholder={t('ageMin')}
            />
            <Select
              id="ageMax"
              options={ageOptions}
              value={filters.ageMax}
              onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
              placeholder={t('ageMax')}
            />
            <Select
              id="nationality"
              options={NATIONALITY_OPTIONS}
              value={filters.nationality}
              onChange={(e) => handleNationalityChange(e.target.value)}
              placeholder={tProfile('nationality')}
            />
            {showVisaTypeFilter && (
              <Select
                id="visaType"
                options={VISA_TYPE_OPTIONS}
                value={filters.visaType}
                onChange={(e) => setFilters({ ...filters, visaType: e.target.value })}
                placeholder={tProfile('visaType')}
              />
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSearch} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              <Search className="w-4 h-4 mr-2" />
              {t('search')}
            </Button>
            <Button onClick={handleClear} variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('clear')}
            </Button>
          </div>
        </div>

        {/* Profile Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-red-300 text-4xl mb-4">🏮</div>
            <p className="text-gray-500">{t('noMatch')}</p>
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
                  {profile.nationality && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <Globe className="w-3 h-3 text-red-400" />
                      {profile.nationality}
                    </div>
                  )}
                  {likedUserIds.has(profile.userId) ? (
                    <Button
                      className="w-full bg-gray-400 hover:bg-gray-400 cursor-default"
                      size="sm"
                      disabled
                    >
                      <Heart className="w-4 h-4 mr-1 fill-white" />
                      {t('liked')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleLike(profile.userId)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {t('like')}
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
