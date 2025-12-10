import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

const MAX_PHOTOS = 5

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const photos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ photos, maxPhotos: MAX_PHOTOS })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { error: '写真の取得に失敗しました' },
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

    // 現在の写真数をチェック
    const currentPhotoCount = await prisma.photo.count({
      where: { userId: session.user.id },
    })

    if (currentPhotoCount >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `写真は${MAX_PHOTOS}枚まで登録できます` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: '画像が必要です' }, { status: 400 })
    }

    // 画像データの確認
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: '無効な画像形式です' }, { status: 400 })
    }

    // Cloudinaryにアップロード
    console.log('Cloudinaryにアップロード開始...')
    console.log('画像データサイズ:', image.length, 'bytes')
    console.log('環境変数確認:', {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !!process.env.CLOUDINARY_API_KEY,
      apiSecret: !!process.env.CLOUDINARY_API_SECRET,
    })

    let uploadResult
    try {
      uploadResult = await uploadImage(image, `miai/users/${session.user.id}`)
      console.log('Cloudinaryアップロード成功:', uploadResult)
    } catch (uploadError: unknown) {
      console.error('Cloudinaryアップロードエラー詳細:', uploadError)
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Cloudinaryアップロードに失敗しました'
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
    const { url, publicId } = uploadResult

    // 最初の写真はメイン写真に設定
    const isMain = currentPhotoCount === 0

    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url,
        publicId,
        isMain,
        order: currentPhotoCount,
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Upload photo error:', error)
    const errorMessage = error instanceof Error ? error.message : '写真のアップロードに失敗しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
