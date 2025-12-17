'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

type Step = 'email' | 'verification' | 'password'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')
  const tFooter = useTranslations('footer')

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

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
      setCountdown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sendFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1)
    setVerificationCode(newCode)

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      setVerificationCode(pastedData.split(''))
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const code = verificationCode.join('')
    if (code.length !== 6) {
      setError(t('enterCode'))
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
      setError(err instanceof Error ? err.message : t('verifyFailed'))
    } finally {
      setIsLoading(false)
    }
  }

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
      setError(err instanceof Error ? err.message : t('resendFailed'))
    } finally {
      setIsLoading(false)
    }
  }

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

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/profile/setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registerError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-red-200/30 text-6xl">囍</div>
        <div className="absolute bottom-20 right-10 text-red-200/30 text-6xl">囍</div>
        <div className="absolute top-1/4 right-1/4 text-yellow-300/20 text-4xl">✿</div>
        <div className="absolute bottom-1/3 left-1/4 text-yellow-300/20 text-4xl">✿</div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-b from-white to-red-50/30 rounded-2xl shadow-xl p-8 border-2 border-red-200 relative overflow-hidden">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-400 rounded-br-xl" />

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-yellow-500 text-2xl">🏮</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">{tHome('title')}</h1>
              <span className="text-yellow-500 text-2xl">🏮</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-yellow-600">◈</span>
              <p className="text-gray-600">{t('registerTitle')}</p>
              <span className="text-yellow-600">◈</span>
            </div>
          </div>

          {/* Step Indicator - 中国风 */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step === 'email' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-red-100 text-red-500'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step !== 'email' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step === 'verification' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : step === 'password' ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${step === 'password' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step === 'password' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 border border-red-200">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {t('enterEmail')}
                </p>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label={t('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                size="lg"
                isLoading={isLoading}
              >
                {t('sendCode')}
              </Button>
            </form>
          )}

          {/* Step 2: Verification */}
          {step === 'verification' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{email}</span> {t('codeSentTo')}
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
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors bg-white"
                    />
                  ))}
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0 || isLoading}
                    className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-red-500 hover:text-red-600'}`}
                  >
                    {countdown > 0 ? t('resendIn').replace('{seconds}', String(countdown)) : t('resendCode')}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setStep('email')
                    setVerificationCode(['', '', '', '', '', ''])
                    setError('')
                  }}
                >
                  {tCommon('back')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  isLoading={isLoading}
                >
                  {t('verify')}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {t('setPassword')}
                </p>
                <div className="space-y-4">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                  />

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label={t('confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPasswordPlaceholder')}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                size="lg"
                isLoading={isLoading}
              >
                {t('registerButton')}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-red-500 hover:text-red-600 font-medium">
                {tCommon('login')}
              </Link>
            </p>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            {t('agreeTerms')
              .replace('{terms}', '')
              .replace('{privacy}', '')
              .split('').filter(c => c !== '').length > 0 && (
              <>
                {t('agreeTerms').split('{terms}')[0]}
                <Link href="/terms" className="text-red-500 hover:underline">{tFooter('terms')}</Link>
                {t('agreeTerms').split('{terms}')[1]?.split('{privacy}')[0]}
                <Link href="/privacy" className="text-red-500 hover:underline">{tFooter('privacy')}</Link>
                {t('agreeTerms').split('{privacy}')[1]}
              </>
            )}
          </div>

          {/* 底部装饰 */}
          <div className="mt-6 text-center text-red-300 text-xs">
            <span>— 囍 缘定今生 囍 —</span>
          </div>
        </div>
      </div>
    </div>
  )
}
