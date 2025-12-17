'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

      // 初回読み込み時にデフォルトの性別フィルタを設定
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
      fetchProfiles(true) // 初回読み込み
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
      gender: defaultGender, // デフォルトで異性を選択
      prefecture: '',
      ageMin: '',
      ageMax: '',
      nationality: '',
      visaType: '',
    })
    setSearchTrigger(prev => prev + 1)
  }

  // 国籍変更時に在留資格をリセット
  const handleNationalityChange = (value: string) => {
    setFilters({
      ...filters,
      nationality: value,
      visaType: value === '日本' ? '' : filters.visaType,
    })
  }

  // 日本以外の国籍が選択されているかどうか
  const showVisaTypeFilter = filters.nationality && filters.nationality !== '日本'

  const handleLike = async (userId: string) => {
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId }),
      })
      // いいね済みとしてマーク（リストからは削除しない）
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
    label: `${18 + i}歳`,
  }))

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="md:ml-64">
      <div className="p-4">
        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">検索条件</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              id="gender"
              options={GENDER_OPTIONS}
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              placeholder="性別"
            />
            <Select
              id="prefecture"
              options={prefectureOptions}
              value={filters.prefecture}
              onChange={(e) => setFilters({ ...filters, prefecture: e.target.value })}
              placeholder="地域"
            />
            <Select
              id="ageMin"
              options={ageOptions}
              value={filters.ageMin}
              onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
              placeholder="年齢（下限）"
            />
            <Select
              id="ageMax"
              options={ageOptions}
              value={filters.ageMax}
              onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
              placeholder="年齢（上限）"
            />
            <Select
              id="nationality"
              options={NATIONALITY_OPTIONS}
              value={filters.nationality}
              onChange={(e) => handleNationalityChange(e.target.value)}
              placeholder="国籍"
            />
            {showVisaTypeFilter && (
              <Select
                id="visaType"
                options={VISA_TYPE_OPTIONS}
                value={filters.visaType}
                onChange={(e) => setFilters({ ...filters, visaType: e.target.value })}
                placeholder="在留資格"
              />
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
            <Button onClick={handleClear} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              クリア
            </Button>
          </div>
        </div>

        {/* Profile Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            条件に合うユーザーが見つかりませんでした
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/profile/${profile.id}`}>
                  <div className="aspect-[3/4] bg-gray-200 relative">
                    {profile.user.photos[0] ? (
                      <img
                        src={profile.user.photos[0].url}
                        alt={profile.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Photo
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-white font-semibold">
                        {profile.nickname}, {calculateAge(profile.birthDate)}
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
                      <Briefcase className="w-3 h-3" />
                      {profile.occupation}
                    </div>
                  )}
                  {profile.nationality && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                      <Globe className="w-3 h-3" />
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
                      いいね済み
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleLike(profile.userId)}
                      className="w-full"
                      size="sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      いいね
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
