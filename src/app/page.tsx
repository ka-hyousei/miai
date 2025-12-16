import Link from "next/link";
import { Heart, Users, Shield, MessageCircle, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Hero Section */}
      <header className="relative">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
              ミアイ
            </span>
          </Link>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-pink-500 hover:text-pink-600 font-medium"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium"
            >
              新規登録
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            日本で出会う、<br className="md:hidden" />新しいご縁
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            国籍を超えた真剣な出会いを。日本の方も海外の方も大歓迎。
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-pink-500 text-white text-lg font-medium rounded-full hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ミアイの特徴
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                在日華人専用
              </h4>
              <p className="text-gray-600">
                同じ文化背景を持つ人との出会いを大切にしています
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                真剣な出会い
              </h4>
              <p className="text-gray-600">
                将来を見据えた真剣なパートナー探しをサポート
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-pink-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                安心・安全
              </h4>
              <p className="text-gray-600">
                本人確認と24時間監視で安全な環境を提供
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-pink-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                丁寧なマッチング
              </h4>
              <p className="text-gray-600">
                お互いの「いいね」でマッチング後にメッセージ開始
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            あなたの運命の人が待っているかも
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            今すぐ無料登録して、新しい出会いを見つけましょう
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-pink-500 text-white text-lg font-medium rounded-full hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-7 h-7 text-pink-400 fill-pink-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                ミアイ
              </span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white">利用規約</Link>
              <Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link>
              <Link href="/contact" className="hover:text-white">お問い合わせ</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 ミアイ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
