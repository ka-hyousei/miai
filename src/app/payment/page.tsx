'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ダイアログの種類
type DialogType = 'confirm' | 'success' | 'error' | null

interface DialogState {
  type: DialogType
  title: string
  message: string
  onConfirm?: () => void
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const method = searchParams.get('method')

  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialog, setDialog] = useState<DialogState>({ type: null, title: '', message: '' })

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

  const closeDialog = () => {
    setDialog({ type: null, title: '', message: '' })
  }

  const showConfirmDialog = () => {
    setDialog({
      type: 'confirm',
      title: '支払い確認',
      message: '支払いを完了しましたか？\n\n管理者に確認リクエストを送信します。',
      onConfirm: submitPaymentComplete,
    })
  }

  const submitPaymentComplete = async () => {
    closeDialog()
    setSubmitting(true)
    try {
      const response = await fetch(`/api/payments/${paymentId}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        setPayment({ ...payment, status: 'PENDING_APPROVAL' })
        setDialog({
          type: 'success',
          title: '送信完了',
          message: '支払い完了リクエストを送信しました。\n管理者の承認をお待ちください。',
        })
      } else {
        const error = await response.json()
        setDialog({
          type: 'error',
          title: 'エラー',
          message: error.error || '処理に失敗しました',
        })
      }
    } catch (error) {
      console.error('Error marking payment complete:', error)
      setDialog({
        type: 'error',
        title: 'エラー',
        message: 'エラーが発生しました。もう一度お試しください。',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkComplete = () => {
    showConfirmDialog()
  }

  const getPaymentMethodInfo = () => {
    const isCard = payment?.plan === 'CARD'

    if (method === 'WECHAT') {
      const amount = isCard ? '15元' : '30元'
      return {
        name: 'WeChat Pay (微信支付)',
        icon: '💬',
        amount,
        color: 'green',
        instructions: [
          '1. WeChatアプリを開く',
          '2. スキャン機能を選択',
          '3. 上のQRコードをスキャン',
          `4. 支払い金額（${amount}）を確認`,
          '5. 支払いを完了',
          '6. 「支払いを完了しました」ボタンを押す',
        ],
      }
    } else {
      const amount = isCard ? '¥288' : '¥680'
      return {
        name: 'PayPay',
        icon: '💰',
        amount,
        color: 'red',
        instructions: [
          '1. PayPayアプリを開く',
          '2. 「送る」を選択',
          '3. 下記のPayPay IDを入力',
          `4. 支払い金額（${amount.replace('¥', '')}円）を入力`,
          '5. 送金を完了',
          '6. 「支払いを完了しました」ボタンを押す',
        ],
        paypayId: 'robertstonejia', // TODO: 実際のPayPay IDに変更
      }
    }
  }

  const getPlanDescription = () => {
    if (payment?.plan === 'CARD') {
      return '回数カード（3枚）'
    }
    return 'プレミアム会員（1ヶ月）'
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
                  <p className="text-sm text-green-700">
                    {payment.plan === 'CARD' ? 'カードが追加されました' : 'プレミアム会員が有効になりました'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{info.icon}</div>
            <p className="text-3xl font-bold text-gray-900">{info.amount}</p>
            <p className="text-gray-600">{getPlanDescription()}</p>
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
                  ※ 金額: {info.amount}
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
          ※ 支払い完了後、管理者が確認してから{payment?.plan === 'CARD' ? 'カードが追加' : 'プレミアム会員が有効に'}されます
        </p>
      </div>

      {/* Dialog Modal */}
      {dialog.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {dialog.type === 'confirm' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-blue-500" />
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
                    キャンセル
                  </Button>
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={dialog.onConfirm}
                  >
                    はい、完了しました
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
