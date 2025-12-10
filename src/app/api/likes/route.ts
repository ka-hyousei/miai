import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { toUserId } = await request.json()

    if (!toUserId) {
      return NextResponse.json({ error: '対象ユーザーを指定してください' }, { status: 400 })
    }

    if (toUserId === session.user.id) {
      return NextResponse.json({ error: '自分自身にいいねはできません' }, { status: 400 })
    }

    // 既にいいね済みかチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: session.user.id,
          toUserId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json({ error: '既にいいね済みです' }, { status: 400 })
    }

    // いいねを作成
    const like = await prisma.like.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
      },
    })

    // 相手からのいいねがあるかチェック（マッチング確認）
    const mutualLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: toUserId,
          toUserId: session.user.id,
        },
      },
    })

    return NextResponse.json({
      like,
      isMatch: !!mutualLike,
      message: mutualLike ? 'マッチングしました！' : 'いいねを送りました',
    })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'いいねの送信に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'received'

    if (type === 'sent') {
      // 自分が送ったいいね
      const sentLikes = await prisma.like.findMany({
        where: {
          fromUserId: session.user.id,
        },
        include: {
          toUser: {
            include: {
              profile: true,
              photos: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json({ likes: sentLikes })
    }

    // 自分がもらったいいね（default: received）
    const receivedLikes = await prisma.like.findMany({
      where: {
        toUserId: session.user.id,
      },
      include: {
        fromUser: {
          include: {
            profile: true,
            photos: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 自分が送ったいいねを取得してマッチング判定
    const sentLikeUserIds = await prisma.like.findMany({
      where: {
        fromUserId: session.user.id,
      },
      select: {
        toUserId: true,
      },
    })

    const sentUserIdSet = new Set(sentLikeUserIds.map((l) => l.toUserId))

    const likesWithMatchStatus = receivedLikes.map((like) => ({
      ...like,
      isMatch: sentUserIdSet.has(like.fromUserId),
    }))

    return NextResponse.json({ likes: likesWithMatchStatus })
  } catch (error) {
    console.error('Get likes error:', error)
    return NextResponse.json(
      { error: 'いいねの取得に失敗しました' },
      { status: 500 }
    )
  }
}
