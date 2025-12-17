import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 管理者メールアドレス
const ADMIN_EMAILS = ['kahyousei@gmail.com']

// POST - 支払いを承認（管理者のみ）
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

    const payment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return NextResponse.json({ error: '支払いが見つかりません' }, { status: 404 })
    }

    // トランザクションで支払いとサブスクリプションを更新
    const now = new Date()
    const endDate = new Date(now)
    endDate.setMonth(endDate.getMonth() + 1) // 1ヶ月後

    await prisma.$transaction(async (tx) => {
      // 支払いを完了状態に更新
      await tx.payment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          transactionId: `MANUAL_${Date.now()}`,
        },
      })

      // サブスクリプションを作成または更新
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
    })

    return NextResponse.json({ message: '支払いを承認しました' })
  } catch (error) {
    console.error('Error approving payment:', error)
    return NextResponse.json(
      { error: '承認処理に失敗しました' },
      { status: 500 }
    )
  }
}
