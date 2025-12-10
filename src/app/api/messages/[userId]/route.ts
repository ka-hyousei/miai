import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { userId: otherUserId } = await params

    // ブロック関係をチェック
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedUserId: otherUserId },
          { blockerId: otherUserId, blockedUserId: session.user.id },
        ],
      },
    })

    if (isBlocked) {
      return NextResponse.json({ error: 'このユーザーとはメッセージできません' }, { status: 403 })
    }

    // 相手のユーザー情報を取得
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      include: {
        profile: {
          select: { nickname: true },
        },
        photos: {
          where: { isMain: true },
          take: 1,
        },
      },
    })

    if (!otherUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // メッセージを取得
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })

    // 未読メッセージを既読にする
    await prisma.message.updateMany({
      where: {
        fromUserId: otherUserId,
        toUserId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ messages, otherUser })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'メッセージの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { userId: otherUserId } = await params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 })
    }

    // ブロック関係をチェック
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedUserId: otherUserId },
          { blockerId: otherUserId, blockedUserId: session.user.id },
        ],
      },
    })

    if (isBlocked) {
      return NextResponse.json({ error: 'このユーザーにメッセージを送れません' }, { status: 403 })
    }

    // マッチングしているかチェック（両方がいいねしている）
    const [likeFromMe, likeFromThem] = await Promise.all([
      prisma.like.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: session.user.id,
            toUserId: otherUserId,
          },
        },
      }),
      prisma.like.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: otherUserId,
            toUserId: session.user.id,
          },
        },
      }),
    ])

    const isMatched = !!likeFromMe && !!likeFromThem

    if (!isMatched) {
      return NextResponse.json(
        { error: 'マッチングしていないユーザーにはメッセージを送れません' },
        { status: 403 }
      )
    }

    // メッセージを作成
    const message = await prisma.message.create({
      data: {
        fromUserId: session.user.id,
        toUserId: otherUserId,
        content: content.trim(),
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'メッセージの送信に失敗しました' },
      { status: 500 }
    )
  }
}
