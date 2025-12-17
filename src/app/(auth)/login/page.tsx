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
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
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
        <Link href="/forgot-password" className="text-sm text-pink-500 hover:text-pink-600">
          {t('forgotPassword')}
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tHome('title')}</h1>
            <p className="text-gray-600">{t('loginTitle')}</p>
          </div>

          <Suspense fallback={<div className="text-center py-4">{tCommon('loading')}</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-pink-500 hover:text-pink-600 font-medium">
                {tCommon('register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
