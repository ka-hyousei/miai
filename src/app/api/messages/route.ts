import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all users the current user has exchanged messages with
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          include: {
            profile: { select: { nickname: true } },
            photos: { where: { isMain: true }, take: 1 },
          },
        },
        toUser: {
          include: {
            profile: { select: { nickname: true } },
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
    })

    // Group messages by conversation partner
    const conversationsMap = new Map<string, {
      otherUser: typeof messages[0]['fromUser']
      lastMessage: typeof messages[0]
      unreadCount: number
    }>()

    messages.forEach((message) => {
      const otherUserId = message.fromUserId === userId ? message.toUserId : message.fromUserId
      const otherUser = message.fromUserId === userId ? message.toUser : message.fromUser

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUser,
          lastMessage: message,
          unreadCount: 0,
        })
      }

      // Count unread messages
      if (message.toUserId === userId && !message.isRead) {
        const conv = conversationsMap.get(otherUserId)!
        conv.unreadCount++
      }
    })

    const conversations = Array.from(conversationsMap.entries()).map(([id, data]) => ({
      id,
      otherUser: {
        id: data.otherUser.id,
        profile: data.otherUser.profile,
        photos: data.otherUser.photos,
      },
      lastMessage: data.lastMessage ? {
        content: data.lastMessage.content,
        createdAt: data.lastMessage.createdAt.toISOString(),
        isRead: data.lastMessage.isRead,
        fromUserId: data.lastMessage.fromUserId,
      } : null,
      unreadCount: data.unreadCount,
    }))

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { error: 'メッセージの取得に失敗しました' },
      { status: 500 }
    )
  }
}
