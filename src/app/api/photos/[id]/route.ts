import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteImage } from '@/lib/cloudinary'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { id: photoId } = await params

    // 写真が自分のものかチェック
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id,
      },
    })

    if (!photo) {
      return NextResponse.json({ error: '写真が見つかりません' }, { status: 404 })
    }

    // Cloudinaryから削除
    if (photo.publicId) {
      try {
        await deleteImage(photo.publicId)
      } catch (err) {
        console.error('Cloudinary delete error:', err)
        // Cloudinary削除に失敗してもDB削除は続行
      }
    }

    // DBから削除
    await prisma.photo.delete({
      where: { id: photoId },
    })

    // 削除した写真がメイン写真だった場合、最初の写真をメインに設定
    if (photo.isMain) {
      const firstPhoto = await prisma.photo.findFirst({
        where: { userId: session.user.id },
        orderBy: { order: 'asc' },
      })

      if (firstPhoto) {
        await prisma.photo.update({
          where: { id: firstPhoto.id },
          data: { isMain: true },
        })
      }
    }

    // orderを再整理
    const remainingPhotos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
    })

    for (let i = 0; i < remainingPhotos.length; i++) {
      if (remainingPhotos[i].order !== i) {
        await prisma.photo.update({
          where: { id: remainingPhotos[i].id },
          data: { order: i },
        })
      }
    }

    return NextResponse.json({ message: '写真を削除しました' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: '写真の削除に失敗しました' },
      { status: 500 }
    )
  }
}

// メイン写真の設定
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { id: photoId } = await params

    // 写真が自分のものかチェック
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id,
      },
    })

    if (!photo) {
      return NextResponse.json({ error: '写真が見つかりません' }, { status: 404 })
    }

    // すべての写真のisMainをfalseに
    await prisma.photo.updateMany({
      where: { userId: session.user.id },
      data: { isMain: false },
    })

    // 選択した写真をメインに設定
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: { isMain: true },
    })

    return NextResponse.json({ photo: updatedPhoto })
  } catch (error) {
    console.error('Set main photo error:', error)
    return NextResponse.json(
      { error: 'メイン写真の設定に失敗しました' },
      { status: 500 }
    )
  }
}
