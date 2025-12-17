import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomBytes } from 'crypto'
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

    // 承認用トークンを生成
    const approvalToken = randomBytes(32).toString('hex')

    // ステータスを承認待ちに更新し、トークンを保存
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        approvalToken: approvalToken,
      },
    })

    // 承認用URLを生成
    const baseUrl = process.env.NEXTAUTH_URL || 'https://miai.vercel.app'
    const approveUrl = `${baseUrl}/api/payments/${id}/approve?token=${approvalToken}`

    // 管理者に通知メールを送信（承認ボタン付き）
    const adminEmail = process.env.ADMIN_EMAIL || 'kahyousei@gmail.com'
    await sendEmail({
      to: adminEmail,
      subject: '【ミアイ】支払い確認リクエスト',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">支払い確認リクエスト</h2>
          <p>以下のユーザーから支払い完了の報告がありました。</p>

          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">ユーザーID:</td><td style="padding: 8px 0;">${payment.userId}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">メールアドレス:</td><td style="padding: 8px 0;">${payment.user.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">支払い方法:</td><td style="padding: 8px 0;">${payment.paymentMethod === 'WECHAT' ? 'WeChat Pay (微信支付)' : 'PayPay'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">金額:</td><td style="padding: 8px 0; font-weight: bold;">${payment.amount} ${payment.currency}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">プラン:</td><td style="padding: 8px 0;">${payment.plan}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">支払いID:</td><td style="padding: 8px 0; font-size: 12px;">${payment.id}</td></tr>
            </table>
          </div>

          <p>支払いを確認した場合、下のボタンをクリックして承認してください：</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${approveUrl}"
               style="display: inline-block; background: linear-gradient(to right, #ec4899, #f43f5e); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              ✓ 支払いを承認する
            </a>
          </div>

          <p style="color: #666; font-size: 12px;">
            ※ このリンクは1回のみ有効です。<br>
            ※ リンクをクリックすると、ユーザーのプレミアム会員が即座に有効になります。
          </p>
        </div>
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
