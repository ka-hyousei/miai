import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'

// POST - 支払い完了をマーク（承認待ち状態にする）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!payment) {
      return NextResponse.json({ error: '支払いが見つかりません' }, { status: 404 })
    }

    // 自分の支払いのみ操作可能
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 })
    }

    // すでに完了している場合
    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ error: 'この支払いはすでに完了しています' }, { status: 400 })
    }

    // ステータスを承認待ちに更新
    await prisma.payment.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
    })

    // 管理者に通知メールを送信
    const adminEmail = process.env.ADMIN_EMAIL || 'kahyousei@gmail.com'
    await sendEmail({
      to: adminEmail,
      subject: '【ミアイ】支払い確認リクエスト',
      html: `
        <h2>支払い確認リクエスト</h2>
        <p>以下のユーザーから支払い完了の報告がありました。</p>
        <ul>
          <li>ユーザーID: ${payment.userId}</li>
          <li>メールアドレス: ${payment.user.email}</li>
          <li>支払い方法: ${payment.paymentMethod}</li>
          <li>金額: ${payment.amount} ${payment.currency}</li>
          <li>プラン: ${payment.plan}</li>
          <li>支払いID: ${payment.id}</li>
        </ul>
        <p>支払いを確認後、管理画面から承認してください。</p>
      `,
    })

    return NextResponse.json({ message: '支払い完了リクエストを送信しました' })
  } catch (error) {
    console.error('Error marking payment complete:', error)
    return NextResponse.json(
      { error: '処理に失敗しました' },
      { status: 500 }
    )
  }
}
