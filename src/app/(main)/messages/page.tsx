'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MessageCircle, User } from 'lucide-react'

interface Conversation {
  id: string
  otherUser: {
    id: string
    profile: {
      nickname: string
    } | null
    photos: { url: string; isMain: boolean }[]
  }
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
    fromUserId: string
  } | null
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('messages')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages')
        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchConversations()
    }
  }, [session])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return t('yesterday')
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    }
  }

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
        {/* 标题 - 中国风 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-yellow-600">◈</span>
          <h1 className="text-xl font-bold text-red-700">{t('title')}</h1>
          <span className="text-yellow-600">◈</span>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-b from-red-50 to-orange-50 rounded-xl border-2 border-red-200 relative overflow-hidden">
            {/* 装饰性角落 */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

            <div className="text-red-300 text-4xl mb-4">🏮</div>
            <p className="text-gray-600 mb-2">{t('noMessages')}</p>
            <p className="text-sm text-gray-400">
              {t('noMessagesDesc')}
            </p>
            <Link
              href="/discover"
              className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 font-medium transition-all"
            >
              {t('findSomeone')}
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm overflow-hidden border-2 border-red-200 relative">
            {/* 装饰性角落 */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg z-10" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg z-10" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg z-10" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg z-10" />

            {conversations.map((conversation) => {
              const mainPhoto = conversation.otherUser.photos.find(p => p.isMain) || conversation.otherUser.photos[0]
              const isUnread = conversation.unreadCount > 0

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.otherUser.id}`}
                  className={`flex items-center gap-4 p-4 hover:bg-red-50/50 border-b border-red-100 last:border-b-0 transition-colors ${
                    isUnread ? 'bg-red-50/70' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-red-200">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto.url}
                        alt={conversation.otherUser.profile?.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-red-100 to-orange-100">
                        <User className="w-6 h-6 text-red-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium flex items-center gap-1 ${isUnread ? 'text-red-700' : 'text-gray-700'}`}>
                        {conversation.otherUser.profile?.nickname || t('user')}
                        {isUnread && <span className="text-yellow-500 text-sm">✿</span>}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {conversation.lastMessage?.content || t('startMessaging')}
                      </p>
                      {isUnread && (
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
