'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        setSuccess(true)
      }
    } catch {
      setError(t('requestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tHome('title')}</h1>
              <p className="text-gray-600">{t('emailSent')}</p>
            </div>

            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              <p className="text-sm">
                {t('resetLinkSent')}
              </p>
            </div>

            <p className="text-gray-500 text-sm text-center mb-6">
              {t('checkSpam')}
            </p>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                {t('backToLogin')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tHome('title')}</h1>
            <p className="text-gray-600">{t('forgotPasswordTitle')}</p>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            {t('forgotPasswordDesc')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {t('sendResetLink')}
            </Button>
          </form>

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
