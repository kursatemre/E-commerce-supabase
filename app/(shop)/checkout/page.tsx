import { CheckoutForm } from '@/components/CheckoutForm'
import { createClient } from '@/lib/supabase/server'
import { ensureGuestId } from '@/lib/guest'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Checkout - E-Ticaret',
  description: 'Sipariş bilgilerini girip ödemeyi tamamlayabileceğiniz sayfa',
}

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

  const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Ödeme</p>
          <h1 className="text-3xl font-bold text-gray-900">Siparişinizi Tamamlayın</h1>
          <p className="text-sm text-gray-600">Teslimat ve ödeme bilgilerinizi girip siparişi onaylayabilirsiniz.</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckoutForm
              defaultFullName={`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()}
              defaultPhone={profile?.phone ?? ''}
              total={total}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Sipariş Özeti</h2>
              <div className="space-y-4">
                {cartItems.map((item: any) => {
                  const product = Array.isArray(item.products) ? item.products[0] : item.products
                  const variant = Array.isArray(item.product_variants)
                    ? item.product_variants[0]
                    : item.product_variants
                  const unitPrice = variant?.price ?? product?.price ?? 0
                  const productName = variant?.name ? `${product?.name} (${variant.name})` : product?.name
                  return (
                    <div key={item.id} className="flex items-start justify-between">
                      <div className="flex-1 space-y-1 pr-3">
                        <p className="text-sm font-semibold text-slate-900">{productName}</p>
                        <p className="text-xs text-slate-500">Adet: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {currencyFormatter.format(unitPrice * item.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-3 border-t pt-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>{currencyFormatter.format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between">
                  <span>Vergi (18%)</span>
                  <span>{currencyFormatter.format(tax)}</span>
                </div>
              </div>
              <div className="flex justify-between border-t pt-4 text-lg font-bold text-slate-900">
                <span>Toplam</span>
                <span>{currencyFormatter.format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
