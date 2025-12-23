'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Crown, Check, Heart, MessageCircle, Eye, Shield, CreditCard, Ticket, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PaymentMethod = 'PAYPAY' | 'WECHAT'
type PlanType = 'PREMIUM' | 'CARD'

export default function PremiumPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const t = useTranslations('premium')
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [contactCards, setContactCards] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('PAYPAY')
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('PREMIUM')
  const [errorDialog, setErrorDialog] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSubscription()
      fetchContactCards()
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

  const fetchContactCards = async () => {
    try {
      const response = await fetch('/api/contact-views')
      if (response.ok) {
        const data = await response.json()
        setContactCards(data.contactCards || 0)
      }
    } catch (error) {
      console.error('Error fetching contact cards:', error)
    }
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: selectedPaymentMethod,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/payment?paymentId=${data.payment.id}&method=${selectedPaymentMethod}`)
      } else {
        const error = await response.json()
        setErrorDialog(error.error || t('paymentError'))
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      setErrorDialog(t('paymentError'))
    } finally {
      setLoading(false)
    }
  }

  // Pricing
  const MONTHLY_FEE_JPY = 680
  const MONTHLY_FEE_CNY = 30
  const CARD_FEE_JPY = 288
  const CARD_FEE_CNY = 15

  const getAmount = (plan: PlanType) => {
    if (plan === 'PREMIUM') {
      return selectedPaymentMethod === 'PAYPAY'
        ? `¥${MONTHLY_FEE_JPY.toLocaleString()}`
        : `${MONTHLY_FEE_CNY}元`
    } else {
      return selectedPaymentMethod === 'PAYPAY'
        ? `¥${CARD_FEE_JPY.toLocaleString()}`
        : `${CARD_FEE_CNY}元`
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
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-pink-100 rounded-full mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-pink-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Current Status */}
        {hasActiveSubscription && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800">{t('premiumPlan')}</h3>
                <p className="text-sm text-yellow-700">
                  {t('validUntil')}: {new Date(subscription.endDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card Balance */}
        {contactCards > 0 && (
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <Ticket className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-blue-800">{t('cardBalance')}</h3>
                <p className="text-sm text-blue-700">
                  {t('remainingCards', { count: contactCards })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('benefits')}</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('benefit4')}</h3>
                <p className="text-sm text-gray-600">
                  {t('benefit4Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('benefit1')}</h3>
                <p className="text-sm text-gray-600">
                  {t('benefit1Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('benefit2')}</h3>
                <p className="text-sm text-gray-600">
                  {t('benefit2Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('benefit3')}</h3>
                <p className="text-sm text-gray-600">
                  {t('benefit3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('pricingPlan')}</h2>

          {/* Plan Selection */}
          <div className="space-y-4 mb-6">
            {/* Premium Plan */}
            <label
              className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedPlan === 'PREMIUM'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="plan"
                  value="PREMIUM"
                  checked={selectedPlan === 'PREMIUM'}
                  onChange={() => setSelectedPlan('PREMIUM')}
                  className="w-5 h-5 text-pink-500"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <p className="font-bold text-gray-900">{t('monthlyPlan')}</p>
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                      {t('recommended')}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-pink-500 mt-1">
                    {getAmount('PREMIUM')}<span className="text-sm font-normal text-gray-600"> {t('perMonth')}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{t('unlimitedViewing')}</p>
                </div>
              </div>
            </label>

            {/* Card Plan */}
            <label
              className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedPlan === 'CARD'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="plan"
                  value="CARD"
                  checked={selectedPlan === 'CARD'}
                  onChange={() => setSelectedPlan('CARD')}
                  className="w-5 h-5 text-pink-500"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-blue-500" />
                    <p className="font-bold text-gray-900">{t('cardPlan')}</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-500 mt-1">
                    {getAmount('CARD')}<span className="text-sm font-normal text-gray-600"> / 3{t('cards')}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{t('cardPlanDesc')}</p>
                </div>
              </div>
            </label>
          </div>

          {/* Plan Benefits Summary */}
          <div className="space-y-2 text-sm text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg">
            {selectedPlan === 'PREMIUM' ? (
              <>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('unlimitedViewing')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('cancelAnytime')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('instantAccess')}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('cardBenefit1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('cardBenefit2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('cardBenefit3')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('selectPayment')}</h2>

          <div className="space-y-3">
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              selectedPaymentMethod === 'PAYPAY' ? 'border-pink-300 bg-pink-50' : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="PAYPAY"
                checked={selectedPaymentMethod === 'PAYPAY'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                className="w-5 h-5 text-pink-500"
              />
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-900">{t('paypay')}</p>
                <p className="text-sm text-gray-500">
                  {selectedPlan === 'PREMIUM'
                    ? `¥${MONTHLY_FEE_JPY.toLocaleString()} ${t('perMonth')}`
                    : `¥${CARD_FEE_JPY.toLocaleString()} / 3${t('cards')}`
                  }
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </label>

            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              selectedPaymentMethod === 'WECHAT' ? 'border-pink-300 bg-pink-50' : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="WECHAT"
                checked={selectedPaymentMethod === 'WECHAT'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                className="w-5 h-5 text-pink-500"
              />
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-900">{t('wechatPay')}</p>
                <p className="text-sm text-gray-500">
                  {selectedPlan === 'PREMIUM'
                    ? `${MONTHLY_FEE_CNY}元 ${t('perMonth')}`
                    : `${CARD_FEE_CNY}元 / 3${t('cards')}`
                  }
                </p>
              </div>
              <span className="text-2xl">💬</span>
            </label>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {t('noRefund')}
            </p>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className={`w-full mt-6 ${
              selectedPlan === 'PREMIUM'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
            }`}
            size="lg"
            isLoading={loading}
          >
            {selectedPlan === 'PREMIUM' ? (
              <Crown className="w-5 h-5 mr-2" />
            ) : (
              <Ticket className="w-5 h-5 mr-2" />
            )}
            {getAmount(selectedPlan)} {selectedPlan === 'PREMIUM' ? t('subscribeButton') : t('buyCardsButton')}
          </Button>
        </div>
      </div>

      {/* Error Dialog */}
      {errorDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {t('paymentError')}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {errorDialog}
            </p>
            <Button
              className="w-full bg-gray-500 hover:bg-gray-600"
              onClick={() => setErrorDialog(null)}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
