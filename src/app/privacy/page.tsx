'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, Sparkles, ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from '@/components/ui/language-switcher'

export default function PrivacyPage() {
  const router = useRouter()
  const t = useTranslations('privacy')
  const tHome = useTranslations('home')
  const tCommon = useTranslations('common')
  const tFooter = useTranslations('footer')

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
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section1Title')}</h2>
              <p className="text-gray-600 mb-4">{t('section1Intro')}</p>

              <h3 className="text-lg font-medium text-red-600 mb-2">{t('section1aTitle')}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>{t('section1aItem1')}</li>
                <li>{t('section1aItem2')}</li>
                <li>{t('section1aItem3')}</li>
                <li>{t('section1aItem4')}</li>
                <li>{t('section1aItem5')}</li>
                <li>{t('section1aItem6')}</li>
              </ul>

              <h3 className="text-lg font-medium text-red-600 mb-2">{t('section1bTitle')}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('section1bItem1')}</li>
                <li>{t('section1bItem2')}</li>
                <li>{t('section1bItem3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section2Title')}</h2>
              <p className="text-gray-600 mb-4">{t('section2Intro')}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('section2Item1')}</li>
                <li>{t('section2Item2')}</li>
                <li>{t('section2Item3')}</li>
                <li>{t('section2Item4')}</li>
                <li>{t('section2Item5')}</li>
                <li>{t('section2Item6')}</li>
                <li>{t('section2Item7')}</li>
                <li>{t('section2Item8')}</li>
                <li>{t('section2Item9')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section3Title')}</h2>
              <p className="text-gray-600 mb-4">
                {t('section3Intro')}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('section3Item1')}</li>
                <li>{t('section3Item2')}</li>
                <li>{t('section3Item3')}</li>
                <li>{t('section3Item4')}</li>
                <li>{t('section3Item5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section4Title')}</h2>
              <p className="text-gray-600 mb-4">
                {t('section4Intro')}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('section4Item1')}</li>
                <li>{t('section4Item2')}</li>
                <li>{t('section4Item3')}</li>
                <li>{t('section4Item4')}</li>
                <li>{t('section4Item5')}</li>
                <li>{t('section4Item6')}</li>
              </ul>
              <p className="text-gray-600 mt-4">
                {t('section4Note')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section5Title')}</h2>
              <p className="text-gray-600 mb-4">
                {t('section5Intro')}
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('section5Item1')}</li>
                <li>{t('section5Item2')}</li>
                <li>{t('section5Item3')}</li>
                <li>{t('section5Item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section6Title')}</h2>
              <p className="text-gray-600">
                {t('section6Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section7Title')}</h2>
              <p className="text-gray-600 mb-4">{t('section7Intro')}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong className="text-red-600">{t('section7Item1Label')}</strong>{t('section7Item1')}</li>
                <li><strong className="text-red-600">{t('section7Item2Label')}</strong>{t('section7Item2')}</li>
                <li><strong className="text-red-600">{t('section7Item3Label')}</strong>{t('section7Item3')}</li>
                <li><strong className="text-red-600">{t('section7Item4Label')}</strong>{t('section7Item4')}</li>
              </ul>
              <p className="text-gray-600 mt-4">
                {t('section7Note')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section8Title')}</h2>
              <p className="text-gray-600">
                {t('section8Content')}
              </p>
            </section>

            <section className="bg-red-50 border-2 border-red-200 rounded-xl p-6 relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section9Title')}</h2>
              <p className="text-gray-700">
                {t('section9Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section10Title')}</h2>
              <p className="text-gray-600">
                {t('section10Content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-red-700 mb-4">{t('section11Title')}</h2>
              <p className="text-gray-600">
                {t('section11Content')}
                <Link href="/contact" className="text-red-500 hover:text-red-600">{t('section11Link')}</Link>
                {t('section11Suffix')}
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

      {/* Footer - 中国风 */}
      <footer className="relative z-10 bg-gradient-to-r from-red-50 to-orange-50 border-t-2 border-red-100 py-8">
        {/* 装飾性边框 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-30" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="relative">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-80" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                {tHome('title')}
              </span>
              <span className="text-yellow-600 text-lg">囍</span>
            </div>
            <div className="flex gap-6 text-gray-600">
              <Link href="/terms" className="hover:text-red-500 transition-colors">{tFooter('terms')}</Link>
              <Link href="/privacy" className="hover:text-red-500 transition-colors">{tFooter('privacy')}</Link>
              <Link href="/contact" className="hover:text-red-500 transition-colors">{tFooter('contact')}</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-red-100 text-center text-gray-500 text-sm">
            <p>{tHome('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
