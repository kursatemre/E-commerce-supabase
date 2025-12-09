import { createClient } from '@/lib/supabase/server'
import { ensureGuestId } from '@/lib/guest'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const guestId = await ensureGuestId()

    const cartQuery = supabase
      .from('carts')
      .select(`
        id,
        cart_items (
          id,
          quantity,
          variant_id,
          product_variants (
            id,
            name,
            price
          ),
          products (
            id,
            name,
            slug,
            price,
            product_images (url, alt)
          )
        )
      `)

    const { data: cart } = user
      ? await cartQuery.or(`user_id.eq.${user.id},guest_id.eq.${guestId}`).maybeSingle()
      : await cartQuery.eq('guest_id', guestId).maybeSingle()

    const cartItems = cart?.cart_items || []

    // Transform data structure
    const items = cartItems.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: Array.isArray(item.products) ? item.products[0]?.id : item.products?.id,
        name: Array.isArray(item.products) ? item.products[0]?.name : item.products?.name,
        slug: Array.isArray(item.products) ? item.products[0]?.slug : item.products?.slug,
        price: Array.isArray(item.products) ? item.products[0]?.price : item.products?.price,
        images: Array.isArray(item.products) ? item.products[0]?.product_images : item.products?.product_images,
      },
      variant: item.variant_id ? {
        id: Array.isArray(item.product_variants) ? item.product_variants[0]?.id : item.product_variants?.id,
        name: Array.isArray(item.product_variants) ? item.product_variants[0]?.name : item.product_variants?.name,
        price: Array.isArray(item.product_variants) ? item.product_variants[0]?.price : item.product_variants?.price,
      } : undefined,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
