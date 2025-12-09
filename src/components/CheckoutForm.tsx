'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Wallet } from 'lucide-react'

export type CheckoutFormValues = {
  fullName: string
  phone: string
  address: string
  city: string
  district?: string
  zipCode: string
  notes?: string
  paymentMethod?: string
}

interface CheckoutFormProps {
  defaultFullName?: string
  defaultPhone?: string
  total: number
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function CheckoutForm({
  defaultFullName = '',
  defaultPhone = '',
  total,
}: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    fullName: defaultFullName,
    phone: defaultPhone,
    address: '',
    city: '',
    district: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'card',
  })

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, paymentMethod: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    if (
      !formValues.fullName.trim() ||
      !formValues.phone.trim() ||
      !formValues.address.trim() ||
      !formValues.city.trim() ||
      !formValues.zipCode.trim()
    ) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sipariş oluşturulamadı')
      }

      router.push(data.redirectUrl || '/?success=Siparişiniz başarıyla oluşturuldu')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Delivery Information */}
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-surface-white p-6">
        <div className="mb-4">
          <h2 className="font-heading text-xl font-bold text-brand-dark mb-1">
            Teslimat Bilgileri
          </h2>
          <p className="text-sm text-brand-dark/60">
            Kargoyu yönlendireceğimiz adresi paylaşın
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-dark">
              Ad Soyad <span className="text-action">*</span>
            </span>
            <input
              name="fullName"
              type="text"
              value={formValues.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors"
              placeholder="Ad ve soyadınızı girin"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-dark">
              Telefon <span className="text-action">*</span>
            </span>
            <input
              name="phone"
              type="tel"
              value={formValues.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors"
              placeholder="0555 555 55 55"
              required
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-dark">
            Adres <span className="text-action">*</span>
          </span>
          <textarea
            name="address"
            rows={3}
            value={formValues.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors resize-none"
            placeholder="Mahalle, sokak, bina no, daire no"
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-dark">
              İl / Şehir <span className="text-action">*</span>
            </span>
            <input
              name="city"
              type="text"
              value={formValues.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors"
              placeholder="İstanbul"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-dark">İlçe</span>
            <input
              name="district"
              type="text"
              value={formValues.district}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors"
              placeholder="Kadıköy"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-dark">
              Posta Kodu <span className="text-action">*</span>
            </span>
            <input
              name="zipCode"
              type="text"
              inputMode="numeric"
              value={formValues.zipCode}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors"
              placeholder="34000"
              required
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-dark">
            Teslimat Notu <span className="text-xs text-brand-dark/60">(Opsiyonel)</span>
          </span>
          <input
            name="notes"
            type="text"
            value={formValues.notes}
            onChange={handleChange}
            placeholder="Kapı zili çalışmıyor, arayın lütfen"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-action/50 focus:border-action transition-colors"
          />
        </label>
      </section>

      {/* Payment Method */}
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-surface-white p-6">
        <div className="mb-4">
          <h2 className="font-heading text-xl font-bold text-brand-dark mb-1">
            Ödeme Yöntemi
          </h2>
          <p className="text-sm text-brand-dark/60">
            Kredi kartı veya kapıda ödeme seçeneklerinden birini seçin
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
              formValues.paymentMethod === 'card'
                ? 'border-action bg-action/5'
                : 'border-gray-200 hover:border-gray-300 bg-surface-light'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formValues.paymentMethod === 'card'}
              onChange={handleRadioChange}
              className="sr-only"
            />
            <div className="flex-shrink-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formValues.paymentMethod === 'card'
                    ? 'border-action'
                    : 'border-gray-300'
                }`}
              >
                {formValues.paymentMethod === 'card' && (
                  <div className="w-3 h-3 rounded-full bg-action" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-action" />
              <div>
                <p className="font-semibold text-brand-dark">Kredi Kartı</p>
                <p className="text-xs text-brand-dark/60">Güvenli 3D ödeme</p>
              </div>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
              formValues.paymentMethod === 'cod'
                ? 'border-action bg-action/5'
                : 'border-gray-200 hover:border-gray-300 bg-surface-light'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formValues.paymentMethod === 'cod'}
              onChange={handleRadioChange}
              className="sr-only"
            />
            <div className="flex-shrink-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formValues.paymentMethod === 'cod'
                    ? 'border-action'
                    : 'border-gray-300'
                }`}
              >
                {formValues.paymentMethod === 'cod' && (
                  <div className="w-3 h-3 rounded-full bg-action" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-action" />
              <div>
                <p className="font-semibold text-brand-dark">Kapıda Ödeme</p>
                <p className="text-xs text-brand-dark/60">Nakit veya kart</p>
              </div>
            </div>
          </label>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
          <p className="font-semibold mb-1">Not:</p>
          Siparişiniz admin panelinde manuel olarak onaylandığında ödeme durumunuz güncellenir.
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
        <div className="text-center sm:text-left">
          <p className="text-sm text-brand-dark/60 mb-1">Ödenecek Tutar</p>
          <p className="text-2xl font-bold text-brand-dark">
            {currencyFormatter.format(total)}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-cta btn-cta-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'İşleniyor...' : 'Siparişi Onayla'}
        </button>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="sticky-cta-footer sm:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-brand-dark/60 mb-1">Toplam</p>
            <p className="text-xl font-bold text-brand-dark">
              {currencyFormatter.format(total)}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-cta disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İşleniyor...' : 'Siparişi Onayla'}
          </button>
        </div>
      </div>
    </form>
  )
}
