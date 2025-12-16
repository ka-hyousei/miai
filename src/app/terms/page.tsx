import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-gray-600">
              この利用規約（以下「本規約」）は、ミアイ（以下「当サービス」）の利用条件を定めるものです。
              ユーザーの皆様には、本規約に同意いただいた上で、当サービスをご利用いただきます。
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="text-gray-600">
                本規約は、ユーザーと当サービス運営者との間の当サービスの利用に関わる一切の関係に適用されるものとします。
              </p>
            </section>

            <section className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-700 mb-4">第2条（年齢制限）【重要】</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong className="text-red-600">当サービスは、18歳以上の方のみご利用いただけます。</strong></li>
                <li>18歳未満の方は、当サービスへの登録および利用を固くお断りいたします。</li>
                <li>利用登録時に18歳以上であることを確認させていただきます。虚偽の年齢を申告した場合、発覚次第アカウントを削除し、以後の利用をお断りいたします。</li>
                <li>当サービスは、出会い系サイト規制法（インターネット異性紹介事業を利用して児童を誘引する行為の規制等に関する法律）を遵守し、18歳未満の方の利用を防止するための措置を講じております。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（利用登録）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>登録希望者が本規約に同意の上、当サービス所定の方法によって利用登録を申請し、当サービスがこれを承認することによって、利用登録が完了するものとします。</li>
                <li>当サービスは、以下の場合には利用登録の申請を承認しないことがあります。
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>虚偽の事項を届け出た場合</li>
                    <li>本規約に違反したことがある者からの申請である場合</li>
                    <li>18歳未満の方からの申請である場合</li>
                    <li>その他、当サービスが利用登録を相当でないと判断した場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（ユーザーIDおよびパスワードの管理）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>ユーザーは、自己の責任において、当サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li>
                <li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
                <li>ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（禁止事項）</h2>
              <p className="text-gray-600 mb-4">ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>他のユーザーに対する嫌がらせ、誹謗中傷、脅迫行為</li>
                <li>虚偽のプロフィール情報の登録</li>
                <li>他のユーザーの個人情報を不正に収集する行為</li>
                <li>当サービスの運営を妨害する行為</li>
                <li>不正アクセス、またはこれを試みる行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>当サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>商業目的での利用、勧誘行為</li>
                <li>わいせつな情報または暴力的なコンテンツの投稿</li>
                <li>その他、当サービスが不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（本サービスの提供の停止等）</h2>
              <p className="text-gray-600 mb-4">
                当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当サービスが本サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（利用制限および登録抹消）</h2>
              <p className="text-gray-600">
                当サービスは、ユーザーが本規約のいずれかの条項に違反した場合、事前の通知なく、当該ユーザーに対して本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（免責事項）</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>当サービスは、本サービスに関して、ユーザー間またはユーザーと第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
                <li>当サービスは、本サービスを通じて出会った相手との交際、結婚等について一切の責任を負いません。</li>
                <li>ユーザーは、自己の責任において他のユーザーとの交流を行うものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（サービス内容の変更等）</h2>
              <p className="text-gray-600">
                当サービスは、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（利用規約の変更）</h2>
              <p className="text-gray-600">
                当サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（準拠法・裁判管轄）</h2>
              <p className="text-gray-600">
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、当サービス運営者の本店所在地を管轄する裁判所を専属的合意管轄とします。
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
              <Link href="/terms" className="hover:text-white text-white">利用規約</Link>
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
