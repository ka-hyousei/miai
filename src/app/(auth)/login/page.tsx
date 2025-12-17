'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/discover'
  const message = searchParams.get('message')
  const t = useTranslations('auth')
  const tHome = useTranslations('home')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const successMessage = message === 'password-reset-success'
    ? t('passwordResetSuccess')
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('loginError'))
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError(t('loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label={t('email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@email.com"
        required
      />

      <Input
        id="password"
        type="password"
        label={t('password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-red-500 hover:text-red-600">
          {t('forgotPassword')}
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        size="lg"
        isLoading={isLoading}
      >
        {t('loginButton')}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const t = useTranslations('auth')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')

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
              <p className="text-gray-600">{t('loginTitle')}</p>
              <span className="text-yellow-600">◈</span>
            </div>
          </div>

          <Suspense fallback={<div className="text-center py-4">{tCommon('loading')}</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-red-500 hover:text-red-600 font-medium">
                {tCommon('register')}
              </Link>
            </p>
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
