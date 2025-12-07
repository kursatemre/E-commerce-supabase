'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ensureGuestId } from '@/lib/guest'

export async function addToCart(productId: string, variantId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const guestId = await ensureGuestId()

  try {
    const { data: product } = await supabase
      .from('products')
      .select('id, stock, is_active')
      .eq('id', productId)
      .single()

    if (!product || !product.is_active) {
      redirect('/shop?error=Ürün bulunamadı veya yayında değil')
    }

    let availableStock = product.stock

    if (variantId) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('id, stock, is_active')
        .eq('id', variantId)
        .eq('product_id', productId)
        .single()

      if (!variant || !variant.is_active) {
        redirect('/shop?error=Bu varyant satılamıyor')
      }

      availableStock = variant.stock || 0
    }

    if (!availableStock || availableStock <= 0) {
      redirect('/shop?error=Stokta yok')
    }

    // Get or create cart
    let { data: cart } = user
      ? await supabase.from('carts').select('id').or(`user_id.eq.${user.id},guest_id.eq.${guestId}`).maybeSingle()
      : await supabase.from('carts').select('id').eq('guest_id', guestId).maybeSingle()

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({ user_id: user?.id ?? null, guest_id: guestId })
        .select('id')
        .single()

      if (cartError) throw cartError
      cart = newCart
    }

    // Check if product already in cart
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
      if (existingItem.quantity >= availableStock) {
        redirect('/shop?error=Bu seçenek için daha fazla stok yok')
      }
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id)

      if (error) throw error
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId || null,
          quantity: 1
        })

      if (error) throw error
    }

    revalidatePath('/shop')
    revalidatePath('/shop/cart')
  } catch (error) {
    console.error('Error adding to cart:', error)
    redirect('/shop?error=Sepete eklenirken bir hata oluştu')
  }

  redirect('/shop?success=Ürün sepete eklendi')
}

export async function updateCartItem(itemId: string, quantity: number) {
  const supabase = await createClient()

  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Error removing item:', error)
    }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)

    if (error) {
      console.error('Error updating quantity:', error)
    }
  }

  revalidatePath('/shop/cart')
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    console.error('Error removing item:', error)
  }

  revalidatePath('/shop/cart')
}
