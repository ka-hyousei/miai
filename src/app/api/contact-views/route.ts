import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - カードを使用して連絡先を閲覧
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: '対象ユーザーIDが必要です' }, { status: 400 })
    }

    // 自分自身は閲覧不可
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: '自分自身の連絡先は閲覧できません' }, { status: 400 })
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // プレミアム会員かどうかチェック
    const now = new Date()
    const isPremium = user.subscription?.status === 'ACTIVE' &&
                      user.subscription?.endDate &&
                      new Date(user.subscription.endDate) > now

    if (isPremium) {
      // プレミアム会員は無制限で閲覧可能
      return NextResponse.json({
        success: true,
        method: 'premium',
        message: 'プレミアム会員のため無制限で閲覧可能です'
      })
    }

    // すでに閲覧済みかチェック
    const existingView = await prisma.contactView.findUnique({
      where: {
        userId_viewedUserId: {
          userId: session.user.id,
          viewedUserId: targetUserId,
        },
      },
    })

    if (existingView) {
      // すでに閲覧済み
      return NextResponse.json({
        success: true,
        method: 'already_viewed',
        message: 'すでに閲覧済みです'
      })
    }

    // カード残高チェック
    if (user.contactCards <= 0) {
      return NextResponse.json({
        error: 'カードが不足しています。カードを購入してください。',
        needsCard: true,
      }, { status: 403 })
    }

    // トランザクションでカードを消費して閲覧記録を作成
    await prisma.$transaction(async (tx) => {
      // カードを1枚消費
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          contactCards: { decrement: 1 },
        },
      })

      // 閲覧記録を作成
      await tx.contactView.create({
        data: {
          userId: session.user.id,
          viewedUserId: targetUserId,
        },
      })
    })

    // 残りカード枚数を取得
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contactCards: true },
    })

    return NextResponse.json({
      success: true,
      method: 'card',
      message: 'カードを1枚使用しました',
      remainingCards: updatedUser?.contactCards || 0,
    })
  } catch (error) {
    console.error('Error using contact card:', error)
    return NextResponse.json(
      { error: '処理に失敗しました' },
      { status: 500 }
    )
  }
}

// GET - カード残高と閲覧履歴を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        contactCards: true,
        contactViews: {
          select: {
            viewedUserId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        subscription: {
          select: {
            status: true,
            endDate: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    const now = new Date()
    const isPremium = user.subscription?.status === 'ACTIVE' &&
                      user.subscription?.endDate &&
                      new Date(user.subscription.endDate) > now

    return NextResponse.json({
      contactCards: user.contactCards,
      viewedUsers: user.contactViews.map(v => v.viewedUserId),
      isPremium,
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: '取得に失敗しました' },
      { status: 500 }
    )
  }
}
