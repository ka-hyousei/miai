import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  code: z.string().length(6, '認証コードは6桁で入力してください'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = schema.parse(body)

    // 認証コードを検索
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        verified: false,
      },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: '認証コードが正しくありません' },
        { status: 400 }
      )
    }

    // 有効期限チェック
    if (verificationCode.expires < new Date()) {
      // 期限切れのコードを削除
      await prisma.emailVerificationCode.delete({
        where: { id: verificationCode.id },
      })

      return NextResponse.json(
        { error: '認証コードの有効期限が切れています。再送信してください' },
        { status: 400 }
      )
    }

    // 認証成功 - verifiedをtrueに更新
    await prisma.emailVerificationCode.update({
      where: { id: verificationCode.id },
      data: { verified: true },
    })

    return NextResponse.json(
      { message: 'メールアドレスが確認されました', verified: true },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: '認証に失敗しました' },
      { status: 500 }
    )
  }
}
