import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取通知设置
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { emailNotifications: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      emailNotifications: profile.emailNotifications,
    })
  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: '設定の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 更新通知设置
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { emailNotifications } = body

    if (typeof emailNotifications !== 'boolean') {
      return NextResponse.json(
        { error: '無効なリクエストです' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: { emailNotifications },
      select: { emailNotifications: true },
    })

    return NextResponse.json({
      emailNotifications: profile.emailNotifications,
    })
  } catch (error) {
    console.error('Update notification settings error:', error)
    return NextResponse.json(
      { error: '設定の更新に失敗しました' },
      { status: 500 }
    )
  }
}
