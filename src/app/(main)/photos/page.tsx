'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Star, Trash2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Photo {
  id: string
  url: string
  isMain: boolean
  order: number
}

type DialogType = 'confirm' | 'success' | 'error' | null

interface DialogState {
  type: DialogType
  title: string
  message: string
  onConfirm?: () => void
}

export default function PhotosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('photos')
  const tCommon = useTranslations('common')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [maxPhotos, setMaxPhotos] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingMainId, setSettingMainId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>({ type: null, title: '', message: '' })

  const closeDialog = () => {
    setDialog({ type: null, title: '', message: '' })
  }

  const showSuccessDialog = (message: string) => {
    setDialog({
      type: 'success',
      title: t('uploadSuccess').includes('アップロード') ? '完了' : '完成',
      message,
    })
  }

  const showErrorDialog = (message: string) => {
    setDialog({
      type: 'error',
      title: tCommon('error'),
      message,
    })
  }

  const showConfirmDialog = (message: string, onConfirm: () => void) => {
    setDialog({
      type: 'confirm',
      title: t('deleteConfirm').includes('削除') ? '確認' : '确认',
      message,
      onConfirm,
    })
  }

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
      showErrorDialog(t('fileSizeError'))
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      showErrorDialog(t('fileTypeError'))
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
        showSuccessDialog(t('uploadSuccess'))
      } else {
        showErrorDialog(data.error || t('uploadFailed'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      showErrorDialog(t('uploadFailed'))
    } finally {
      setIsUploading(false)
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteClick = (photoId: string) => {
    showConfirmDialog(t('deleteConfirm'), () => handleDeleteConfirmed(photoId))
  }

  const handleDeleteConfirmed = async (photoId: string) => {
    closeDialog()
    setDeletingId(photoId)

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        showSuccessDialog(t('deleteSuccess'))
      } else {
        const data = await response.json()
        showErrorDialog(data.error || t('deleteFailed'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      showErrorDialog(t('deleteFailed'))
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
        showSuccessDialog(t('setMainSuccess'))
      } else {
        const data = await response.json()
        showErrorDialog(data.error || t('setMainFailed'))
      }
    } catch (error) {
      console.error('Set main error:', error)
      showErrorDialog(t('setMainFailed'))
    } finally {
      setSettingMainId(null)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  return (
    <div className="md:ml-64">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header - 中国风 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/mypage" className="p-2 hover:bg-red-50 rounded-full border border-red-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-red-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">◈</span>
              <h1 className="text-xl font-bold text-red-700">{t('title')}</h1>
              <span className="text-yellow-600">◈</span>
            </div>
            <p className="text-sm text-gray-500">{t('count').replace('{current}', String(photos.length)).replace('{max}', String(maxPhotos))}</p>
          </div>
        </div>

        {/* Photo Grid - 中国风 */}
        <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl p-4 border-2 border-red-200 relative mb-6">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[3/4] bg-gray-200 rounded-xl overflow-hidden group border-2 border-red-100 hover:border-red-300 transition-colors"
              >
                <img
                  src={photo.url}
                  alt={t('profilePhoto')}
                  className="w-full h-full object-cover"
                />

                {/* Main badge */}
                {photo.isMain && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {t('main')}
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
                      className="bg-white/90 hover:bg-white"
                    >
                      {settingMainId === photo.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteClick(photo.id)}
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
                className="aspect-[3/4] bg-gradient-to-b from-red-50 to-orange-50 rounded-xl border-2 border-dashed border-red-300 flex flex-col items-center justify-center text-red-400 hover:text-red-600 hover:border-red-400 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm">{t('addPhoto')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Tips - 中国风 */}
        <div className="bg-gradient-to-b from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200 relative">
          {/* 装饰性角落 */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />

          <h3 className="font-medium text-red-700 mb-2 flex items-center gap-2">
            <span className="text-yellow-500">✿</span>
            {t('tips')}
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・{t('tip1')}</li>
            <li>・{t('tip2')}</li>
            <li>・{t('tip3')}</li>
            <li>・{t('tip4').replace('{max}', String(maxPhotos))}</li>
          </ul>
        </div>
      </div>

      {/* Dialog Modal - 中国风 */}
      {dialog.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-red-50/50 rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200 border-2 border-red-200 relative">
            {/* 装饰性角落 */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400 rounded-br-xl" />

            {/* Icon */}
            <div className="flex justify-center mb-4">
              {dialog.type === 'confirm' && (
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-yellow-200">
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              )}
              {dialog.type === 'success' && (
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-200">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              )}
              {dialog.type === 'error' && (
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center border-2 border-red-200">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {dialog.title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center whitespace-pre-line mb-6">
              {dialog.message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              {dialog.type === 'confirm' ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={closeDialog}
                  >
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    onClick={dialog.onConfirm}
                  >
                    {tCommon('delete')}
                  </Button>
                </>
              ) : (
                <Button
                  className={`w-full ${
                    dialog.type === 'success'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                  }`}
                  onClick={closeDialog}
                >
                  OK
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
