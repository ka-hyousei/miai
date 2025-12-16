'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      // 登録成功後、自動ログイン
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // プロフィール設定ページへ
      router.push('/profile/setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">お見合い</h1>
            <p className="text-gray-600">新規登録</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              id="email"
              name="email"
              type="email"
              label="メールアドレス"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="パスワード"
              value={formData.password}
              onChange={handleChange}
              placeholder="8文字以上（英字・数字を含む）"
              required
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="パスワード（確認）"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="パスワードを再入力"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              登録する
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              既にアカウントをお持ちの方は{' '}
              <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
                ログイン
              </Link>
            </p>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            登録することで、
            <Link href="/terms" className="text-pink-500 hover:underline">利用規約</Link>
            と
            <Link href="/privacy" className="text-pink-500 hover:underline">プライバシーポリシー</Link>
            に同意したものとみなされます。
          </div>
        </div>
      </div>
    </div>
  )
}
