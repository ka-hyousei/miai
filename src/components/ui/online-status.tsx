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

// 相対的な時間の差分情報を取得
function getTimeDiff(lastSeen: string | Date | null | undefined): { type: string; value: number } | null {
  if (!lastSeen) return null

  const lastSeenDate = new Date(lastSeen)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return { type: 'justNow', value: 0 }
  if (diffMinutes < 60) return { type: 'minutes', value: diffMinutes }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return { type: 'hours', value: diffHours }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return { type: 'days', value: diffDays }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return { type: 'weeks', value: diffWeeks }

  const diffMonths = Math.floor(diffDays / 30)
  return { type: 'months', value: diffMonths }
}

export function OnlineStatus({ lastSeen, showText = true, size = 'md' }: OnlineStatusProps) {
  const t = useTranslations('common')
  const status = getOnlineStatus(lastSeen)
  const timeDiff = getTimeDiff(lastSeen)

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

  // 翻訳を使用して相対時間を取得
  const getRelativeTimeText = (): string => {
    if (!timeDiff) return t('offline')

    switch (timeDiff.type) {
      case 'justNow':
        return t('justNow')
      case 'minutes':
        return t('minutesAgo', { minutes: timeDiff.value })
      case 'hours':
        return t('hoursAgo', { hours: timeDiff.value })
      case 'days':
        return t('daysAgo', { days: timeDiff.value })
      case 'weeks':
        return t('weeksAgo', { weeks: timeDiff.value })
      case 'months':
        return t('monthsAgo', { months: timeDiff.value })
      default:
        return t('offline')
    }
  }

  const getStatusText = (): string => {
    if (status === 'online') return t('online')
    return getRelativeTimeText()
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
          {getStatusText()}
        </span>
      )}
    </div>
  )
}
