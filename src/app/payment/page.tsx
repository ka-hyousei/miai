'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const method = searchParams.get('method')

  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (paymentId) {
      fetchPaymentInfo()
      // 支払い状態をポーリング
      const interval = setInterval(checkPaymentStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [paymentId])

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPayment(data)
      }
    } catch (error) {
      console.error('Error fetching payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'COMPLETED') {
          router.push('/premium?payment=success')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const handleMarkComplete = async () => {
    if (!confirm('支払いを完了しましたか？\n\n管理者に確認リクエストを送信します。')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/payments/${paymentId}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('支払い完了リクエストを送信しました。管理者の承認をお待ちください。')
        setPayment({ ...payment, status: 'PENDING_APPROVAL' })
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error}`)
      }
    } catch (error) {
      console.error('Error marking payment complete:', error)
      alert('エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const getPaymentMethodInfo = () => {
    if (method === 'WECHAT') {
      return {
        name: 'WeChat Pay (微信支付)',
        icon: '💬',
        amount: '50元',
        color: 'green',
        instructions: [
          '1. WeChatアプリを開く',
          '2. スキャン機能を選択',
          '3. 上のQRコードをスキャン',
          '4. 支払い金額（50元）を確認',
          '5. 支払いを完了',
          '6. 「支払いを完了しました」ボタンを押す',
        ],
      }
    } else {
      return {
        name: 'PayPay',
        icon: '💰',
        amount: '¥980',
        color: 'red',
        instructions: [
          '1. PayPayアプリを開く',
          '2. 「送る」を選択',
          '3. 下記のPayPay IDを入力',
          '4. 支払い金額（980円）を入力',
          '5. 送金を完了',
          '6. 「支払いを完了しました」ボタンを押す',
        ],
        paypayId: 'miai-premium', // TODO: 実際のPayPay IDに変更
      }
    }
  }

  const info = getPaymentMethodInfo()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">支払い情報が見つかりません</h1>
          <Button onClick={() => router.push('/premium')} variant="outline">
            プレミアムページに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/premium')} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{info.name}で支払い</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Payment Status */}
          {payment.status === 'PENDING_APPROVAL' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">承認待ち</p>
                  <p className="text-sm text-yellow-700">管理者が支払いを確認しています</p>
                </div>
              </div>
            </div>
          )}

          {payment.status === 'COMPLETED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">支払い完了</p>
                  <p className="text-sm text-green-700">プレミアム会員が有効になりました</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{info.icon}</div>
            <p className="text-3xl font-bold text-gray-900">{info.amount}</p>
            <p className="text-gray-600">プレミアム会員（1ヶ月）</p>
          </div>

          {/* QR Code or PayPay ID */}
          {method === 'WECHAT' ? (
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-4 border-gray-200 rounded-xl">
                <img
                  src="/qrcodes/wechat.png"
                  alt="WeChat QR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/200?text=QR+Code'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-red-700 mb-2">PayPay ID:</p>
              <p className="text-2xl font-bold text-red-800">{info.paypayId}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">支払い手順:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              {info.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {method === 'PAYPAY' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-red-600 font-semibold text-sm">
                  ※ PayPay ID: {info.paypayId}
                </p>
                <p className="text-red-600 font-semibold text-sm">
                  ※ 金額: ¥980
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {payment.status === 'PENDING' && (
            <Button
              onClick={handleMarkComplete}
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600"
              size="lg"
              isLoading={submitting}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              支払いを完了しました
            </Button>
          )}

          {payment.status === 'PENDING_APPROVAL' && (
            <div className="text-center text-gray-500 text-sm">
              <p>承認が完了すると自動的にプレミアム会員が有効になります</p>
            </div>
          )}

          {payment.status === 'COMPLETED' && (
            <Button
              onClick={() => router.push('/discover')}
              className="w-full"
              size="lg"
            >
              探索を始める
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          ※ 支払い完了後、管理者が確認してからプレミアム会員が有効になります
        </p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentContent />
    </Suspense>
  )
}
