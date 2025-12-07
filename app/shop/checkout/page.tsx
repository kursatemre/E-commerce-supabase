import type { InputHTMLAttributes } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/shop/checkout')
  }

  const [{ data: cart }, { data: profile }] = await Promise.all([
    supabase
      .from('carts')
      .select(
        `
        id,
        cart_items (
          id,
          quantity,
          variant_id,
          product_variants ( id, name, price, stock ) ,
          products (
            id,
            name,
            price,
            product_images ( url, alt )
          )
        )
      `,
      )
      .eq('user_id', user.id)
      .single(),
    supabase.from('profiles').select('first_name, last_name, phone').eq('id', user.id).maybeSingle(),
  ])

  const cartItems = cart?.cart_items ?? []

  if (!cartItems.length) {
    return (
      <div className="space-y-4 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-5xl">🧾</p>
        <h1 className="text-2xl font-semibold text-gray-900">Sepetiniz boş</h1>
        <p className="text-sm text-gray-500">Ödeme adımına geçmeden önce ürün ekleyin.</p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Alışverişe Dön
        </Link>
      </div>
    )
  }

  const total = cartItems.reduce((sum: number, item: any) => {
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const unitPrice = variant?.price ?? product?.price ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  const fullNamePrefill = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const phonePrefill = profile?.phone ?? ''

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Ödeme</p>
        <h1 className="text-3xl font-semibold text-gray-900">Siparişinizi Tamamlayın</h1>
        <p className="text-sm text-gray-600">Teslimat bilgilerinizi doğrulayın, ödeme tercihini seçin ve siparişi onaylayın.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <form action="/shop/checkout" method="post" className="space-y-6 lg:col-span-2">
          <section className="space-y-4 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Teslimat</p>
              <h2 className="text-lg font-semibold text-gray-900">Adres Bilgileri</h2>
              <p className="text-sm text-gray-500">Kargoyu yönlendireceğimiz adresi paylaşın.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ad Soyad" name="fullName" defaultValue={fullNamePrefill} required />
              <Field label="Telefon" name="phone" type="tel" defaultValue={phonePrefill} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="address">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
                placeholder="Mahalle, sokak, no, daire"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="İl / Şehir" name="city" required />
              <Field label="İlçe" name="district" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Posta Kodu" name="zipCode" type="text" inputMode="numeric" required />
              <Field label="Not ( opsiyonel )" name="notes" placeholder="Kurye notu" />
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Ödeme</p>
              <h2 className="text-lg font-semibold text-gray-900">Yöntem Seçimi</h2>
              <p className="text-sm text-gray-500">EFT veya kapıda ödeme tercih edebilirsiniz.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption id="pay-card" label="Kart / EFT" value="card" description="Ödeme onayı bekleyen" defaultChecked />
              <PaymentOption id="pay-cod" label="Kapıda Ödeme" value="cod" description="Teslimatta nakit" />
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
              Siparişiniz admin panelinde manuel olarak onaylandığında ödeme durumunuz güncellenir.
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/shop/cart" className="text-sm font-semibold text-gray-600 hover:text-gray-800">
              Sepete Dön
            </Link>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
            >
              Siparişi Onayla
            </button>
          </div>
        </form>

        <aside className="space-y-4 rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Özet</p>
            <h2 className="text-lg font-semibold text-gray-900">Sipariş Detayı</h2>
          </div>
          <ul className="space-y-3">
            {cartItems.map((item: any) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products
              const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
              const firstImage = product?.product_images?.[0]
              const unitPrice = variant?.price ?? product?.price ?? 0
              return (
                <li key={item.id} className="flex gap-3 rounded-2xl border border-gray-100 p-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {firstImage ? (
                      <Image src={firstImage.url} alt={firstImage.alt || product?.name || 'Ürün'} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{product?.name}</p>
                    {variant?.name && <p className="text-xs text-gray-500">{variant.name}</p>}
                    <p className="text-xs text-gray-500">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {currencyFormatter.format(unitPrice * item.quantity)}
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Ara Toplam</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Kargo</span>
              <span className="text-emerald-600">Ücretsiz</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-base font-semibold text-gray-900">Genel Toplam</span>
            <span className="text-lg font-bold text-gray-900">{currencyFormatter.format(total)}</span>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
            Sipariş bilgileriniz Supabase üzerindeki &apos;orders&apos; tablosuna kaydedilir. İade / değişim taleplerini
            hesap &gt; siparişlerim alanından başlatabilirsiniz.
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, name, required, defaultValue, placeholder, type = 'text', inputMode }: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
  type?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

function PaymentOption({ id, label, value, description, defaultChecked }: {
  id: string
  label: string
  value: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 shadow-sm hover:border-blue-400"
    >
      <input
        type="radio"
        id={id}
        name="paymentMethod"
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-blue-600"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  )
}
