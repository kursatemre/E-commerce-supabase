import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { MobileNavigation } from '@/components/shop/MobileNavigation'
import { ensureGuestId } from '@/lib/guest'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const guestId = await ensureGuestId()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
    : { data: null }

  // Get cart info
  const cartQuery = supabase
    .from('carts')
    .select(`
      id,
      cart_items (
        id,
        quantity,
        variant_id,
        product_variants (price),
        products (price)
      )
    `)

  const { data: cart } = user
    ? await cartQuery.or(`user_id.eq.${user.id},guest_id.eq.${guestId}`).maybeSingle()
    : await cartQuery.eq('guest_id', guestId).maybeSingle()

  const cartItems = cart?.cart_items ?? []
  const cartItemCount = cartItems.length
  const cartTotal = cartItems.reduce((sum: number, item: any) => {
    const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const unitPrice = variant?.price ?? product?.price ?? 0
    return sum + unitPrice * item.quantity
  }, 0)

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/shop')
  }

  return (
    <div className="min-h-screen bg-surface-white pb-16 md:pb-0">
      <ShopHeader
        user={user}
        profile={profile}
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>

      <MobileNavigation cartItemCount={cartItemCount} cartTotal={cartTotal} />
    </div>
  )
}
