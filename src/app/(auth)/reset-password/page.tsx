'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // トークンがない場合
  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          <p>無効なリンクです。パスワードリセットを再度リクエストしてください。</p>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full">パスワードリセットをリクエスト</Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // パスワードの確認
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        // 成功したらログインページへリダイレクト
        router.push('/login?message=password-reset-success')
      }
    } catch {
      setError('リクエストに失敗しました。しばらくしてから再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Input
        id="password"
        type="password"
        label="新しいパスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="8文字以上"
        required
      />

      <Input
        id="confirmPassword"
        type="password"
        label="新しいパスワード（確認）"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="もう一度入力してください"
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        パスワードを変更
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">お見合い</h1>
            <p className="text-gray-600">新しいパスワードを設定</p>
          </div>

          <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
              ログインページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
