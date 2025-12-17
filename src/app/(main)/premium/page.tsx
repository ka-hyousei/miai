'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Crown, Check, Heart, MessageCircle, Eye, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PaymentMethod = 'PAYPAY' | 'WECHAT'

export default function PremiumPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('PAYPAY')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSubscription()
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'PREMIUM',
          paymentMethod: selectedPaymentMethod,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/payment?paymentId=${data.payment.id}&method=${selectedPaymentMethod}`)
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('支払いの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const MONTHLY_FEE_JPY = 980
  const MONTHLY_FEE_CNY = 50

  const getAmount = () => {
    if (selectedPaymentMethod === 'PAYPAY') {
      return `¥${MONTHLY_FEE_JPY.toLocaleString()}`
    } else {
      return `${MONTHLY_FEE_CNY}元`
    }
  }

  // Check if subscription is active
  const now = new Date()
  const hasActiveSubscription =
    subscription?.status === 'ACTIVE' &&
    subscription?.endDate &&
    new Date(subscription.endDate) > now

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="md:ml-64 min-h-screen bg-gradient-to-b from-pink-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プレミアム会員</h1>
          <p className="text-gray-600">もっと出会いのチャンスを広げましょう</p>
        </div>

        {/* Current Status */}
        {hasActiveSubscription && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800">プレミアム会員</h3>
                <p className="text-sm text-yellow-700">
                  有効期限: {new Date(subscription.endDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">プレミアム特典</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">連絡先の閲覧</h3>
                <p className="text-sm text-gray-600">
                  「有料会員のみ」に設定されている連絡先を見ることができます
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">いいね無制限</h3>
                <p className="text-sm text-gray-600">
                  1日のいいね数に制限がなくなります
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">メッセージ既読確認</h3>
                <p className="text-sm text-gray-600">
                  相手がメッセージを読んだかどうか確認できます
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">プレミアムバッジ</h3>
                <p className="text-sm text-gray-600">
                  プロフィールにプレミアムバッジが表示されます
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">料金プラン</h2>
          <div className="text-center py-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl mb-6">
            <p className="text-4xl font-bold text-pink-500">{getAmount()}</p>
            <p className="text-gray-600">/ 月</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>いつでも解約可能</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>即座にプレミアム機能が利用可能</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        {!hasActiveSubscription && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">支払い方法を選択</h2>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PAYPAY"
                  checked={selectedPaymentMethod === 'PAYPAY'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-5 h-5 text-pink-500"
                />
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">PayPay</p>
                  <p className="text-sm text-gray-500">¥{MONTHLY_FEE_JPY.toLocaleString()} / 月</p>
                </div>
                <span className="text-2xl">💰</span>
              </label>

              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WECHAT"
                  checked={selectedPaymentMethod === 'WECHAT'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-5 h-5 text-pink-500"
                />
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">WeChat Pay (微信支付)</p>
                  <p className="text-sm text-gray-500">{MONTHLY_FEE_CNY}元 / 月</p>
                </div>
                <span className="text-2xl">💬</span>
              </label>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong> 一度購入されたプランの料金については返金いたしません。
              </p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              size="lg"
              isLoading={loading}
            >
              <Crown className="w-5 h-5 mr-2" />
              {getAmount()}/月 でプレミアムに登録
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
