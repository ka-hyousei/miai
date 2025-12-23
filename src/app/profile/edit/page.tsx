'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  PREFECTURES,
  GENDER_OPTIONS,
  VISA_TYPE_OPTIONS,
  JAPANESE_LEVEL_OPTIONS,
  FUTURE_PLAN_OPTIONS,
  VISA_INFO_DISCLAIMER,
  CONTACT_VISIBILITY_OPTIONS,
} from '@/lib/constants'

type DialogType = 'success' | 'error' | null

interface DialogState {
  type: DialogType
  title: string
  message: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialog, setDialog] = useState<DialogState>({ type: null, title: '', message: '' })

  const closeDialog = () => {
    setDialog({ type: null, title: '', message: '' })
  }

  const showSuccessDialog = (message: string) => {
    setDialog({
      type: 'success',
      title: t('profileSaved'),
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

  const [formData, setFormData] = useState({
    nickname: '',
    gender: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    prefecture: '',
    city: '',
    bio: '',
    height: '',
    occupation: '',
    visaType: '',
    yearsInJapan: '',
    japaneseLevel: '',
    futurePlan: '',
    nationality: '',
    hometown: '',
    wechatId: '',
    phoneNumber: '',
    contactEmail: '',
    showVisaType: false,
    showYearsInJapan: false,
    showContact: true,
    contactVisibility: 'EVERYONE',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            const birthDate = new Date(data.profile.birthDate)
            setFormData({
              nickname: data.profile.nickname || '',
              gender: data.profile.gender || '',
              birthYear: String(birthDate.getFullYear()),
              birthMonth: String(birthDate.getMonth() + 1),
              birthDay: String(birthDate.getDate()),
              prefecture: data.profile.prefecture || '',
              city: data.profile.city || '',
              bio: data.profile.bio || '',
              height: data.profile.height ? String(data.profile.height) : '',
              occupation: data.profile.occupation || '',
              visaType: data.profile.visaType || '',
              yearsInJapan: data.profile.yearsInJapan ? String(data.profile.yearsInJapan) : '',
              japaneseLevel: data.profile.japaneseLevel || '',
              futurePlan: data.profile.futurePlan || '',
              nationality: data.profile.nationality || '',
              hometown: data.profile.hometown || '',
              wechatId: data.profile.wechatId || '',
              phoneNumber: data.profile.phoneNumber || '',
              contactEmail: data.profile.contactEmail || '',
              showVisaType: data.profile.showVisaType || false,
              showYearsInJapan: data.profile.showYearsInJapan || false,
              showContact: data.profile.showContact !== false,
              contactVisibility: data.profile.contactVisibility || 'EVERYONE',
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsFetching(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const birthDate = new Date(
        parseInt(formData.birthYear),
        parseInt(formData.birthMonth) - 1,
        parseInt(formData.birthDay)
      )

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthDate: birthDate.toISOString(),
          height: formData.height ? parseInt(formData.height) : null,
          yearsInJapan: formData.yearsInJapan ? parseInt(formData.yearsInJapan) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setSuccess(t('profileSaved'))
      showSuccessDialog(t('profileSaved'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('updateFailed')
      setError(errorMessage)
      showErrorDialog(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  const years = Array.from({ length: 60 }, (_, i) => ({
    value: String(new Date().getFullYear() - 18 - i),
    label: `${new Date().getFullYear() - 18 - i}`,
  }))

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}`,
  }))

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}`,
  }))

  const prefectureOptions = PREFECTURES.map((p) => ({ value: p, label: p }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white md:ml-64">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-red-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-red-600" />
          </button>
          <h1 className="text-xl font-bold text-red-700">{t('edit')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm p-6 border-2 border-red-200 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
            <h2 className="text-lg font-semibold text-red-700 mb-4">{t('basicInfo')}</h2>
            <div className="space-y-4">
              <Input
                id="nickname"
                name="nickname"
                label={t('nickname')}
                value={formData.nickname}
                onChange={handleChange}
                placeholder={t('nicknamePlaceholder')}
                required
              />

              <Select
                id="gender"
                name="gender"
                label={t('gender')}
                value={formData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS}
                placeholder={t('selectPlaceholder')}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('birthday')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    id="birthYear"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    options={years}
                    placeholder={t('year')}
                    required
                  />
                  <Select
                    id="birthMonth"
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    options={months}
                    placeholder={t('month')}
                    required
                  />
                  <Select
                    id="birthDay"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    options={days}
                    placeholder={t('day')}
                    required
                  />
                </div>
              </div>

              <Select
                id="prefecture"
                name="prefecture"
                label={t('prefecture')}
                value={formData.prefecture}
                onChange={handleChange}
                options={prefectureOptions}
                placeholder={t('selectPlaceholder')}
                required
              />

              <Input
                id="city"
                name="city"
                label={`${t('city')}（${t('optional')}）`}
                value={formData.city}
                onChange={handleChange}
                placeholder={t('cityPlaceholder')}
              />
            </div>
          </div>

          {/* 自己紹介 */}
          <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm p-6 border-2 border-red-200 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
            <h2 className="text-lg font-semibold text-red-700 mb-4">{t('selfIntro')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('introduction')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder={t('bioPlaceholder')}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <Input
                id="height"
                name="height"
                type="number"
                label={`${t('heightCm')}（${t('optional')}）`}
                value={formData.height}
                onChange={handleChange}
                placeholder={t('heightPlaceholder')}
              />

              <Input
                id="occupation"
                name="occupation"
                label={`${t('occupation')}（${t('optional')}）`}
                value={formData.occupation}
                onChange={handleChange}
                placeholder={t('occupationPlaceholder')}
              />
            </div>
          </div>

          {/* 在日関連情報 */}
          <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm p-6 border-2 border-red-200 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              {t('japanRelated')}（{t('optional')}）
            </h2>
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mb-4">
              {VISA_INFO_DISCLAIMER}
            </p>
            <div className="space-y-4">
              <Select
                id="visaType"
                name="visaType"
                label={t('visaType')}
                value={formData.visaType}
                onChange={handleChange}
                options={VISA_TYPE_OPTIONS}
                placeholder={t('noSelect')}
              />

              <Input
                id="yearsInJapan"
                name="yearsInJapan"
                type="number"
                label={t('yearsInJapan')}
                value={formData.yearsInJapan}
                onChange={handleChange}
                placeholder={t('yearsPlaceholder')}
              />

              <Select
                id="japaneseLevel"
                name="japaneseLevel"
                label={t('japaneseLevel')}
                value={formData.japaneseLevel}
                onChange={handleChange}
                options={JAPANESE_LEVEL_OPTIONS}
                placeholder={t('noSelect')}
              />

              <Select
                id="futurePlan"
                name="futurePlan"
                label={t('futurePlan')}
                value={formData.futurePlan}
                onChange={handleChange}
                options={FUTURE_PLAN_OPTIONS}
                placeholder={t('noSelect')}
              />

              <Input
                id="nationality"
                name="nationality"
                label={t('nationality')}
                value={formData.nationality}
                onChange={handleChange}
                placeholder={t('nationalityPlaceholder')}
              />

              <Input
                id="hometown"
                name="hometown"
                label={t('hometown')}
                value={formData.hometown}
                onChange={handleChange}
                placeholder={t('hometownPlaceholder')}
              />
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm p-6 border-2 border-red-200 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              {t('contactInfo')}（{t('optional')}）
            </h2>
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mb-4">
              {t('contactNote')}
            </p>
            <div className="space-y-4">
              <Input
                id="wechatId"
                name="wechatId"
                label={t('wechatId')}
                value={formData.wechatId}
                onChange={handleChange}
                placeholder={t('wechatPlaceholder')}
              />

              <Input
                id="phoneNumber"
                name="phoneNumber"
                label={t('phoneNumber')}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('phonePlaceholder')}
              />

              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                label={t('contactEmail')}
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>

          {/* 表示設定 */}
          <div className="bg-gradient-to-b from-white to-red-50/30 rounded-xl shadow-sm p-6 border-2 border-red-200 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-400 rounded-br-lg" />
            <h2 className="text-lg font-semibold text-red-700 mb-4">{t('displaySettings')}</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="showContact"
                  checked={formData.showContact}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">{t('showContact')}</span>
              </label>

              {formData.showContact && (
                <div className="ml-7">
                  <Select
                    id="contactVisibility"
                    name="contactVisibility"
                    label={t('visibilityTarget')}
                    value={formData.contactVisibility}
                    onChange={handleChange}
                    options={CONTACT_VISIBILITY_OPTIONS}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            size="lg"
            isLoading={isLoading}
          >
            {t('saveProfile')}
          </Button>
        </form>
      </div>

      {/* Dialog Modal */}
      {dialog.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
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

            {/* Button */}
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
          </div>
        </div>
      )}
    </div>
  )
}
