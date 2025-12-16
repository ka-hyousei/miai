import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mail'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // ユーザーが存在するか確認（セキュリティのため、存在しない場合も同じメッセージを返す）
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // 既存のトークンを削除
      await prisma.passwordResetToken.deleteMany({
        where: { email },
      })

      // 新しいトークンを生成
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1時間後

      // トークンを保存
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires,
        },
      })

      // メール送信
      await sendPasswordResetEmail(email, token)
    }

    // セキュリティのため、ユーザーが存在しなくても同じレスポンスを返す
    return NextResponse.json({
      message: 'パスワードリセット用のメールを送信しました。メールをご確認ください。',
    })
  } catch (error) {
    console.error('パスワードリセットリクエストエラー:', error)
    return NextResponse.json(
      { error: 'パスワードリセットに失敗しました。しばらくしてから再度お試しください。' },
      { status: 500 }
    )
  }
}
