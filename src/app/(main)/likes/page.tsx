'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
          console.log('もらったいいねデータ:', data.likes)
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

    console.log('いいね返しクリック:', { userId, likeId })

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        // いいね返し後、マッチ状態を更新
        setReceivedLikes(receivedLikes.map(like =>
          like.id === likeId ? { ...like, isMatch: true } : like
        ))
        if (data.isMatch) {
          alert('マッチングしました！メッセージを送ってみましょう。')
        }
      } else {
        const data = await response.json()
        alert(data.error || 'いいねに失敗しました')
      }
    } catch (error) {
      console.error('Failed to like back:', error)
      alert('いいねに失敗しました')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  const currentLikes = activeTab === 'received' ? receivedLikes : sentLikes

  return (
    <div className="md:ml-64">
      <div className="p-4">
        {/* Tabs */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            もらったいいね ({receivedLikes.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            送ったいいね ({sentLikes.length})
          </button>
        </div>

        {/* Likes List */}
        {currentLikes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {activeTab === 'received'
              ? 'まだいいねをもらっていません'
              : 'まだいいねを送っていません'}
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
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/profile/${user.id}`}>
                    <div className="aspect-[3/4] bg-gray-200 relative">
                      {mainPhoto ? (
                        <img
                          src={mainPhoto.url}
                          alt={user.profile.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Photo
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="text-white font-semibold">
                          {user.profile.nickname}, {calculateAge(user.profile.birthDate)}
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
                            className="w-full"
                            size="sm"
                          >
                            マッチ済み - メッセージへ
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          type="button"
                          onClick={(e) => handleLikeBack(e, user.id, like.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          いいね返し
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
