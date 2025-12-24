import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const userId = session.user.id

    // 今日の日付（時間を切り捨て）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 今日すでに推薦があるか確認
    const existingRecommendation = await prisma.dailyRecommendation.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      include: {
        target: {
          include: {
            profile: true,
            photos: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    })

    if (existingRecommendation?.target?.profile) {
      // 既存の推薦を返す
      const target = existingRecommendation.target
      const profile = target.profile!
      const mainPhoto = target.photos[0]

      // いいね済みかチェック
      const liked = await prisma.like.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: userId,
            toUserId: target.id,
          },
        },
      })

      return NextResponse.json({
        pick: {
          id: target.id,
          nickname: profile.nickname,
          age: calculateAge(profile.birthDate),
          prefecture: profile.prefecture,
          bio: profile.bio,
          mainPhoto: mainPhoto?.url || null,
          isLiked: !!liked,
        },
        date: today.toISOString().split('T')[0],
      })
    }

    // 新しい推薦を生成

    // ログインユーザーのプロフィールを取得
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { gender: true, prefecture: true, birthDate: true },
    })

    if (!currentUserProfile) {
      return NextResponse.json({ pick: null, date: today.toISOString().split('T')[0] })
    }

    // 異性を対象
    const targetGender = currentUserProfile.gender === 'MALE' ? 'FEMALE' : 'MALE'

    // ブロック関係を取得
    const blockedUserIds = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId },
          { blockedUserId: userId },
        ],
      },
      select: {
        blockerId: true,
        blockedUserId: true,
      },
    })

    const excludeUserIds = new Set<string>()
    excludeUserIds.add(userId)
    blockedUserIds.forEach((block) => {
      excludeUserIds.add(block.blockerId)
      excludeUserIds.add(block.blockedUserId)
    })

    // 既にいいねしたユーザーを除外
    const likedUsers = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    })
    likedUsers.forEach((like) => excludeUserIds.add(like.toUserId))

    // 過去30日間に推薦されたユーザーを除外
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentRecommendations = await prisma.dailyRecommendation.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      select: { targetId: true },
    })
    recentRecommendations.forEach((rec) => excludeUserIds.add(rec.targetId))

    // 候補者を取得
    const candidates = await prisma.profile.findMany({
      where: {
        userId: { notIn: Array.from(excludeUserIds) },
        isProfilePublic: true,
        gender: targetGender,
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

    if (candidates.length === 0) {
      return NextResponse.json({ pick: null, date: today.toISOString().split('T')[0] })
    }

    // スコアリング
    const scoredCandidates = candidates.map((candidate) => {
      let score = 0

      // 同じ都道府県 +10
      if (candidate.prefecture === currentUserProfile.prefecture) {
        score += 10
      }

      // 年齢差が5歳以内 +5
      if (currentUserProfile.birthDate) {
        const currentAge = calculateAge(currentUserProfile.birthDate)
        const candidateAge = calculateAge(candidate.birthDate)
        if (Math.abs(currentAge - candidateAge) <= 5) {
          score += 5
        }
      }

      // 自己紹介がある +3
      if (candidate.bio && candidate.bio.length > 10) {
        score += 3
      }

      // 写真がある +5
      if (candidate.user.photos.length > 0) {
        score += 5
      }

      // ランダム性を加える (0-10)
      score += Math.random() * 10

      return { candidate, score }
    })

    // スコア順でソート
    scoredCandidates.sort((a, b) => b.score - a.score)

    // 最高スコアのユーザーを選択
    const selected = scoredCandidates[0].candidate

    // 推薦を保存
    await prisma.dailyRecommendation.create({
      data: {
        userId,
        targetId: selected.userId,
        date: today,
      },
    })

    const mainPhoto = selected.user.photos[0]

    return NextResponse.json({
      pick: {
        id: selected.userId,
        nickname: selected.nickname,
        age: calculateAge(selected.birthDate),
        prefecture: selected.prefecture,
        bio: selected.bio,
        mainPhoto: mainPhoto?.url || null,
        isLiked: false,
      },
      date: today.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Daily pick error:', error)
    return NextResponse.json(
      { error: '今日のおすすめの取得に失敗しました' },
      { status: 500 }
    )
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
