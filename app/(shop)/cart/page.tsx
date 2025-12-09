import { createClient } from '@/lib/supabase/server'
import { ensureGuestId } from '@/lib/guest'
import { CartItemButtons } from '@/components/CartItemButtons'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ChevronRight, Lock, Truck, RotateCcw, Tag } from 'lucide-react'

export const metadata = {
  title: 'Sepetim - E-Ticaret',
  description: 'Alışveriş sepetinizi görüntüleyin ve ödeme adımına geçin',
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const guestId = await ensureGuestId()

  // Get cart with items
  const cartQuery = supabase
    .from('carts')
    .select(`
      id,
      user_id,
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
          slug,
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

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="section-container py-12 md:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-brand-dark/60 mb-8">
          <Link href="/" className="hover:text-brand-dark transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-brand-dark">Sepet</span>
        </nav>

        {/* Empty State */}
        <div className="max-w-md mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-surface-light rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-brand-dark/40" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-brand-dark mb-3">
            Sepetiniz Boş
          </h1>
          <p className="text-brand-dark/60 mb-8">
            Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın ve favori ürünlerinizi keşfedin!
          </p>
          <Link
            href="/"
            className="btn-cta inline-block"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    )
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
    const unitPrice = variant?.price ?? product?.price ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  return (
    <div className="section-container py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/60 mb-6">
        <Link href="/" className="hover:text-brand-dark transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-brand-dark">Sepet</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-2">
          Sepetim
        </h1>
        <p className="text-brand-dark/60">
          {cartItems.length} ürün sepetinizde
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items - Left Side */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: any) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products
            const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
            const firstImage = product?.product_images?.[0]
            const unitPrice = variant?.price ?? product?.price ?? 0
            const maxStock = variant?.stock ?? product?.stock ?? 0

            return (
              <div
                key={item.id}
                className="bg-surface-white rounded-2xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/${product.slug}`}
                    className="relative w-24 h-24 md:w-32 md:h-32 bg-surface-light rounded-xl overflow-hidden flex-shrink-0 group"
                  >
                    {firstImage ? (
                      <Image
                        src={firstImage.url}
                        alt={firstImage.alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-20">📦</span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${product.slug}`}
                      className="font-heading font-semibold text-brand-dark hover:text-action transition-colors line-clamp-2 block mb-1"
                    >
                      {product.name}
                    </Link>

                    {variant && (
                      <p className="text-sm text-brand-dark/60 mb-2">
                        Varyant: {variant.name}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="mt-3">
                      <CartItemButtons itemId={item.id} quantity={item.quantity} maxStock={maxStock} />
                    </div>
                  </div>

                  {/* Price - Right Side */}
                  <div className="text-right flex flex-col justify-between">
                    <div>
                      <p className="text-lg md:text-xl font-bold text-brand-dark">
                        {currencyFormatter.format(unitPrice * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-brand-dark/60">
                          {currencyFormatter.format(unitPrice)} / adet
                        </p>
                      )}
                    </div>

                    {/* Stock Warning */}
                    {maxStock > 0 && maxStock <= 5 && (
                      <p className="text-xs text-action font-medium mt-2">
                        Son {maxStock} ürün!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="flex flex-col items-center text-center p-3 bg-surface-light rounded-xl">
              <Truck className="w-6 h-6 text-action mb-2" />
              <p className="text-xs font-medium text-brand-dark">Ücretsiz Kargo</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-surface-light rounded-xl">
              <RotateCcw className="w-6 h-6 text-action mb-2" />
              <p className="text-xs font-medium text-brand-dark">Kolay İade</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-surface-light rounded-xl">
              <Lock className="w-6 h-6 text-action mb-2" />
              <p className="text-xs font-medium text-brand-dark">Güvenli Ödeme</p>
            </div>
          </div>
        </div>

        {/* Order Summary - Right Side */}
        <div className="lg:col-span-1">
          <div className="bg-surface-white rounded-2xl border border-gray-200 p-6 sticky top-4">
            <h2 className="font-heading text-xl font-bold text-brand-dark mb-6">
              Sipariş Özeti
            </h2>

            {/* Discount Code */}
            <div className="mb-6 p-4 bg-surface-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-action" />
                <p className="text-sm font-medium text-brand-dark">İndirim Kodunuz Var mı?</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kodu girin"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-action/50"
                />
                <button className="px-4 py-2 text-sm font-semibold text-action border border-action rounded-lg hover:bg-action hover:text-white transition-colors">
                  Uygula
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-brand-dark/80">
                <span>Ara Toplam</span>
                <span className="font-semibold">{currencyFormatter.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-dark/80">
                <span>Kargo</span>
                <span className="font-semibold text-green-600">Ücretsiz</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-heading text-xl font-bold text-brand-dark">Toplam</span>
              <span className="font-heading text-2xl font-bold text-action">
                {currencyFormatter.format(total)}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="btn-cta btn-cta-lg w-full text-center mb-4 flex items-center justify-center gap-2"
            >
              Ödemeye Geç
              <ChevronRight className="w-5 h-5" />
            </Link>

            {/* Continue Shopping */}
            <Link
              href="/"
              className="block text-center text-brand-dark hover:text-action transition-colors font-medium"
            >
              Alışverişe Devam Et
            </Link>

            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3 text-sm text-brand-dark/60">
                <Lock className="w-4 h-4 text-action flex-shrink-0 mt-0.5" />
                <p className="text-xs">
                  Ödeme bilgileriniz SSL sertifikası ile korunmaktadır. Güvenli alışveriş garantisi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="sticky-cta-footer lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-dark/60 mb-1">Toplam</p>
            <p className="text-xl font-bold text-brand-dark">
              {currencyFormatter.format(total)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="btn-cta flex items-center gap-2"
          >
            Ödemeye Geç
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
