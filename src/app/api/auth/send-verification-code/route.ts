import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/mail'

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

// 6桁のランダムな認証コードを生成
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // 既存の未検証コードを削除
    await prisma.emailVerificationCode.deleteMany({
      where: {
        email,
        verified: false,
      },
    })

    // 新しい認証コードを生成
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10分後に期限切れ

    // データベースに保存
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expires,
      },
    })

    // メール送信
    const result = await sendVerificationCodeEmail(email, code)

    if (!result.success) {
      return NextResponse.json(
        { error: '認証コードの送信に失敗しました。もう一度お試しください' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '認証コードを送信しました' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: '認証コードの送信に失敗しました' },
      { status: 500 }
    )
  }
}
