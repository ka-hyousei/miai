'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = 'email' | 'verification' | 'password'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // カウントダウンタイマー
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // メールアドレス送信（認証コード送信）
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setStep('verification')
      setCountdown(60) // 60秒間再送信不可
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 認証コード入力処理
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // 数字のみ

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1) // 最後の1文字のみ
    setVerificationCode(newCode)

    // 次の入力欄へ自動フォーカス
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  // バックスペースで前の入力欄に戻る
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  // ペースト処理
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      setVerificationCode(pastedData.split(''))
    }
  }

  // 認証コード検証
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const code = verificationCode.join('')
    if (code.length !== 6) {
      setError('6桁の認証コードを入力してください')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setStep('password')
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 認証コード再送信
  const handleResendCode = async () => {
    if (countdown > 0) return

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setVerificationCode(['', '', '', '', '', ''])
      setCountdown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : '再送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 登録処理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      // 登録成功後、自動ログイン
      const result = await signIn('credentials', {
        email,
        password,
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

          {/* ステップインジケーター */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step === 'email' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-500'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step !== 'email' ? 'bg-pink-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step === 'verification' ? 'bg-pink-500 text-white' : step === 'password' ? 'bg-pink-100 text-pink-500' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${step === 'password' ? 'bg-pink-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step === 'password' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* ステップ1: メールアドレス入力 */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  メールアドレスを入力してください。認証コードをお送りします。
                </p>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                認証コードを送信
              </Button>
            </form>
          )}

          {/* ステップ2: 認証コード入力 */}
          {step === 'verification' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{email}</span> に送信された6桁の認証コードを入力してください。
                </p>

                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { codeInputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0 || isLoading}
                    className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-pink-500 hover:text-pink-600'}`}
                  >
                    {countdown > 0 ? `再送信まで ${countdown}秒` : '認証コードを再送信'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep('email')
                    setVerificationCode(['', '', '', '', '', ''])
                    setError('')
                  }}
                >
                  戻る
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  確認
                </Button>
              </div>
            </form>
          )}

          {/* ステップ3: パスワード設定 */}
          {step === 'password' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  パスワードを設定してください。
                </p>
                <div className="space-y-4">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8文字以上（英字・数字を含む）"
                    required
                  />

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="パスワード（確認）"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="パスワードを再入力"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                登録する
              </Button>
            </form>
          )}

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
