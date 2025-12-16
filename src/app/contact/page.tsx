'use client'

import { useState } from 'react'
import Link from "next/link"
import { Heart, Sparkles, Send, Mail, MessageSquare } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', category: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
              ミアイ
            </span>
          </Link>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-pink-500 hover:text-pink-600 font-medium"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium"
            >
              新規登録
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
            <p className="text-gray-600">
              ご質問、ご要望、不具合の報告など、お気軽にお問い合わせください。
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                送信完了いたしました
              </h2>
              <p className="text-gray-600 mb-8">
                お問い合わせいただきありがとうございます。<br />
                内容を確認の上、担当者よりご連絡させていただきます。
              </p>
              <Link href="/">
                <Button variant="outline">
                  トップページへ戻る
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitStatus === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  送信に失敗しました。しばらくしてから再度お試しください。
                </div>
              )}

              <Input
                id="name"
                type="text"
                label="お名前"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="山田 太郎"
                required
              />

              <Input
                id="email"
                type="email"
                label="メールアドレス"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                required
              />

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  お問い合わせ種別
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="general">一般的なお問い合わせ</option>
                  <option value="account">アカウントに関するお問い合わせ</option>
                  <option value="bug">不具合の報告</option>
                  <option value="feature">機能のご要望</option>
                  <option value="report">ユーザーの通報</option>
                  <option value="payment">お支払いに関するお問い合わせ</option>
                  <option value="withdrawal">退会に関するお問い合わせ</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  お問い合わせ内容
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="お問い合わせ内容をご記入ください"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ご注意：</strong>お問い合わせへの回答は、通常2〜3営業日以内にご登録いただいたメールアドレス宛にお送りいたします。
                  お急ぎの場合は、お問い合わせ種別で該当するカテゴリをお選びください。
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                <Mail className="w-5 h-5 mr-2" />
                送信する
              </Button>
            </form>
          )}

          {/* FAQ Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">よくあるご質問</h2>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">パスワードを忘れてしまいました</span>
                  <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  <Link href="/forgot-password" className="text-pink-500 hover:text-pink-600">
                    パスワードをお忘れの方
                  </Link>
                  よりパスワードの再設定が可能です。
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">退会方法を教えてください</span>
                  <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  ログイン後、マイページ &gt; 設定 &gt; アカウント削除より退会手続きが可能です。
                  退会すると、プロフィール情報やメッセージ履歴がすべて削除されます。
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">不審なユーザーを見つけました</span>
                  <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  該当ユーザーのプロフィールページから「通報する」ボタンで通報いただけます。
                  また、上記のお問い合わせフォームから「ユーザーの通報」を選択してご連絡いただくことも可能です。
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">マッチング後にメッセージが送れません</span>
                  <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  マッチング成立後、メッセージ機能がご利用いただけます。
                  問題が解決しない場合は、上記フォームより「不具合の報告」としてお問い合わせください。
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-7 h-7 text-pink-400 fill-pink-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                ミアイ
              </span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white">利用規約</Link>
              <Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link>
              <Link href="/contact" className="hover:text-white text-white">お問い合わせ</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 ミアイ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
