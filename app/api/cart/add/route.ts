import { createClient } from '@/lib/supabase/server'
import { ensureGuestId } from '@/lib/guest'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const guestId = await ensureGuestId()

  try {
    const { productId, variantId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Check product exists and is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, is_active')
      .eq('id', productId)
      .single()

    if (productError || !product || !product.is_active) {
      return NextResponse.json({ error: 'Ürün bulunamadı veya satışta değil' }, { status: 404 })
    }

    let availableStock = product.stock

    // If variant is specified, check variant stock
    if (variantId) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, stock, is_active')
        .eq('id', variantId)
        .eq('product_id', productId)
        .single()

      if (variantError || !variant || !variant.is_active) {
        return NextResponse.json({ error: 'Bu varyant satışta değil' }, { status: 404 })
      }

      availableStock = variant.stock || 0
    }

    if (!availableStock || availableStock <= 0) {
      return NextResponse.json({ error: 'Stokta yok' }, { status: 400 })
    }

    // Get or create cart
    let cartQuery = supabase.from('carts').select('id')

    if (user) {
      cartQuery = cartQuery.or(`user_id.eq.${user.id},guest_id.eq.${guestId}`)
    } else {
      cartQuery = cartQuery.eq('guest_id', guestId)
    }

    let { data: cart } = await cartQuery.maybeSingle()

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({ user_id: user?.id ?? null, guest_id: guestId })
        .select('id')
        .single()

      if (cartError) {
        console.error('Cart creation error:', cartError)
        return NextResponse.json({ error: 'Sepet oluşturulamadı' }, { status: 500 })
      }
      cart = newCart
    }

    // Check if item already exists in cart
    let existingQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)

    if (variantId) {
      existingQuery = existingQuery.eq('variant_id', variantId)
    } else {
      existingQuery = existingQuery.is('variant_id', null)
    }

    const { data: existingItem } = await existingQuery.maybeSingle()

    if (existingItem) {
      // Check if we can add more
      if (existingItem.quantity >= availableStock) {
        return NextResponse.json({ error: 'Stok yetersiz' }, { status: 400 })
      }

      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id)

      if (updateError) {
        console.error('Cart update error:', updateError)
        return NextResponse.json({ error: 'Sepet güncellenemedi' }, { status: 500 })
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId || null,
          quantity: 1
        })

      if (insertError) {
        console.error('Cart insert error:', insertError)
        return NextResponse.json({ error: 'Sepete eklenemedi' }, { status: 500 })
      }
    }

    revalidatePath('/shop')
    revalidatePath('/shop/cart')
    return NextResponse.json({ success: true, message: 'Ürün sepete eklendi' })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
