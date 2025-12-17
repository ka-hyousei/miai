import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userEmail = session.user.email || ''

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // メールに紐づくデータを削除（ユーザーIDとは別）
    // テーブルが存在しない場合はエラーを無視
    try {
      await prisma.passwordResetToken.deleteMany({
        where: { email: userEmail },
      })
    } catch {
      // テーブルが存在しない場合は無視
    }

    try {
      await prisma.emailVerificationCode.deleteMany({
        where: { email: userEmail },
      })
    } catch {
      // テーブルが存在しない場合は無視
    }

    // ユーザーを削除（Cascadeで関連データも自動削除）
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'アカウントが削除されました' })
  } catch (error) {
    console.error('アカウント削除エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'アカウントの削除に失敗しました', details: errorMessage },
      { status: 500 }
    )
  }
}
