'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BlockedUser {
  id: string
  blockedUser: {
    id: string
    profile: {
      nickname: string
    } | null
    photos: { url: string; isMain: boolean }[]
  }
  createdAt: string
}

export default function BlockedUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await fetch('/api/blocks')
        if (response.ok) {
          const data = await response.json()
          setBlockedUsers(data.blocks || [])
        }
      } catch (error) {
        console.error('Failed to fetch blocked users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchBlockedUsers()
    }
  }, [session])

  const handleUnblock = async (blockId: string, userId: string) => {
    setUnblockingId(blockId)
    try {
      const response = await fetch(`/api/blocks/${userId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(b => b.id !== blockId))
      }
    } catch (error) {
      console.error('Failed to unblock user:', error)
    } finally {
      setUnblockingId(null)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="md:ml-64">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">ブロックリスト</h1>
        </div>

        {blockedUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ブロックしているユーザーはいません</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y">
              {blockedUsers.map((block) => {
                const mainPhoto = block.blockedUser.photos.find(p => p.isMain) || block.blockedUser.photos[0]

                return (
                  <div key={block.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {mainPhoto ? (
                          <img
                            src={mainPhoto.url}
                            alt={block.blockedUser.profile?.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {block.blockedUser.profile?.nickname || 'ユーザー'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(block.createdAt).toLocaleDateString('ja-JP')} にブロック
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(block.id, block.blockedUser.id)}
                      isLoading={unblockingId === block.id}
                    >
                      解除
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          ブロックを解除すると、相手があなたを検索できるようになります
        </p>
      </div>
    </div>
  )
}
