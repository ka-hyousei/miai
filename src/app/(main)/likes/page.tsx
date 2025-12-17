'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Heart, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LikeUser {
  id: string
  profile: {
    nickname: string
    birthDate: string
    prefecture: string
  } | null
  photos: { url: string; isMain: boolean }[]
}

interface Like {
  id: string
  createdAt: string
  fromUser?: LikeUser
  toUser?: LikeUser
  isMatch?: boolean
}

export default function LikesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('likes')

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([])
  const [sentLikes, setSentLikes] = useState<Like[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          fetch('/api/likes?type=received'),
          fetch('/api/likes?type=sent'),
        ])

        if (receivedRes.ok) {
          const data = await receivedRes.json()
          setReceivedLikes(data.likes || [])
        }

        if (sentRes.ok) {
          const data = await sentRes.json()
          setSentLikes(data.likes || [])
        }
      } catch (error) {
        console.error('Failed to fetch likes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchLikes()
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

  const handleLikeBack = async (e: React.MouseEvent, userId: string, likeId: string) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setReceivedLikes(receivedLikes.map(like =>
          like.id === likeId ? { ...like, isMatch: true } : like
        ))
        if (data.isMatch) {
          alert(t('matchSuccess'))
        }
      } else {
        const data = await response.json()
        alert(data.error || t('likeFailed'))
      }
    } catch (error) {
      console.error('Failed to like back:', error)
      alert(t('likeFailed'))
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  const currentLikes = activeTab === 'received' ? receivedLikes : sentLikes

  return (
    <div className="md:ml-64">
      <div className="p-4">
        {/* Tabs - 中国风 */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-1.5 shadow-sm mb-6 border-2 border-red-200 relative overflow-hidden">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

          <div className="flex">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'received'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                {activeTab === 'received' && <span className="text-yellow-300">♥</span>}
                {t('received')} ({receivedLikes.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                {activeTab === 'sent' && <span className="text-yellow-300">♥</span>}
                {t('sent')} ({sentLikes.length})
              </span>
            </button>
          </div>
        </div>

        {/* Likes List */}
        {currentLikes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-red-300 text-4xl mb-4">🏮</div>
            <p className="text-gray-500">
              {activeTab === 'received'
                ? t('noLikesReceived')
                : t('noLikesSent')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentLikes.map((like) => {
              const user = activeTab === 'received' ? like.fromUser : like.toUser
              if (!user?.profile) return null

              const mainPhoto = user.photos.find(p => p.isMain) || user.photos[0]

              return (
                <div
                  key={like.id}
                  className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-red-100 hover:border-red-300 group"
                >
                  <Link href={`/profile/${user.id}`}>
                    <div className="aspect-[3/4] bg-gray-200 relative">
                      {mainPhoto ? (
                        <img
                          src={mainPhoto.url}
                          alt={user.profile.nickname}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Photo
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {user.profile.nickname}, {calculateAge(user.profile.birthDate)}
                          <span className="text-yellow-400 text-sm">✿</span>
                        </h3>
                        <div className="flex items-center gap-1 text-white/80 text-sm">
                          <MapPin className="w-3 h-3" />
                          {user.profile.prefecture}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {activeTab === 'received' && (
                    <div className="p-3">
                      {like.isMatch ? (
                        <Link href={`/messages/${user.id}`}>
                          <Button
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                            size="sm"
                          >
                            {t('matchedGoToMessage')}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          type="button"
                          onClick={(e) => handleLikeBack(e, user.id, like.id)}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                          size="sm"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {t('likeBack')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
