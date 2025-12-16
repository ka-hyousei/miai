import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Gender, VisaType } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    // ログインユーザーのプロフィールを取得して性別を確認
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { gender: true },
    })

    const searchParams = request.nextUrl.searchParams
    const genderParam = searchParams.get('gender') as Gender | null
    const prefecture = searchParams.get('prefecture')
    const ageMin = searchParams.get('ageMin')
    const ageMax = searchParams.get('ageMax')
    const nationality = searchParams.get('nationality')
    const visaType = searchParams.get('visaType') as VisaType | null

    // 性別フィルタ: 指定がなければ異性をデフォルト表示
    let gender: Gender | null = genderParam
    if (!gender && currentUserProfile?.gender) {
      // 男性なら女性を、女性なら男性をデフォルト表示
      gender = currentUserProfile.gender === 'MALE' ? 'FEMALE' : 'MALE'
    }

    // 自分がブロックしたユーザーと、自分をブロックしたユーザーを除外
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
    excludeUserIds.add(session.user.id) // 自分自身も除外
    blockedUserIds.forEach((block) => {
      excludeUserIds.add(block.blockerId)
      excludeUserIds.add(block.blockedUserId)
    })

    // 年齢フィルタの日付計算
    const today = new Date()
    let birthDateMin: Date | undefined
    let birthDateMax: Date | undefined

    if (ageMax) {
      birthDateMin = new Date(today.getFullYear() - parseInt(ageMax) - 1, today.getMonth(), today.getDate())
    }
    if (ageMin) {
      birthDateMax = new Date(today.getFullYear() - parseInt(ageMin), today.getMonth(), today.getDate())
    }

    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          notIn: Array.from(excludeUserIds),
        },
        isProfilePublic: true,
        ...(gender && { gender }),
        ...(prefecture && { prefecture }),
        ...(nationality && { nationality }),
        ...(visaType && { visaType }),
        ...(birthDateMin && {
          birthDate: {
            gte: birthDateMin,
          },
        }),
        ...(birthDateMax && {
          birthDate: {
            lte: birthDateMax,
          },
        }),
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // デフォルトの性別フィルタ（異性）を返す
    const defaultGender = currentUserProfile?.gender === 'MALE' ? 'FEMALE' : 'MALE'

    return NextResponse.json({ profiles, defaultGender })
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}
