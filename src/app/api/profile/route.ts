import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Gender, VisaType, JapaneseLevel, FuturePlan, ContactVisibility } from '@/generated/prisma/client'

// 空文字列をundefinedに変換するヘルパー
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? undefined : val), schema)

const profileSchema = z.object({
  nickname: z.string().min(1, 'ニックネームを入力してください').max(20, 'ニックネームは20文字以内で入力してください'),
  gender: z.nativeEnum(Gender),
  birthDate: z.string(),
  prefecture: z.string().min(1, '都道府県を選択してください'),
  city: z.string().optional(),
  bio: z.string().max(1000, '自己紹介は1000文字以内で入力してください').optional(),
  height: z.number().min(100).max(250).nullable().optional(),
  occupation: z.string().max(50).optional(),
  visaType: emptyToUndefined(z.nativeEnum(VisaType).optional()),
  yearsInJapan: z.number().min(0).max(100).nullable().optional(),
  japaneseLevel: emptyToUndefined(z.nativeEnum(JapaneseLevel).optional()),
  futurePlan: emptyToUndefined(z.nativeEnum(FuturePlan).optional()),
  nationality: z.string().max(50).optional(),
  hometown: z.string().max(100).optional(),
  wechatId: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
  contactEmail: z.string().email().max(100).optional().or(z.literal('')),
  showVisaType: z.boolean().optional(),
  showYearsInJapan: z.boolean().optional(),
  showContact: z.boolean().optional(),
  contactVisibility: emptyToUndefined(z.nativeEnum(ContactVisibility).optional()),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'プロフィールは既に作成されています' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        nickname: validatedData.nickname,
        gender: validatedData.gender,
        birthDate: new Date(validatedData.birthDate),
        prefecture: validatedData.prefecture,
        city: validatedData.city || null,
        bio: validatedData.bio || null,
        height: validatedData.height || null,
        occupation: validatedData.occupation || null,
        visaType: validatedData.visaType || null,
        yearsInJapan: validatedData.yearsInJapan || null,
        japaneseLevel: validatedData.japaneseLevel || null,
        futurePlan: validatedData.futurePlan || null,
        nationality: validatedData.nationality || null,
        hometown: validatedData.hometown || null,
        wechatId: validatedData.wechatId || null,
        phoneNumber: validatedData.phoneNumber || null,
        contactEmail: validatedData.contactEmail || null,
        showVisaType: validatedData.showVisaType || false,
        showYearsInJapan: validatedData.showYearsInJapan || false,
        showContact: validatedData.showContact !== false,  // デフォルト公開
        contactVisibility: validatedData.contactVisibility || 'EVERYONE',
      },
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'プロフィールの作成に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    const photos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ profile, photos })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.partial().parse(body)

    const birthDate = validatedData.birthDate
      ? new Date(validatedData.birthDate)
      : new Date()

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        birthDate: validatedData.birthDate ? birthDate : undefined,
      },
      create: {
        userId: session.user.id,
        nickname: validatedData.nickname || 'ユーザー',
        gender: validatedData.gender || 'OTHER',
        birthDate: birthDate,
        prefecture: validatedData.prefecture || '東京都',
        city: validatedData.city || null,
        bio: validatedData.bio || null,
        height: validatedData.height || null,
        occupation: validatedData.occupation || null,
        visaType: validatedData.visaType || null,
        yearsInJapan: validatedData.yearsInJapan || null,
        japaneseLevel: validatedData.japaneseLevel || null,
        futurePlan: validatedData.futurePlan || null,
        nationality: validatedData.nationality || null,
        hometown: validatedData.hometown || null,
        wechatId: validatedData.wechatId || null,
        phoneNumber: validatedData.phoneNumber || null,
        contactEmail: validatedData.contactEmail || null,
        showVisaType: validatedData.showVisaType || false,
        showYearsInJapan: validatedData.showYearsInJapan || false,
        showContact: validatedData.showContact !== false,  // デフォルト公開
        contactVisibility: validatedData.contactVisibility || 'EVERYONE',
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    const errorMessage = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
