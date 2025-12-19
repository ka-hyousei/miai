import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 更新位置信息
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude } = body

    // 验证经纬度
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: '無効な位置情報です' }, { status: 400 })
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: '位置情報の範囲が無効です' }, { status: 400 })
    }

    // 更新用户的位置信息
    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        latitude,
        longitude,
        lastLocationUpdate: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      location: {
        latitude: profile.latitude,
        longitude: profile.longitude,
        lastUpdate: profile.lastLocationUpdate,
      },
    })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json(
      { error: '位置情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 获取当前位置设置
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        latitude: true,
        longitude: true,
        showNearby: true,
        lastLocationUpdate: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      location: {
        latitude: profile.latitude,
        longitude: profile.longitude,
        lastUpdate: profile.lastLocationUpdate,
      },
      showNearby: profile.showNearby,
    })
  } catch (error) {
    console.error('Location fetch error:', error)
    return NextResponse.json(
      { error: '位置情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 更新附近的人功能开关
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { showNearby } = body

    if (typeof showNearby !== 'boolean') {
      return NextResponse.json({ error: '無効なパラメータです' }, { status: 400 })
    }

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        showNearby,
      },
    })

    return NextResponse.json({
      success: true,
      showNearby: profile.showNearby,
    })
  } catch (error) {
    console.error('Toggle nearby error:', error)
    return NextResponse.json(
      { error: '設定の更新に失敗しました' },
      { status: 500 }
    )
  }
}
