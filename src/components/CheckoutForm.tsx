'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Teslimat</p>
          <h2 className="text-lg font-semibold text-gray-900">Adres Bilgileri</h2>
          <p className="text-sm text-gray-500">Kargoyu yönlendireceğimiz adresi paylaşın.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Ad Soyad *
            <input
              name="fullName"
              type="text"
              value={formValues.fullName}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Telefon *
            <input
              name="phone"
              type="tel"
              value={formValues.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
        </div>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Adres *
          <textarea
            name="address"
            rows={3}
            value={formValues.address}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="Mahalle, sokak, no, daire"
            required
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-gray-700">
            İl / Şehir *
            <input
              name="city"
              type="text"
              value={formValues.city}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            İlçe
            <input
              name="district"
              type="text"
              value={formValues.district}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Posta Kodu *
            <input
              name="zipCode"
              type="text"
              inputMode="numeric"
              value={formValues.zipCode}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Not (opsiyonel)
            <input
              name="notes"
              type="text"
              value={formValues.notes}
              onChange={handleChange}
              placeholder="Kurye notu"
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Ödeme</p>
          <h2 className="text-lg font-semibold text-gray-900">Yöntem Seçimi</h2>
          <p className="text-sm text-gray-500">EFT veya kapıda ödeme tercih edebilirsiniz.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 shadow-sm hover:border-blue-400">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formValues.paymentMethod === 'card'}
              onChange={handleRadioChange}
              className="h-4 w-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Kart / EFT</p>
              <p className="text-xs text-gray-500">Ödeme onayı bekleyen</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 shadow-sm hover:border-blue-400">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formValues.paymentMethod === 'cod'}
              onChange={handleRadioChange}
              className="h-4 w-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Kapıda Ödeme</p>
              <p className="text-xs text-gray-500">Teslimatta nakit</p>
            </div>
          </label>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
          Siparişiniz admin panelinde manuel olarak onaylandığında ödeme durumunuz güncellenir.
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'İşleniyor...' : 'Siparişi Onayla'}
        </button>
        <p className="text-sm text-gray-500">Toplam: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)}</p>
      </div>
    </form>
  )
}
