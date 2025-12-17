import Link from "next/link";
import { Heart } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeFeatures } from '@/components/home/HomeFeatures';

// 桃花花瓣装饰组件
function PeachBlossom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50 10 C60 25, 75 30, 85 50 C75 55, 65 70, 50 90 C35 70, 25 55, 15 50 C25 30, 40 25, 50 10" />
    </svg>
  );
}

// 中国结装饰
function ChineseKnot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="50" cy="50" r="20" />
      <circle cx="50" cy="50" r="30" />
      <path d="M50 20 L50 0 M50 80 L50 100 M20 50 L0 50 M80 50 L100 50" />
      <path d="M35 35 L15 15 M65 35 L85 15 M35 65 L15 85 M65 65 L85 85" />
    </svg>
  );
}

export default async function Home() {
  const t = await getTranslations('home');
  const tFooter = await getTranslations('footer');

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-pink-50 to-orange-50 flex flex-col relative overflow-hidden">
      {/* 背景装饰 - 浮动的桃花 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PeachBlossom className="absolute top-20 left-10 w-8 h-8 text-pink-300/40 animate-pulse" />
        <PeachBlossom className="absolute top-40 right-20 w-6 h-6 text-rose-300/30 animate-pulse delay-100" />
        <PeachBlossom className="absolute top-60 left-1/4 w-10 h-10 text-pink-200/40 animate-pulse delay-200" />
        <PeachBlossom className="absolute bottom-40 right-1/3 w-7 h-7 text-red-200/30 animate-pulse delay-300" />
        <PeachBlossom className="absolute bottom-20 left-20 w-5 h-5 text-pink-300/40 animate-pulse delay-400" />
        <PeachBlossom className="absolute top-1/3 right-10 w-9 h-9 text-rose-200/30 animate-pulse delay-500" />

        {/* 装饰性的圆形 */}
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <header className="relative z-10">
        <HomeHeader />
        <HomeHero />
      </header>

      {/* Features and CTA - only shown to non-logged-in users */}
      <div className="relative z-10">
        <HomeFeatures />
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-grow" />

      {/* Footer - 中国风 */}
      <footer className="relative z-10 bg-gradient-to-r from-red-50 to-orange-50 border-t-2 border-red-100 py-8">
        {/* 装饰性边框 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-30" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="relative">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-80" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                {t('title')}
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
            <p>{t('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
