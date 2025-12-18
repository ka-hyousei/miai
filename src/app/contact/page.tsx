'use client'

import { useState } from 'react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, Sparkles, Send, Mail, MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export default function ContactPage() {
  const router = useRouter()
  const t = useTranslations('contact')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')
  const tFooter = useTranslations('footer')
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* 背景装飾 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-red-200/20 text-6xl">囍</div>
        <div className="absolute bottom-20 right-10 text-red-200/20 text-6xl">囍</div>
        <div className="absolute top-1/4 right-1/4 text-yellow-300/15 text-4xl">✿</div>
        <div className="absolute bottom-1/3 left-1/4 text-yellow-300/15 text-4xl">✿</div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b-2 border-red-100 sticky top-0 z-20">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-red-50 rounded-full border border-red-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-red-600" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Heart className="w-8 h-8 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                {tHome('title')}
              </span>
              <span className="text-xl text-yellow-500 font-bold">囍</span>
            </Link>
          </div>
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-4 py-2 text-red-500 hover:text-red-600 font-medium"
            >
              {tCommon('login')}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 font-medium"
            >
              {tCommon('register')}
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="bg-gradient-to-b from-white to-red-50/30 rounded-2xl shadow-xl p-8 md:p-12 border-2 border-red-200 relative overflow-hidden">
          {/* 装飾性角 */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-400 rounded-br-xl" />

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-yellow-600">◈</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{t('title')}</h1>
              <span className="text-yellow-600">◈</span>
            </div>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
                <Send className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('successTitle')}
              </h2>
              <p className="text-gray-600 mb-8">
                {t('successMessage')}
              </p>
              <Link href="/">
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  {t('backToHome')}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitStatus === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border-2 border-red-200 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
                  {t('errorMessage')}
                </div>
              )}

              <Input
                id="name"
                type="text"
                label={t('name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
                required
              />

              <Input
                id="email"
                type="email"
                label={t('email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
                required
              />

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  {t('category')}
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors bg-white"
                  required
                >
                  <option value="">{t('categoryPlaceholder')}</option>
                  <option value="general">{t('categoryGeneral')}</option>
                  <option value="account">{t('categoryAccount')}</option>
                  <option value="bug">{t('categoryBug')}</option>
                  <option value="feature">{t('categoryFeature')}</option>
                  <option value="report">{t('categoryReport')}</option>
                  <option value="payment">{t('categoryPayment')}</option>
                  <option value="withdrawal">{t('categoryWithdrawal')}</option>
                  <option value="other">{t('categoryOther')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('message')}
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('messagePlaceholder')}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none bg-white"
                  required
                />
              </div>

              <div className="bg-gradient-to-b from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200 relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />
                <p className="text-sm text-gray-600">
                  <strong className="text-yellow-700">{t('noticeLabel')}</strong>{t('notice')}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                size="lg"
                isLoading={isSubmitting}
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('submitButton')}
              </Button>
            </form>
          )}

          {/* FAQ Section */}
          <div className="mt-12 pt-8 border-t-2 border-red-100">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-yellow-600">✿</span>
              <h2 className="text-xl font-semibold text-red-700">{t('faqTitle')}</h2>
              <span className="text-yellow-600">✿</span>
            </div>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:from-red-100 hover:to-orange-100 transition-colors border border-red-100">
                  <span className="font-medium text-gray-900">{t('faq1Question')}</span>
                  <span className="text-red-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  <Link href="/forgot-password" className="text-red-500 hover:text-red-600">
                    {t('faq1Link')}
                  </Link>
                  {t('faq1Answer')}
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:from-red-100 hover:to-orange-100 transition-colors border border-red-100">
                  <span className="font-medium text-gray-900">{t('faq2Question')}</span>
                  <span className="text-red-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  {t('faq2Answer')}
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:from-red-100 hover:to-orange-100 transition-colors border border-red-100">
                  <span className="font-medium text-gray-900">{t('faq3Question')}</span>
                  <span className="text-red-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  {t('faq3Answer')}
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:from-red-100 hover:to-orange-100 transition-colors border border-red-100">
                  <span className="font-medium text-gray-900">{t('faq4Question')}</span>
                  <span className="text-red-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-600">
                  {t('faq4Answer')}
                </div>
              </details>
            </div>
          </div>

          {/* 底部装飾 */}
          <div className="mt-8 text-center text-red-300 text-xs">
            <span>— 囍 缘定今生 囍 —</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-7 h-7 text-red-400 fill-red-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {tHome('title')}
              </span>
              <span className="text-yellow-500">囍</span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white">{tFooter('terms')}</Link>
              <Link href="/privacy" className="hover:text-white">{tFooter('privacy')}</Link>
              <Link href="/contact" className="hover:text-white text-white">{tFooter('contact')}</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>{tHome('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
