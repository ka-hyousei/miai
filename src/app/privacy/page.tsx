import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-gray-600">
              ミアイ（以下「当サービス」）は、ユーザーの個人情報の保護を重要視しております。
              本プライバシーポリシーは、当サービスがどのような個人情報を収集し、どのように利用・保護するかについて説明いたします。
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 収集する情報</h2>
              <p className="text-gray-600 mb-4">当サービスは、以下の情報を収集いたします。</p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">1.1 ユーザーが提供する情報</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>プロフィール情報（ニックネーム、性別、生年月日、居住地など）</li>
                <li>プロフィール写真</li>
                <li>自己紹介文</li>
                <li>その他、任意で入力いただく情報</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">1.2 自動的に収集される情報</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
                <li>Cookie情報</li>
                <li>デバイス情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 情報の利用目的</h2>
              <p className="text-gray-600 mb-4">収集した情報は、以下の目的で利用いたします。</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>サービスの提供・運営</li>
                <li>ユーザー認証およびアカウント管理</li>
                <li>マッチング機能の提供</li>
                <li>ユーザー間のコミュニケーション機能の提供</li>
                <li>サービスの改善・新機能の開発</li>
                <li>お問い合わせへの対応</li>
                <li>重要なお知らせの送信</li>
                <li>不正利用の防止</li>
                <li>利用規約違反への対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 情報の共有・第三者提供</h2>
              <p className="text-gray-600 mb-4">
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 他のユーザーへの情報公開</h2>
              <p className="text-gray-600 mb-4">
                マッチングサービスの性質上、以下の情報は他のユーザーに公開されます。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>ニックネーム</li>
                <li>プロフィール写真</li>
                <li>年齢（生年月日から算出）</li>
                <li>居住地（都道府県）</li>
                <li>自己紹介文</li>
                <li>その他、プロフィールに設定された公開情報</li>
              </ul>
              <p className="text-gray-600 mt-4">
                ※メールアドレス、パスワード、詳細な生年月日は他のユーザーには公開されません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 情報の保護</h2>
              <p className="text-gray-600 mb-4">
                当サービスは、ユーザーの個人情報を適切に保護するため、以下の対策を講じております。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>SSL/TLS暗号化通信の使用</li>
                <li>パスワードのハッシュ化保存</li>
                <li>アクセス制御の実施</li>
                <li>定期的なセキュリティ監査</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookieの使用</h2>
              <p className="text-gray-600">
                当サービスは、ユーザー体験の向上およびサービスの改善のためにCookieを使用しております。
                Cookieは、ログイン状態の維持やユーザー設定の保存に使用されます。
                ブラウザの設定によりCookieを無効にすることも可能ですが、その場合、サービスの一部機能が正常に動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. ユーザーの権利</h2>
              <p className="text-gray-600 mb-4">ユーザーは、以下の権利を有します。</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>アクセス権：</strong>ご自身の個人情報へのアクセスを求める権利</li>
                <li><strong>訂正権：</strong>不正確な個人情報の訂正を求める権利</li>
                <li><strong>削除権：</strong>個人情報の削除を求める権利</li>
                <li><strong>データポータビリティ権：</strong>個人情報を構造化された形式で受け取る権利</li>
              </ul>
              <p className="text-gray-600 mt-4">
                これらの権利を行使される場合は、お問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 情報の保持期間</h2>
              <p className="text-gray-600">
                ユーザーの個人情報は、アカウントが有効な期間中保持されます。
                アカウントを削除された場合、個人情報は合理的な期間内に削除いたします。
                ただし、法令により保持が義務付けられている情報については、所定の期間保持いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. 未成年者の利用</h2>
              <p className="text-gray-600">
                当サービスは18歳以上の方を対象としております。
                18歳未満の方は当サービスをご利用いただけません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. プライバシーポリシーの変更</h2>
              <p className="text-gray-600">
                当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
                重要な変更がある場合は、サービス内での通知またはメールにてお知らせいたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. お問い合わせ</h2>
              <p className="text-gray-600">
                本プライバシーポリシーに関するお問い合わせは、
                <Link href="/contact" className="text-pink-500 hover:text-pink-600">お問い合わせフォーム</Link>
                よりご連絡ください。
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">制定日：2024年1月1日</p>
              <p className="text-gray-500 text-sm">最終更新日：2024年12月1日</p>
            </div>
          </div>
        </div>
      </main>

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
              <Link href="/privacy" className="hover:text-white text-white">プライバシーポリシー</Link>
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
