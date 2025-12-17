'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import {
  PREFECTURES,
  GENDER_OPTIONS,
  VISA_TYPE_OPTIONS,
  JAPANESE_LEVEL_OPTIONS,
  FUTURE_PLAN_OPTIONS,
  VISA_INFO_DISCLAIMER,
  NATIONALITY_OPTIONS,
} from '@/lib/constants'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
    showVisaType: false,
    showYearsInJapan: false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const birthDate = new Date(
        parseInt(formData.birthYear),
        parseInt(formData.birthMonth) - 1,
        parseInt(formData.birthDay)
      )

      const response = await fetch('/api/profile', {
        method: 'POST',
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

      router.push('/discover')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const totalSteps = formData.nationality === '日本' ? 2 : 3

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-8 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('setup')}</h1>
            <p className="text-gray-600">
              {t('step').replace('{current}', String(step)).replace('{total}', String(totalSteps))}
            </p>
            <div className="flex gap-2 mt-4 justify-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-16 h-1 rounded-full ${
                    i + 1 <= step ? 'bg-pink-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('basicInfo')}</h2>

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

              <Select
                id="nationality"
                name="nationality"
                label={t('nationality')}
                value={formData.nationality}
                onChange={handleChange}
                options={NATIONALITY_OPTIONS}
                placeholder={t('selectPlaceholder')}
                required
              />

              <Button
                onClick={() => setStep(2)}
                className="w-full"
                size="lg"
                disabled={
                  !formData.nickname ||
                  !formData.gender ||
                  !formData.birthYear ||
                  !formData.birthMonth ||
                  !formData.birthDay ||
                  !formData.prefecture ||
                  !formData.nationality
                }
              >
                {tCommon('next')}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('selfIntro')}</h2>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  {tCommon('back')}
                </Button>
                {formData.nationality === '日本' ? (
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {t('complete')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1"
                    size="lg"
                  >
                    {tCommon('next')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 3 && formData.nationality !== '日本' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('japanRelated')}（{t('optional')}）
                </h2>
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  {VISA_INFO_DISCLAIMER}
                </p>
              </div>

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
                id="hometown"
                name="hometown"
                label={t('hometown')}
                value={formData.hometown}
                onChange={handleChange}
                placeholder={t('hometownPlaceholder')}
              />

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">{t('displaySettings')}</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="showVisaType"
                    checked={formData.showVisaType}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">{t('showVisaType')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="showYearsInJapan"
                    checked={formData.showYearsInJapan}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">{t('showYearsInJapan')}</span>
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  {tCommon('back')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  size="lg"
                  isLoading={isLoading}
                >
                  {t('complete')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
