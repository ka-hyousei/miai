'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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

export default function ProfileEditPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    showContact: true,  // デフォルト公開
    contactVisibility: 'EVERYONE',  // デフォルト全員に公開
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

      setSuccess('プロフィールを更新しました')
      alert('プロフィールを更新しました')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロフィールの更新に失敗しました'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
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
    <div className="min-h-screen bg-gray-50 md:ml-64">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/mypage" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">プロフィール編集</h1>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <div className="space-y-4">
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
            </div>
          </div>

          {/* 自己紹介 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">自己紹介</h2>
            <div className="space-y-4">
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
            </div>
          </div>

          {/* 在日関連情報 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">在日関連情報（任意）</h2>
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mb-4">
              {VISA_INFO_DISCLAIMER}
            </p>
            <div className="space-y-4">
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
                id="nationality"
                name="nationality"
                label="国籍"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="例：中国"
              />

              <Input
                id="hometown"
                name="hometown"
                label="出身地"
                value={formData.hometown}
                onChange={handleChange}
                placeholder="例：上海"
              />
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">連絡先情報（任意）</h2>
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mb-4">
              連絡先は任意です。入力した場合、「連絡先を公開する」をオンにすると他のユーザーに表示されます。
            </p>
            <div className="space-y-4">
              <Input
                id="wechatId"
                name="wechatId"
                label="WeChat ID"
                value={formData.wechatId}
                onChange={handleChange}
                placeholder="例：wxid_xxxxx"
              />

              <Input
                id="phoneNumber"
                name="phoneNumber"
                label="電話番号"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="例：090-1234-5678"
              />

              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                label="連絡用メールアドレス"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="例：example@email.com"
              />
            </div>
          </div>

          {/* 表示設定 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">表示設定</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="showContact"
                  checked={formData.showContact}
                  onChange={handleChange}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-600">連絡先を公開する（WeChat・電話番号・メール）</span>
              </label>

              {formData.showContact && (
                <div className="ml-7">
                  <Select
                    id="contactVisibility"
                    name="contactVisibility"
                    label="公開対象"
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
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            保存する
          </Button>
        </form>
      </div>
    </div>
  )
}
