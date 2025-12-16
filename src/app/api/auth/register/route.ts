import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[A-Za-z]/, 'パスワードには英字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // メールアドレスが認証済みか確認
    const verifiedCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email: validatedData.email,
        verified: true,
      },
    })

    if (!verifiedCode) {
      return NextResponse.json(
        { error: 'メールアドレスが認証されていません' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // ユーザー作成と認証コード削除をトランザクションで実行
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          emailVerified: new Date(), // メール認証済み
        },
      })

      // 使用済みの認証コードを削除
      await tx.emailVerificationCode.deleteMany({
        where: { email: validatedData.email },
      })

      return newUser
    })

    return NextResponse.json(
      { message: '登録が完了しました', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '登録に失敗しました。もう一度お試しください' },
      { status: 500 }
    )
  }
}
