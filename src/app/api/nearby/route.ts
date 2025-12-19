import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Gender } from '@/generated/prisma/client'

// Haversine公式计算两点之间的距离（公里）
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化距离显示
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    // 获取当前用户的资料（包括位置信息）
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        gender: true,
        latitude: true,
        longitude: true,
        showNearby: true,
      },
    })

    if (!currentUserProfile) {
      return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 })
    }

    // 检查用户是否开启了附近的人功能
    if (!currentUserProfile.showNearby) {
      return NextResponse.json({
        profiles: [],
        needsEnable: true
      })
    }

    // 检查用户是否有位置信息
    if (!currentUserProfile.latitude || !currentUserProfile.longitude) {
      return NextResponse.json({
        profiles: [],
        needsLocation: true
      })
    }

    const searchParams = request.nextUrl.searchParams
    const genderParam = searchParams.get('gender') as Gender | null
    const maxDistance = parseInt(searchParams.get('distance') || '50') // 默认50公里范围

    // 性别过滤：如果未指定则显示全部
    const gender: Gender | null = genderParam

    // 获取屏蔽列表
    const blockedUserIds = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: session.user.id },
          { blockedUserId: session.user.id },
        ],
      },
      select: {
        blockerId: true,
        blockedUserId: true,
      },
    })

    const excludeUserIds = new Set<string>()
    excludeUserIds.add(session.user.id)
    blockedUserIds.forEach((block) => {
      excludeUserIds.add(block.blockerId)
      excludeUserIds.add(block.blockedUserId)
    })

    // 获取开启了附近的人功能且有位置信息的用户
    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          notIn: Array.from(excludeUserIds),
        },
        isProfilePublic: true,
        showNearby: true,
        latitude: { not: null },
        longitude: { not: null },
        ...(gender && { gender }),
      },
      include: {
        user: {
          include: {
            photos: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    })

    // 计算距离并过滤
    const userLat = currentUserProfile.latitude
    const userLon = currentUserProfile.longitude

    const profilesWithDistance = profiles
      .map((profile) => {
        const distance = calculateDistance(
          userLat,
          userLon,
          profile.latitude!,
          profile.longitude!
        )
        return {
          ...profile,
          distance,
          distanceText: formatDistance(distance),
        }
      })
      .filter((profile) => profile.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50) // 最多返回50个结果

    // 获取已点赞的用户ID
    const likedUsers = await prisma.like.findMany({
      where: {
        fromUserId: session.user.id,
      },
      select: {
        toUserId: true,
      },
    })
    const likedUserIds = likedUsers.map((like) => like.toUserId)

    // 默认性别（空字符串表示全部）
    const defaultGender = ''

    return NextResponse.json({
      profiles: profilesWithDistance,
      defaultGender,
      likedUserIds,
      userLocation: {
        latitude: userLat,
        longitude: userLon,
      },
    })
  } catch (error) {
    console.error('Nearby error:', error)
    return NextResponse.json(
      { error: '附近の人の取得に失敗しました' },
      { status: 500 }
    )
  }
}
