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
            <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('count').replace('{current}', String(photos.length)).replace('{max}', String(maxPhotos))}</p>
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
                alt={t('profilePhoto')}
                className="w-full h-full object-cover"
              />

              {/* Main badge */}
              {photo.isMain && (
                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
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
              className="aspect-[3/4] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
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
          <h3 className="font-medium text-gray-900 mb-2">{t('tips')}</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・{t('tip1')}</li>
            <li>・{t('tip2')}</li>
            <li>・{t('tip3')}</li>
            <li>・{t('tip4').replace('{max}', String(maxPhotos))}</li>
          </ul>
        </div>
      </div>

      {/* Dialog Modal */}
      {dialog.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {dialog.type === 'confirm' && (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              )}
              {dialog.type === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              )}
              {dialog.type === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
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
                    className="flex-1"
                    onClick={closeDialog}
                  >
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    onClick={dialog.onConfirm}
                  >
                    {tCommon('delete')}
                  </Button>
                </>
              ) : (
                <Button
                  className={`w-full ${
                    dialog.type === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-500 hover:bg-gray-600'
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
