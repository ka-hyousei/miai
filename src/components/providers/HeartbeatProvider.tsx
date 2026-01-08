'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const HEARTBEAT_INTERVAL = 60 * 1000 // 1分ごとに更新

export function HeartbeatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    // 初回実行
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/heartbeat', { method: 'POST' })
      } catch (error) {
        // エラーは無視（ネットワーク問題等）
      }
    }

    sendHeartbeat()

    // 定期実行
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    return () => clearInterval(interval)
  }, [session?.user])

  return <>{children}</>
}
