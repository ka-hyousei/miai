'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  content: string
  fromUserId: string
  createdAt: string
}

interface ChatUser {
  id: string
  profile: {
    nickname: string
  } | null
  photos: { url: string; isMain: boolean }[]
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const otherUserId = params.userId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMatched, setIsMatched] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${otherUserId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
          setOtherUser(data.otherUser || null)
        } else if (response.status === 403) {
          router.push('/messages')
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session && otherUserId) {
      fetchMessages()
      // ポーリングで新しいメッセージを取得
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [session, otherUserId, router])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    setError(null)
    try {
      const response = await fetch(`/api/messages/${otherUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages([...messages, data.message])
        setNewMessage('')
      } else {
        if (response.status === 403 && data.error?.includes('マッチング')) {
          setIsMatched(false)
        }
        setError(data.error || 'メッセージの送信に失敗しました')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('メッセージの送信に失敗しました')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return '今日'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日'
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
    }
  }

  // メッセージを日付でグループ化
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  const mainPhoto = otherUser?.photos.find(p => p.isMain) || otherUser?.photos[0]

  return (
    <div className="md:ml-64 h-[100dvh] flex flex-col bg-gray-50">
      {/* Header - 固定 */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/messages" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <Link href={`/profile/${otherUser?.id}`} className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
            {mainPhoto ? (
              <img
                src={mainPhoto.url}
                alt={otherUser?.profile?.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">
              {otherUser?.profile?.nickname || 'ユーザー'}
            </span>
            <span className="text-xs text-green-500">オンライン</span>
          </div>
        </Link>
      </div>

      {/* Messages - スクロール可能 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">まだメッセージがありません</p>
            <p className="text-sm mt-1">最初のメッセージを送ってみましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                    {formatDate(msgs[0].createdAt)}
                  </span>
                </div>
                <div className="space-y-2">
                  {msgs.map((message) => {
                    const isOwn = message.fromUserId === session?.user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 ${
                            isOwn
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-[15px]">{message.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isOwn ? 'text-pink-100' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Not Matched Warning */}
      {!isMatched && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3 text-center">
          <p className="text-sm text-yellow-800">
            マッチングしていないためメッセージを送れません。
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            お互いにいいねをするとメッセージを送れるようになります。
          </p>
        </div>
      )}

      {/* Message Input - 固定フッター */}
      <div className="sticky bottom-0 bg-white border-t safe-area-bottom">
        <form onSubmit={handleSend} className="p-3">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  // テキストエリアの高さを自動調整
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={(e) => {
                  // Ctrl+Enter または Cmd+Enter で送信
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                placeholder={isMatched ? "メッセージを入力..." : "マッチングが必要です"}
                disabled={!isMatched}
                rows={1}
                className="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all disabled:bg-gray-200 disabled:text-gray-400 text-[15px] leading-relaxed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending || !isMatched}
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all active:scale-95"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {isMatched && (
            <p className="text-[10px] text-gray-400 text-center mt-1">
              Ctrl + Enter で送信
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
