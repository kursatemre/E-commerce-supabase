import { CheckoutForm } from '@/components/CheckoutForm'
import { createClient } from '@/lib/supabase/server'
import { ensureGuestId } from '@/lib/guest'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Lock, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Ödeme - E-Ticaret',
  description: 'Sipariş bilgilerini girip ödemeyi tamamlayabileceğiniz sayfa',
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export default async function CheckoutPage() {
  const supabase = await createClient()
  const guestId = await ensureGuestId()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const cartQuery = supabase
    .from('carts')
    .select(`
      id,
      guest_id,
      cart_items (
        id,
        quantity,
        variant_id,
        product_variants (
          id,
          name,
          price,
          stock,
          sku
        ),
        products (
          id,
          name,
          price,
          stock,
          product_images (url, alt)
        )
      )
    `)

  const cartPromise = user
    ? cartQuery.or(`user_id.eq.${user.id},guest_id.eq.${guestId}`).maybeSingle()
    : cartQuery.eq('guest_id', guestId).maybeSingle()

  const profilePromise = user
    ? supabase.from('profiles').select('first_name, last_name, phone').eq('id', user.id).maybeSingle()
    : Promise.resolve({ data: null })

  const [{ data: cart }, { data: profile }] = await Promise.all([cartPromise, profilePromise])

  const cartItems = cart?.cart_items ?? []

  if (!cartItems.length) {
    redirect('/cart')
  }

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const unitPrice = variant?.price ?? product?.price ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  const shipping = 0
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  return (
    <div className="section-container py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/60 mb-6">
        <Link href="/" className="hover:text-brand-dark transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cart" className="hover:text-brand-dark transition-colors">
          Sepet
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-brand-dark">Ödeme</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-2">
          Siparişinizi Tamamlayın
        </h1>
        <p className="text-brand-dark/60">
          Teslimat ve ödeme bilgilerinizi girin
        </p>
      </div>

      {/* Security Banner */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-900 text-sm">Güvenli Ödeme</p>
          <p className="text-xs text-green-700">
            Tüm ödeme bilgileriniz 256-bit SSL sertifikası ile şifrelenmektedir
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Checkout Form - Left Side */}
        <div className="lg:col-span-2">
          <CheckoutForm
            defaultFullName={`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()}
            defaultPhone={profile?.phone ?? ''}
            total={total}
          />
        </div>

        {/* Order Summary - Right Side */}
        <div className="lg:col-span-1">
          <div className="bg-surface-white rounded-2xl border border-gray-200 p-6 sticky top-4">
            <h2 className="font-heading text-xl font-bold text-brand-dark mb-6">
              Sipariş Özeti
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cartItems.map((item: any) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products
                const variant = Array.isArray(item.product_variants)
                  ? item.product_variants[0]
                  : item.product_variants
                const firstImage = product?.product_images?.[0]
                const unitPrice = variant?.price ?? product?.price ?? 0
                const productName = variant?.name ? `${product?.name} (${variant.name})` : product?.name

                return (
                  <div key={item.id} className="flex gap-3">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-surface-light rounded-lg overflow-hidden flex-shrink-0">
                      {firstImage ? (
                        <Image
                          src={firstImage.url}
                          alt={firstImage.alt || productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">
                          📦
                        </div>
                      )}
                      {/* Quantity Badge */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-action text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-dark line-clamp-2 mb-1">
                        {productName}
                      </p>
                      <p className="text-sm font-bold text-action">
                        {currencyFormatter.format(unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-t pt-6 border-gray-200">
              <div className="flex justify-between text-sm text-brand-dark/80">
                <span>Ara Toplam</span>
                <span className="font-semibold">{currencyFormatter.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-dark/80">
                <span>Kargo</span>
                <span className="font-semibold text-green-600">Ücretsiz</span>
              </div>
              <div className="flex justify-between text-sm text-brand-dark/80">
                <span>KDV (%18)</span>
                <span className="font-semibold">{currencyFormatter.format(tax)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
              <span className="font-heading text-xl font-bold text-brand-dark">Toplam</span>
              <span className="font-heading text-2xl font-bold text-action">
                {currencyFormatter.format(total)}
              </span>
            </div>

            {/* Security Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-brand-dark/60">
                <Lock className="w-4 h-4 text-action flex-shrink-0 mt-0.5" />
                <p>
                  256-bit SSL güvenlik sertifikası ile korunmaktadır
                </p>
              </div>
              <div className="flex items-start gap-2 text-xs text-brand-dark/60">
                <ShieldCheck className="w-4 h-4 text-action flex-shrink-0 mt-0.5" />
                <p>
                  3D Secure ödeme sistemi ile güvenli alışveriş
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-brand-dark/60 mb-3">Kabul Edilen Ödeme Yöntemleri:</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 bg-surface-light rounded text-xs font-semibold text-brand-dark">
                  Visa
                </div>
                <div className="px-3 py-1.5 bg-surface-light rounded text-xs font-semibold text-brand-dark">
                  Mastercard
                </div>
                <div className="px-3 py-1.5 bg-surface-light rounded text-xs font-semibold text-brand-dark">
                  Amex
                </div>
                <div className="px-3 py-1.5 bg-surface-light rounded text-xs font-semibold text-brand-dark">
                  Troy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
