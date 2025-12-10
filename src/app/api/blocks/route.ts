import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const blocks = await prisma.block.findMany({
      where: {
        blockerId: session.user.id,
      },
      include: {
        blockedUser: {
          include: {
            profile: {
              select: { nickname: true },
            },
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

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Get blocks error:', error)
    return NextResponse.json(
      { error: 'ブロックリストの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: '自分自身をブロックできません' }, { status: 400 })
    }

    // 既にブロック済みかチェック
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedUserId: {
          blockerId: session.user.id,
          blockedUserId: userId,
        },
      },
    })

    if (existingBlock) {
      return NextResponse.json({ error: '既にブロック済みです' }, { status: 400 })
    }

    const block = await prisma.block.create({
      data: {
        blockerId: session.user.id,
        blockedUserId: userId,
      },
    })

    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    console.error('Block error:', error)
    return NextResponse.json(
      { error: 'ブロックに失敗しました' },
      { status: 500 }
    )
  }
}
