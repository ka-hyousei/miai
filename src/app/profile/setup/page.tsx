'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
  NATIONALITY_OPTIONS,
} from '@/lib/constants'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // 基本情報
    nickname: '',
    gender: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    prefecture: '',
    city: '',
    // 自己紹介
    bio: '',
    height: '',
    occupation: '',
    // 在日関連（任意）
    visaType: '',
    yearsInJapan: '',
    japaneseLevel: '',
    futurePlan: '',
    nationality: '',
    hometown: '',
    // 表示設定
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
      setError(err instanceof Error ? err.message : 'プロフィールの保存に失敗しました')
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

  const years = Array.from({ length: 60 }, (_, i) => ({
    value: String(new Date().getFullYear() - 18 - i),
    label: `${new Date().getFullYear() - 18 - i}年`,
  }))

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}月`,
  }))

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}日`,
  }))

  const prefectureOptions = PREFECTURES.map((p) => ({ value: p, label: p }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">プロフィール設定</h1>
            {/* 日本国籍の場合は2ステップ、それ以外は3ステップ */}
            {formData.nationality === '日本' ? (
              <>
                <p className="text-gray-600">ステップ {step} / 2</p>
                <div className="flex gap-2 mt-4 justify-center">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      className={`w-16 h-1 rounded-full ${
                        s <= step ? 'bg-pink-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600">ステップ {step} / 3</p>
                <div className="flex gap-2 mt-4 justify-center">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`w-16 h-1 rounded-full ${
                        s <= step ? 'bg-pink-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>

              <Input
                id="nickname"
                name="nickname"
                label="ニックネーム"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="表示名を入力"
                required
              />

              <Select
                id="gender"
                name="gender"
                label="性別"
                value={formData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS}
                placeholder="選択してください"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生年月日
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    id="birthYear"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                    options={years}
                    placeholder="年"
                    required
                  />
                  <Select
                    id="birthMonth"
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                    options={months}
                    placeholder="月"
                    required
                  />
                  <Select
                    id="birthDay"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                    options={days}
                    placeholder="日"
                    required
                  />
                </div>
              </div>

              <Select
                id="prefecture"
                name="prefecture"
                label="お住まいの都道府県"
                value={formData.prefecture}
                onChange={handleChange}
                options={prefectureOptions}
                placeholder="選択してください"
                required
              />

              <Input
                id="city"
                name="city"
                label="市区町村（任意）"
                value={formData.city}
                onChange={handleChange}
                placeholder="例：渋谷区"
              />

              <Select
                id="nationality"
                name="nationality"
                label="国籍"
                value={formData.nationality}
                onChange={handleChange}
                options={NATIONALITY_OPTIONS}
                placeholder="選択してください"
                required
              />

              <Button
                onClick={() => {
                  // 日本以外の国籍の場合はステップ3へ、日本の場合はステップ2へ
                  if (formData.nationality && formData.nationality !== '日本') {
                    setStep(2)
                  } else {
                    setStep(2)
                  }
                }}
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
                次へ
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">自己紹介</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自己紹介文
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="趣味や興味、どんな人と出会いたいかなど..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <Input
                id="height"
                name="height"
                type="number"
                label="身長（cm）（任意）"
                value={formData.height}
                onChange={handleChange}
                placeholder="例：170"
              />

              <Input
                id="occupation"
                name="occupation"
                label="職業（任意）"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="例：ITエンジニア"
              />

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  戻る
                </Button>
                {formData.nationality === '日本' ? (
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    size="lg"
                    isLoading={isLoading}
                  >
                    完了
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1"
                    size="lg"
                  >
                    次へ
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 3 && formData.nationality !== '日本' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  在日関連情報（任意）
                </h2>
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  {VISA_INFO_DISCLAIMER}
                </p>
              </div>

              <Select
                id="visaType"
                name="visaType"
                label="在留資格"
                value={formData.visaType}
                onChange={handleChange}
                options={VISA_TYPE_OPTIONS}
                placeholder="選択しない"
              />

              <Input
                id="yearsInJapan"
                name="yearsInJapan"
                type="number"
                label="在日年数"
                value={formData.yearsInJapan}
                onChange={handleChange}
                placeholder="例：5"
              />

              <Select
                id="japaneseLevel"
                name="japaneseLevel"
                label="日本語能力"
                value={formData.japaneseLevel}
                onChange={handleChange}
                options={JAPANESE_LEVEL_OPTIONS}
                placeholder="選択しない"
              />

              <Select
                id="futurePlan"
                name="futurePlan"
                label="将来の計画"
                value={formData.futurePlan}
                onChange={handleChange}
                options={FUTURE_PLAN_OPTIONS}
                placeholder="選択しない"
              />

              <Input
                id="hometown"
                name="hometown"
                label="出身地"
                value={formData.hometown}
                onChange={handleChange}
                placeholder="例：上海"
              />

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">表示設定</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="showVisaType"
                    checked={formData.showVisaType}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">在留資格を公開する</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="showYearsInJapan"
                    checked={formData.showYearsInJapan}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">在日年数を公開する</span>
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  戻る
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  size="lg"
                  isLoading={isLoading}
                >
                  完了
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
