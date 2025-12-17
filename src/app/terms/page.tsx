'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from "next/link";
import { useTranslations } from 'next-intl'
import { Heart, Sparkles, Trash2 } from "lucide-react";
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export default function TermsPage() {
  const { data: session } = useSession()
  const t = useTranslations('terms')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')
  const tFooter = useTranslations('footer')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      })
      if (response.ok) {
        alert(t('deleteSuccess'))
        await signOut({ callbackUrl: '/' })
      } else {
        const data = await response.json()
        alert(`${t('deleteFailed')}: ${data.details || data.error || ''}`)
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert(`${t('deleteFailed')}: ${error instanceof Error ? error.message : ''}`)
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
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

          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-yellow-600">◈</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{t('title')}</h1>
            <span className="text-yellow-600">◈</span>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-gray-600">
              {t('intro')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article1Title')}</h2>
              <p className="text-gray-600">
                {t('article1Content')}
              </p>
            </section>

            <section className="bg-red-50 border-2 border-red-200 rounded-xl p-6 relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article2Title')}</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong className="text-red-600">{t('article2Item1')}</strong></li>
                <li>{t('article2Item2')}</li>
                <li>{t('article2Item3')}</li>
                <li>{t('article2Item4')}</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article3Title')}</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>{t('article3Item1')}</li>
                <li>{t('article3Item2')}
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>{t('article3Sub1')}</li>
                    <li>{t('article3Sub2')}</li>
                    <li>{t('article3Sub3')}</li>
                    <li>{t('article3Sub4')}</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article4Title')}</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>{t('article4Item1')}</li>
                <li>{t('article4Item2')}</li>
                <li>{t('article4Item3')}</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article5Title')}</h2>
              <p className="text-gray-600 mb-4">{t('article5Intro')}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('article5Item1')}</li>
                <li>{t('article5Item2')}</li>
                <li>{t('article5Item3')}</li>
                <li>{t('article5Item4')}</li>
                <li>{t('article5Item5')}</li>
                <li>{t('article5Item6')}</li>
                <li>{t('article5Item7')}</li>
                <li>{t('article5Item8')}</li>
                <li>{t('article5Item9')}</li>
                <li>{t('article5Item10')}</li>
                <li>{t('article5Item11')}</li>
                <li>{t('article5Item12')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article6Title')}</h2>
              <p className="text-gray-600 mb-4">
                {t('article6Intro')}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('article6Item1')}</li>
                <li>{t('article6Item2')}</li>
                <li>{t('article6Item3')}</li>
                <li>{t('article6Item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article7Title')}</h2>
              <p className="text-gray-600">
                {t('article7Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article8Title')}</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>{t('article8Item1')}</li>
                <li>{t('article8Item2')}</li>
                <li>{t('article8Item3')}</li>
                <li className="text-red-600 font-medium">{t('article8Item4')}</li>
              </ol>
            </section>

            <section className="bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500 rounded-br-lg" />
              <h2 className="text-xl font-semibold text-yellow-700 mb-4">{t('moneyWarningTitle')}</h2>
              <p className="text-gray-700 mb-4">
                {t('moneyWarningIntro')}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t('moneyWarningItem1')}</li>
                <li>{t('moneyWarningItem2')}</li>
                <li>{t('moneyWarningItem3')}</li>
                <li>{t('moneyWarningItem4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article9Title')}</h2>
              <p className="text-gray-600">
                {t('article9Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article10Title')}</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>{t('article10Item1')}</li>
                <li>{t('article10Item2')}</li>
                <li>{t('article10Item3')}</li>
                <li>{t('article10Item4')}</li>
              </ol>
              {session && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
                  <p className="text-red-700 font-medium mb-3">{t('withdrawNotice')}</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('withdrawButton')}
                  </button>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article11Title')}</h2>
              <p className="text-gray-600">
                {t('article11Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('article12Title')}</h2>
              <p className="text-gray-600">
                {t('article12Content')}
              </p>
            </section>

            <div className="mt-12 pt-8 border-t-2 border-red-100">
              <p className="text-gray-500 text-sm">{t('enactedDate')}</p>
              <p className="text-gray-500 text-sm">{t('updatedDate')}</p>
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
              <Link href="/terms" className="hover:text-white text-white">{tFooter('terms')}</Link>
              <Link href="/privacy" className="hover:text-white">{tFooter('privacy')}</Link>
              <Link href="/contact" className="hover:text-white">{tFooter('contact')}</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>{tHome('copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-red-50/50 rounded-2xl max-w-md w-full p-6 shadow-xl border-2 border-red-200 relative">
            {/* 装飾性角 */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-xl" />

            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('deleteConfirmTitle')}</h3>
            <p className="text-gray-600 mb-4">
              {t('deleteConfirmMessage')}
            </p>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
              <p className="text-red-700 text-sm font-medium mb-2">{t('deleteWarning')}</p>
              <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                <li>{t('deleteItem1')}</li>
                <li>{t('deleteItem2')}</li>
                <li>{t('deleteItem3')}</li>
                <li>{t('deleteItem4')}</li>
                <li>{t('deleteItem5')}</li>
                <li>{t('deleteItem6')}</li>
              </ul>
              <p className="text-red-700 text-sm font-bold mt-3">{t('deleteIrreversible')}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteModal(false)}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={handleDeleteAccount}
                isLoading={isLoading}
              >
                {t('deleteButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
