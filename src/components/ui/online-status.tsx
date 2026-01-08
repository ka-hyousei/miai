'use client'

import { useTranslations } from 'next-intl'

interface OnlineStatusProps {
  lastSeen: string | Date | null | undefined
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// 最終アクティブ日時からオンライン状態を判定
export function getOnlineStatus(lastSeen: string | Date | null | undefined): 'online' | 'recent' | 'away' | 'offline' {
  if (!lastSeen) return 'offline'

  const lastSeenDate = new Date(lastSeen)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)

  if (diffMinutes < 5) return 'online'      // 5分以内 = オンライン
  if (diffMinutes < 60) return 'recent'     // 1時間以内 = 最近
  if (diffMinutes < 1440) return 'away'     // 24時間以内 = 離席中
  return 'offline'                           // それ以外 = オフライン
}

// 相対的な時間表示を取得
export function getRelativeTime(lastSeen: string | Date | null | undefined): string {
  if (!lastSeen) return ''

  const lastSeenDate = new Date(lastSeen)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return '今'
  if (diffMinutes < 60) return `${diffMinutes}分前`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}時間前`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}日前`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}週間前`

  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}ヶ月前`
}

export function OnlineStatus({ lastSeen, showText = true, size = 'md' }: OnlineStatusProps) {
  const t = useTranslations('common')
  const status = getOnlineStatus(lastSeen)

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  const statusColors = {
    online: 'bg-green-500',
    recent: 'bg-yellow-500',
    away: 'bg-gray-400',
    offline: 'bg-gray-300',
  }

  const statusTexts: Record<string, string> = {
    online: 'オンライン',
    recent: getRelativeTime(lastSeen),
    away: getRelativeTime(lastSeen),
    offline: getRelativeTime(lastSeen) || 'オフライン',
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ${
          status === 'online' ? 'animate-pulse' : ''
        }`}
      />
      {showText && (
        <span className={`text-xs ${status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
          {statusTexts[status]}
        </span>
      )}
    </div>
  )
}
