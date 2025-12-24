'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Search, MapPin, Heart, MessageCircle, Sparkles } from 'lucide-react'

interface DailyPick {
  id: string
  nickname: string
  age: number
  prefecture: string
  bio: string | null
  mainPhoto: string | null
  isLiked: boolean
}

export function HomeHero() {
  const { data: session, status } = useSession()
  const t = useTranslations('home')
  const [likesCount, setLikesCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [dailyPick, setDailyPick] = useState<DailyPick | null>(null)
  const [dailyPickLoading, setDailyPickLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    if (session) {
      // いいね数を取得
      fetch('/api/likes?type=received')
        .then(res => res.json())
        .then(data => setLikesCount(data.likes?.length || 0))
        .catch(() => {})

      // 未読メッセージ数を取得
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          const unread = data.conversations?.reduce((sum: number, conv: any) =>
            sum + (conv.unreadCount || 0), 0) || 0
          setUnreadCount(unread)
        })
        .catch(() => {})

      // 今日のおすすめを取得
      fetch('/api/daily-pick')
        .then(res => res.json())
        .then(data => {
          setDailyPick(data.pick || null)
          setDailyPickLoading(false)
        })
        .catch(() => setDailyPickLoading(false))
    }
  }, [session])

  const handleLikeDailyPick = async () => {
    if (!dailyPick || isLiking) return
    setIsLiking(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: dailyPick.id }),
      })
      if (res.ok) {
        setDailyPick({ ...dailyPick, isLiked: true })
      }
    } catch {
      // エラー時は何もしない
    } finally {
      setIsLiking(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="h-12 w-64 bg-red-100 animate-pulse rounded-lg mx-auto mb-6" />
        <div className="h-6 w-96 bg-red-100 animate-pulse rounded-lg mx-auto mb-8" />
        <div className="h-14 w-48 bg-red-100 animate-pulse rounded-full mx-auto" />
      </div>
    )
  }

  if (session) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        {/* 装饰性边框 */}
        <div className="inline-block mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-yellow-500">✿</span>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
              {t('welcomeBack')}
            </h2>
            <span className="text-2xl text-yellow-500">✿</span>
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          {t('loggedInSubtitle')}
        </p>

        {/* 今日の縁 - Daily Pick */}
        {!dailyPickLoading && dailyPick && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-700">{t('dailyPick')}</h3>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="bg-gradient-to-br from-white via-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-4 shadow-lg">
              <div className="flex items-center gap-4">
                {/* 写真 */}
                <Link href={`/profile/${dailyPick.id}`} className="shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-red-300 shadow-md">
                    {dailyPick.mainPhoto ? (
                      <Image
                        src={dailyPick.mainPhoto}
                        alt={dailyPick.nickname}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                        <span className="text-2xl text-red-300">👤</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* 情報 */}
                <div className="flex-1 text-left min-w-0">
                  <Link href={`/profile/${dailyPick.id}`}>
                    <h4 className="font-bold text-gray-800 text-lg truncate hover:text-red-600 transition-colors">
                      {dailyPick.nickname}
                    </h4>
                  </Link>
                  <p className="text-sm text-gray-600">
                    {dailyPick.age}{t('yearsOld')} · {dailyPick.prefecture}
                  </p>
                  {dailyPick.bio && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {dailyPick.bio}
                    </p>
                  )}
                </div>

                {/* いいねボタン */}
                <button
                  onClick={handleLikeDailyPick}
                  disabled={dailyPick.isLiked || isLiking}
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    dailyPick.isLiked
                      ? 'bg-pink-100 text-pink-500 cursor-default'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${dailyPick.isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4つの快速入口 */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {/* 探す */}
          <Link
            href="/discover"
            className="flex flex-col items-center gap-2 p-5 bg-gradient-to-br from-white to-red-50 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t('startDiscover')}</span>
          </Link>

          {/* 附近の人 */}
          <Link
            href="/nearby"
            className="flex flex-col items-center gap-2 p-5 bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t('nearbyPeople')}</span>
          </Link>

          {/* いいね */}
          <Link
            href="/likes"
            className="flex flex-col items-center gap-2 p-5 bg-gradient-to-br from-white to-pink-50 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all group relative"
          >
            {likesCount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {likesCount}
              </div>
            )}
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t('viewLikes')}</span>
          </Link>

          {/* メッセージ */}
          <Link
            href="/messages"
            className="flex flex-col items-center gap-2 p-5 bg-gradient-to-br from-white to-green-50 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all group relative"
          >
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </div>
            )}
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t('viewMessages')}</span>
          </Link>
        </div>

        {/* 底部装饰 */}
        <div className="mt-8 flex items-center justify-center gap-2 text-red-300 text-sm">
          <span>—</span>
          <span className="text-yellow-500">囍</span>
          <span>缘定今生</span>
          <span className="text-yellow-500">囍</span>
          <span>—</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      {/* 传统装饰框 */}
      <div className="relative inline-block mb-8">
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

        <div className="px-8 py-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-3xl">🏮</span>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
              {t('subtitle')}
            </h2>
            <span className="text-3xl">🏮</span>
          </div>
        </div>
      </div>

      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        {t('description')}
      </p>

      {/* 装饰性分隔线 */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-red-300" />
        <span className="text-yellow-500 text-xl">❀</span>
        <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-red-300" />
      </div>

      <Link
        href="/register"
        className="inline-block px-10 py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white text-lg font-bold rounded-full hover:from-red-600 hover:via-red-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-yellow-400/30"
      >
        <span className="flex items-center gap-2">
          <span className="text-yellow-300">✨</span>
          {t('startButton')}
          <span className="text-yellow-300">✨</span>
        </span>
      </Link>

      {/* 底部装饰 */}
      <div className="mt-12 flex items-center justify-center gap-2 text-red-300 text-sm">
        <span>—</span>
        <span className="text-yellow-500">囍</span>
        <span>缘定今生</span>
        <span className="text-yellow-500">囍</span>
        <span>—</span>
      </div>
    </div>
  )
}
