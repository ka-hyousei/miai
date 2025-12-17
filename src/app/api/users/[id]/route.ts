import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { id: profileId } = await params

    // プロフィールを取得（profileIdで検索）
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    // ブロック関係をチェック
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedUserId: profile.userId },
          { blockerId: profile.userId, blockedUserId: session.user.id },
        ],
      },
    })

    if (isBlocked) {
      return NextResponse.json({ error: 'このプロフィールは表示できません' }, { status: 403 })
    }

    // いいね済みかチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: session.user.id,
          toUserId: profile.userId,
        },
      },
    })

    // マッチしているかチェック（相互いいね）
    const mutualLike = await prisma.like.findFirst({
      where: {
        fromUserId: profile.userId,
        toUserId: session.user.id,
      },
    })
    const isMatched = !!existingLike && !!mutualLike

    // 現在のユーザー情報を取得
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
      },
    })

    const now = new Date()
    const isPremium = currentUser?.subscription?.status === 'ACTIVE' &&
      currentUser?.subscription?.endDate &&
      new Date(currentUser.subscription.endDate) > now

    // カードで閲覧済みかチェック
    const hasViewedContact = await prisma.contactView.findUnique({
      where: {
        userId_viewedUserId: {
          userId: session.user.id,
          viewedUserId: profile.userId,
        },
      },
    })

    return NextResponse.json({
      profile,
      hasLiked: !!existingLike,
      isMatched,
      isPremium,
      contactCards: currentUser?.contactCards || 0,
      hasViewedContact: !!hasViewedContact,
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}
