'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('auth')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          <p>{t('invalidLink')}</p>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full">{t('requestPasswordReset')}</Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 8) {
      setError(t('password8chars'))
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
        router.push('/login?message=password-reset-success')
      }
    } catch {
      setError(t('requestFailed'))
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
        label={t('newPassword')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('passwordPlaceholder')}
        required
      />

      <Input
        id="confirmPassword"
        type="password"
        label={t('confirmPassword')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('enterAgain')}
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        {t('resetButton')}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
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
            <p className="text-gray-600">{t('newPasswordTitle')}</p>
          </div>

          <Suspense fallback={<div className="text-center py-4">{tCommon('loading')}</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
