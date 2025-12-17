'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  Briefcase,
  Globe,
  Calendar,
  Ruler,
  Flag,
  Home,
  Languages,
  Target,
  Shield,
  Ban,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileData {
  id: string
  userId: string
  nickname: string
  gender: string
  birthDate: string
  prefecture: string
  city: string | null
  bio: string | null
  height: number | null
  occupation: string | null
  nationality: string | null
  hometown: string | null
  visaType: string | null
  yearsInJapan: number | null
  japaneseLevel: string | null
  futurePlan: string | null
  wechatId: string | null
  phoneNumber: string | null
  contactEmail: string | null
  showVisaType: boolean
  showYearsInJapan: boolean
  showContact: boolean
  contactVisibility: string
  user: {
    photos: { id: string; url: string; isMain: boolean }[]
  }
}

const GENDER_LABELS: Record<string, string> = {
  MALE: '男性',
  FEMALE: '女性',
  OTHER: 'その他',
}

const JAPANESE_LEVEL_LABELS: Record<string, string> = {
  NONE: '話せない',
  BEGINNER: '初級',
  INTERMEDIATE: '中級',
  ADVANCED: '上級',
  NATIVE: 'ネイティブ',
}

const FUTURE_PLAN_LABELS: Record<string, string> = {
  STAY_LONG: '長期滞在予定',
  STAY_SHORT: '短期滞在予定',
  UNDECIDED: '未定',
  RETURN_HOME: '帰国予定',
}

const VISA_TYPE_LABELS: Record<string, string> = {
  WORK: '就労ビザ',
  STUDENT: '留学ビザ',
  SPOUSE: '配偶者ビザ',
  PERMANENT: '永住権',
  WORKING_HOLIDAY: 'ワーキングホリデー',
  OTHER: 'その他',
}

export default function ProfileDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [isMatched, setIsMatched] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${profileId}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          setHasLiked(data.hasLiked || false)
          setIsMatched(data.isMatched || false)
          setIsPremium(data.isPremium || false)
        } else if (response.status === 404) {
          router.push('/discover')
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session && profileId) {
      fetchProfile()
    }
  }, [session, profileId, router])

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

  const handleLike = async () => {
    if (!profile || hasLiked) return
    setIsLiking(true)
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: profile.userId }),
      })
      if (response.ok) {
        setHasLiked(true)
        const data = await response.json()
        if (data.isMatch) {
          alert('マッチングしました！メッセージを送ってみましょう。')
        }
      }
    } catch (error) {
      console.error('Failed to like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleBlock = async () => {
    if (!profile) return
    setIsBlocking(true)
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId }),
      })
      if (response.ok) {
        router.push('/discover')
      }
    } catch (error) {
      console.error('Failed to block:', error)
    } finally {
      setIsBlocking(false)
      setShowBlockConfirm(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">プロフィールが見つかりませんでした</p>
      </div>
    )
  }

  const photos = profile.user.photos
  const mainPhoto = photos.find(p => p.isMain) || photos[0]

  return (
    <div className="md:ml-64">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold">{profile.nickname}</h1>
        </div>

        {/* Photo Gallery */}
        <div className="relative aspect-[3/4] bg-gray-200">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[currentPhotoIndex]?.url || mainPhoto?.url}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <div className="absolute top-4 left-0 right-0 flex justify-center gap-1">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-8 h-1 rounded-full ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-white"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-white"
                  >
                    ›
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Photo
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.nickname}, {calculateAge(profile.birthDate)}
            </h2>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.prefecture}{profile.city && ` ${profile.city}`}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {GENDER_LABELS[profile.gender] || profile.gender}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            {profile.occupation && (
              <div className="flex items-center gap-3 text-gray-700">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span>{profile.occupation}</span>
              </div>
            )}
            {profile.height && (
              <div className="flex items-center gap-3 text-gray-700">
                <Ruler className="w-5 h-5 text-gray-400" />
                <span>{profile.height}cm</span>
              </div>
            )}
            {profile.nationality && (
              <div className="flex items-center gap-3 text-gray-700">
                <Globe className="w-5 h-5 text-gray-400" />
                <span>{profile.nationality}</span>
              </div>
            )}
            {profile.hometown && (
              <div className="flex items-center gap-3 text-gray-700">
                <Home className="w-5 h-5 text-gray-400" />
                <span>{profile.hometown}</span>
              </div>
            )}
            {profile.visaType && (
              <div className="flex items-center gap-3 text-gray-700">
                <Flag className="w-5 h-5 text-gray-400" />
                <span>{VISA_TYPE_LABELS[profile.visaType] || profile.visaType}</span>
              </div>
            )}
            {profile.yearsInJapan !== null && (
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>日本在住 {profile.yearsInJapan}年</span>
              </div>
            )}
            {profile.japaneseLevel && (
              <div className="flex items-center gap-3 text-gray-700">
                <Languages className="w-5 h-5 text-gray-400" />
                <span>日本語: {JAPANESE_LEVEL_LABELS[profile.japaneseLevel] || profile.japaneseLevel}</span>
              </div>
            )}
            {profile.futurePlan && (
              <div className="flex items-center gap-3 text-gray-700">
                <Target className="w-5 h-5 text-gray-400" />
                <span>{FUTURE_PLAN_LABELS[profile.futurePlan] || profile.futurePlan}</span>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {profile.showContact && (profile.wechatId || profile.phoneNumber || profile.contactEmail) && (() => {
            // 公開対象のチェック
            const canViewContact =
              profile.contactVisibility === 'EVERYONE' ||
              (profile.contactVisibility === 'PREMIUM_ONLY' && isPremium) ||
              (profile.contactVisibility === 'MATCHED_ONLY' && isMatched)

            if (canViewContact) {
              return (
                <div className="bg-pink-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-pink-700 mb-3">連絡先</h3>
                  <div className="space-y-2">
                    {profile.wechatId && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        <span>WeChat: {profile.wechatId}</span>
                      </div>
                    )}
                    {profile.phoneNumber && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-blue-500" />
                        <span>{profile.phoneNumber}</span>
                      </div>
                    )}
                    {profile.contactEmail && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="w-5 h-5 text-orange-500" />
                        <span>{profile.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            } else {
              // 公開対象外の場合はメッセージを表示
              const message = profile.contactVisibility === 'PREMIUM_ONLY'
                ? '連絡先は有料会員のみに公開されています'
                : '連絡先はマッチした相手のみに公開されています'
              return (
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">{message}</span>
                  </div>
                </div>
              )
            }
          })()}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleLike}
              disabled={hasLiked || isLiking}
              className="flex-1"
              isLoading={isLiking}
            >
              <Heart className={`w-5 h-5 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
              {hasLiked ? 'いいね済み' : 'いいね'}
            </Button>
            <Link href={`/messages/${profile.userId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-5 h-5 mr-2" />
                メッセージ
              </Button>
            </Link>
          </div>

          {/* Block Button */}
          <div className="pt-4 border-t">
            <button
              onClick={() => setShowBlockConfirm(true)}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm"
            >
              <Ban className="w-4 h-4" />
              このユーザーをブロック
            </button>
          </div>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ブロックしますか？</h3>
            <p className="text-gray-600 mb-6">
              {profile.nickname}さんをブロックすると、お互いに検索結果に表示されなくなり、メッセージの送受信もできなくなります。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBlockConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleBlock}
                isLoading={isBlocking}
              >
                ブロック
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
