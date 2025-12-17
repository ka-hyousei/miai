import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createPaymentSchema = z.object({
  plan: z.enum(['PREMIUM', 'VIP']),
  paymentMethod: z.enum(['WECHAT', 'PAYPAY']),
})

// POST - 支払いを作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // 金額を決定
    let amount: number
    let currency: string

    if (validatedData.paymentMethod === 'WECHAT') {
      amount = 50 // 50元
      currency = 'CNY'
    } else {
      amount = 980 // 980円
      currency = 'JPY'
    }

    // 支払いレコードを作成
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        currency,
        paymentMethod: validatedData.paymentMethod,
        plan: validatedData.plan,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: '支払いの作成に失敗しました' },
      { status: 500 }
    )
  }
}

// GET - 支払い履歴を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: '支払い履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}
