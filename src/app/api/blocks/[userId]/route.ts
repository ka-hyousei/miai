import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { userId } = await params

    await prisma.block.delete({
      where: {
        blockerId_blockedUserId: {
          blockerId: session.user.id,
          blockedUserId: userId,
        },
      },
    })

    return NextResponse.json({ message: 'ブロックを解除しました' })
  } catch (error) {
    console.error('Unblock error:', error)
    return NextResponse.json(
      { error: 'ブロック解除に失敗しました' },
      { status: 500 }
    )
  }
}
