'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, Lock, Eye, Shield, Trash2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    showOnlineStatus: true,
    isProfilePublic: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      })
      if (response.ok) {
        await signOut({ callbackUrl: '/' })
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }

  if (status === 'loading') {
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
          <Link href="/mypage" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">設定</h1>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              通知設定
            </h2>
          </div>
          <div className="divide-y">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">メール通知</p>
                <p className="text-sm text-gray-500">いいねやメッセージをメールで受け取る</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.emailNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">プッシュ通知</p>
                <p className="text-sm text-gray-500">アプリからの通知を受け取る</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.pushNotifications ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.pushNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* プライバシー設定 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-500" />
              プライバシー設定
            </h2>
          </div>
          <div className="divide-y">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">オンライン状態を表示</p>
                <p className="text-sm text-gray-500">他のユーザーにオンライン状態を見せる</p>
              </div>
              <button
                onClick={() => handleToggle('showOnlineStatus')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.showOnlineStatus ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.showOnlineStatus ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">プロフィール公開</p>
                <p className="text-sm text-gray-500">検索結果にプロフィールを表示する</p>
              </div>
              <button
                onClick={() => handleToggle('isProfilePublic')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.isProfilePublic ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.isProfilePublic ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* セキュリティ */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              セキュリティ
            </h2>
          </div>
          <div className="divide-y">
            <Link href="/settings/password" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">パスワード変更</p>
                  <p className="text-sm text-gray-500">アカウントのパスワードを変更</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link href="/settings/blocked" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">ブロックリスト</p>
                  <p className="text-sm text-gray-500">ブロックしたユーザーを管理</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        {/* アカウント */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">アカウント</h2>
          </div>
          <div className="divide-y">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">ログアウト</p>
                <p className="text-sm text-gray-500">アカウントからログアウト</p>
              </div>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-left"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-medium text-red-600">アカウント削除</p>
                <p className="text-sm text-gray-500">アカウントを完全に削除</p>
              </div>
            </button>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>お見合い v1.0.0</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-gray-700">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-700">プライバシーポリシー</Link>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">アカウント削除</h3>
            <p className="text-gray-600 mb-6">
              アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。本当に削除しますか？
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleDeleteAccount}
                isLoading={isLoading}
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
