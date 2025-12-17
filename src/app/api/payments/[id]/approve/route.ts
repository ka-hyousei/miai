import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 管理者メールアドレス
const ADMIN_EMAILS = ['kahyousei@gmail.com']

// 支払いを承認する共通処理
async function approvePayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })

  if (!payment) {
    return { error: '支払いが見つかりません', status: 404 }
  }

  if (payment.status === 'COMPLETED') {
    return { error: 'この支払いはすでに承認済みです', status: 400, alreadyApproved: true }
  }

  await prisma.$transaction(async (tx) => {
    // 支払いを完了状態に更新（トークンをクリア）
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: `APPROVED_${Date.now()}`,
        approvalToken: null,
      },
    })

    if (payment.plan === 'CARD') {
      // 回数カードの場合: ユーザーのカード残高を3枚追加
      await tx.user.update({
        where: { id: payment.userId },
        data: {
          contactCards: { increment: 3 },
        },
      })
    } else {
      // 月額プランの場合: サブスクリプションを作成または更新
      const now = new Date()
      const endDate = new Date(now)
      endDate.setMonth(endDate.getMonth() + 1) // 1ヶ月後

      await tx.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          plan: payment.plan,
          status: 'ACTIVE',
          startDate: now,
          endDate: endDate,
        },
        create: {
          userId: payment.userId,
          plan: payment.plan,
          status: 'ACTIVE',
          startDate: now,
          endDate: endDate,
        },
      })
    }
  })

  return { success: true, payment }
}

// GET - メールからの承認（トークン認証）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return new NextResponse(renderResultPage('error', '無効なリンクです。トークンが見つかりません。'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // トークンを検証
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!payment) {
      return new NextResponse(renderResultPage('error', '支払いが見つかりません。'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    if (payment.approvalToken !== token) {
      return new NextResponse(renderResultPage('error', '無効なトークンです。このリンクは既に使用されているか、無効です。'), {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const result = await approvePayment(id)

    if (result.error) {
      if (result.alreadyApproved) {
        return new NextResponse(renderResultPage('info', 'この支払いは既に承認済みです。'), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }
      return new NextResponse(renderResultPage('error', result.error), {
        status: result.status || 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new NextResponse(renderResultPage('success', `支払いを承認しました！\n\nユーザー: ${payment.user.email}\nプラン: ${payment.plan}\n金額: ${payment.amount} ${payment.currency}`), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Error approving payment:', error)
    return new NextResponse(renderResultPage('error', '承認処理に失敗しました。'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

// POST - 管理画面からの承認（セッション認証）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    // 管理者チェック
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 })
    }

    const { id } = await params
    const result = await approvePayment(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json({ message: '支払いを承認しました' })
  } catch (error) {
    console.error('Error approving payment:', error)
    return NextResponse.json(
      { error: '承認処理に失敗しました' },
      { status: 500 }
    )
  }
}

// 結果ページのHTML生成
function renderResultPage(type: 'success' | 'error' | 'info', message: string) {
  const colors = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '✓' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '✗' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'ℹ' },
  }
  const c = colors[type]

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>支払い承認 - ミアイ</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #fdf2f8 0%, #fff 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      padding: 40px;
      max-width: 400px;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: ${c.bg};
      border: 3px solid ${c.border};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      color: ${c.text};
    }
    h1 {
      color: ${c.text};
      margin: 0 0 16px;
      font-size: 24px;
    }
    .message {
      color: #4b5563;
      white-space: pre-line;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 32px;
      background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
      color: white;
      text-decoration: none;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
    }
    .footer {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${c.icon}</div>
    <h1>${type === 'success' ? '承認完了' : type === 'error' ? 'エラー' : 'お知らせ'}</h1>
    <p class="message">${message}</p>
    <a href="/" class="btn">ホームページへ戻る</a>
    <div class="footer">ミアイ 管理システム</div>
  </div>
</body>
</html>
  `
}
