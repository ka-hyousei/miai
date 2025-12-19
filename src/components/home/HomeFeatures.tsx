'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Heart, Users, MessageCircle, Navigation } from 'lucide-react'

export function HomeFeatures() {
  const { data: session, status } = useSession()
  const t = useTranslations('home')

  if (status === 'loading') {
    return null
  }

  if (session) {
    return null
  }

  return (
    <>
      {/* Features Section - 中国风 */}
      <section className="py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          {/* 标题 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-red-300" />
              <span className="text-red-400">◈</span>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-red-300" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {t('featuresTitle')}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gradient-to-b from-red-50/50 to-transparent rounded-2xl border border-red-100/50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {t('feature1Title')}
              </h4>
              <p className="text-gray-600">
                {t('feature1Desc')}
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-red-50/50 to-transparent rounded-2xl border border-red-100/50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {t('feature2Title')}
              </h4>
              <p className="text-gray-600">
                {t('feature2Desc')}
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-red-50/50 to-transparent rounded-2xl border border-red-100/50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
                <MessageCircle className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {t('feature3Title')}
              </h4>
              <p className="text-gray-600">
                {t('feature3Desc')}
              </p>
            </div>
            <Link href="/nearby" className="text-center p-6 bg-gradient-to-b from-red-50/50 to-transparent rounded-2xl border border-red-100/50 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
                <Navigation className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {t('feature4Title')}
              </h4>
              <p className="text-gray-600">
                {t('feature4Desc')}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - 中国风 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* 装饰框 */}
          <div className="relative inline-block p-8 mb-6">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-500/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-500/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-500/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-500/50" />

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('ctaTitle')}
            </h3>
          </div>

          <p className="text-xl text-gray-600 mb-8">
            {t('ctaDesc')}
          </p>

          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg font-bold rounded-full hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              🌸 {t('startButton')} 🌸
            </span>
          </Link>
        </div>
      </section>
    </>
  )
}
