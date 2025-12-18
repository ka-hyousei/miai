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

    // マッチング状態を確認
    // マッチング条件：
    // 1. 双方がいいねしている（従来のマッチング）
    // 2. 相手がいいねしている（相手が友達申請を承認）
    // 3. 双方がメッセージを送っている（相手が返信で友達申請を承認）
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

    const hasMessageFromMe = messages.some(m => m.fromUserId === session.user.id)
    const hasMessageFromThem = messages.some(m => m.fromUserId === otherUserId)

    // マッチング判定：
    // - 双方がいいね済み
    // - 相手がいいね済み（自分がメッセージを送っていた場合、相手のいいね=承認）
    // - 双方がメッセージを送信済み（相手の返信=承認）
    const isMatched =
      (!!likeFromMe && !!likeFromThem) ||  // 双方いいね
      (hasMessageFromMe && !!likeFromThem) ||  // 自分がメッセージ送信 + 相手がいいね
      (hasMessageFromMe && hasMessageFromThem)  // 双方メッセージ送信

    // 未マッチの場合、自分が既に初回メッセージを送ったかチェック
    const hasSentFirstMessage = !isMatched && hasMessageFromMe

    // 未読メッセージを既読にする
    await prisma.message.updateMany({
      where: {
        fromUserId: otherUserId,
        toUserId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ messages, otherUser, isMatched, hasSentFirstMessage })
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

    // 既存メッセージを取得
    const existingMessages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: session.user.id },
        ],
      },
      select: { fromUserId: true },
    })

    const hasMessageFromMe = existingMessages.some(m => m.fromUserId === session.user.id)
    const hasMessageFromThem = existingMessages.some(m => m.fromUserId === otherUserId)

    // マッチングしているかチェック
    // マッチング条件：
    // 1. 双方がいいねしている（従来のマッチング）
    // 2. 相手がいいねしている（相手が友達申請を承認）
    // 3. 双方がメッセージを送っている（相手が返信で友達申請を承認）
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

    const isMatched =
      (!!likeFromMe && !!likeFromThem) ||  // 双方いいね
      (hasMessageFromMe && !!likeFromThem) ||  // 自分がメッセージ送信 + 相手がいいね
      (hasMessageFromMe && hasMessageFromThem)  // 双方メッセージ送信

    // 未マッチの場合、最初の1通のみ送信可能
    if (!isMatched && hasMessageFromMe) {
      return NextResponse.json(
        { error: 'マッチングするまで追加のメッセージは送れません。相手があなたにいいね、または返信するとチャットできます。' },
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
