import { createClient } from '@/lib/supabase/server'
import { ensureGuestId } from '@/lib/guest'
import Link from 'next/link'
import Image from 'next/image'
import { updateCartItem, removeFromCart } from '@/actions/shop'

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const guestId = await ensureGuestId()

  // Get cart with items
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
          stock
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

  const { data: cart } = user
    ? await cartQuery.or(`user_id.eq.${user.id},guest_id.eq.${guestId}`).maybeSingle()
    : await cartQuery.eq('guest_id', guestId).maybeSingle()

  const cartItems = cart?.cart_items || []

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-4">Sepetiniz Boş</h1>
        <Link
          href="/shop"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Alışverişe Başla
        </Link>
      </div>
    )
  }

  const total = cartItems.reduce((sum: number, item: any) => {
    const product = item.products
    const variant = item.product_variants
    const unitPrice = variant?.price ?? product.price
    return sum + unitPrice * item.quantity
  }, 0)

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: any) => {
            const product = item.products
            const variant = item.product_variants
            const firstImage = product.product_images?.[0]
            const unitPrice = variant?.price ?? product.price
            const maxStock = variant?.stock ?? product.stock

            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                  {firstImage ? (
                    <Image
                      src={firstImage.url}
                      alt={firstImage.alt || product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">📦</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  {variant && (
                    <p className="text-sm text-gray-500">Seçenek: {variant.name || 'SKU'}</p>
                  )}
                  <p className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(unitPrice)}
                  </p>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <form action={updateCartItem.bind(null, item.id, item.quantity - 1)}>
                        <button
                          type="submit"
                          className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100"
                        >
                          −
                        </button>
                      </form>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <form action={updateCartItem.bind(null, item.id, item.quantity + 1)}>
                        <button
                          type="submit"
                          disabled={item.quantity >= maxStock}
                          className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </form>
                    </div>

                    <form action={removeFromCart.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam</span>
                <span>
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(total)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Kargo</span>
                <span className="text-green-600">Ücretsiz</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Toplam</span>
                <span>
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(total)}
                </span>
              </div>
            </div>

            <Link
              href="/shop/checkout"
              className="block w-full rounded-md bg-blue-600 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Ödeme Adımına Geç
            </Link>

            <Link
              href="/shop"
              className="block text-center text-blue-600 hover:text-blue-700 mt-4"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
