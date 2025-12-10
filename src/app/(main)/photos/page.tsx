'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Star, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Photo {
  id: string
  url: string
  isMain: boolean
  order: number
}

export default function PhotosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [maxPhotos, setMaxPhotos] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingMainId, setSettingMainId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos')
        if (response.ok) {
          const data = await response.json()
          setPhotos(data.photos || [])
          setMaxPhotos(data.maxPhotos || 5)
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchPhotos()
    }
  }, [session])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください')
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    setIsUploading(true)

    try {
      // Base64に変換
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      const data = await response.json()

      if (response.ok) {
        setPhotos([...photos, data.photo])
        alert('写真をアップロードしました')
      } else {
        alert(data.error || '写真のアップロードに失敗しました')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('写真のアップロードに失敗しました')
    } finally {
      setIsUploading(false)
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('この写真を削除しますか？')) return

    setDeletingId(photoId)

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        alert('写真を削除しました')
      } else {
        const data = await response.json()
        alert(data.error || '写真の削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('写真の削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetMain = async (photoId: string) => {
    setSettingMainId(photoId)

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setPhotos(photos.map(p => ({
          ...p,
          isMain: p.id === photoId,
        })))
        alert('メイン写真を設定しました')
      } else {
        const data = await response.json()
        alert(data.error || 'メイン写真の設定に失敗しました')
      }
    } catch (error) {
      console.error('Set main error:', error)
      alert('メイン写真の設定に失敗しました')
    } finally {
      setSettingMainId(null)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="md:ml-64">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/mypage" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">写真管理</h1>
            <p className="text-sm text-gray-500">{photos.length} / {maxPhotos} 枚</p>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden group"
            >
              <img
                src={photo.url}
                alt="プロフィール写真"
                className="w-full h-full object-cover"
              />

              {/* Main badge */}
              {photo.isMain && (
                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  メイン
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isMain && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetMain(photo.id)}
                    disabled={settingMainId === photo.id}
                  >
                    {settingMainId === photo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                >
                  {deletingId === photo.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}

          {/* Add photo button */}
          {photos.length < maxPhotos && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-[3/4] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-sm">写真を追加</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Tips */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">写真のヒント</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・顔がはっきり写っている写真がおすすめです</li>
            <li>・明るい場所で撮影された写真を選びましょう</li>
            <li>・メイン写真は検索結果に表示されます</li>
            <li>・最大{maxPhotos}枚まで登録できます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
