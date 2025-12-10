'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ensureGuestId } from '@/lib/guest'

export async function searchProducts(query: string) {
  if (!query || query.trim().length < 2) {
    return { products: [], count: 0 }
  }

  const supabase = await createClient()
  const searchTerm = `%${query.trim()}%`

  const { data: products, error, count } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      product_images (
        url,
        alt
      )
    `, { count: 'exact' })
    .eq('is_active', true)
    .ilike('name', searchTerm)
    .order('name', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Search error:', error)
    return { products: [], count: 0 }
  }

  return {
    products: products || [],
    count: count || 0
  }
}

export async function findVariantByOptions(
  productId: string,
  selectedOptions: Record<string, string>
): Promise<string | null> {
  const supabase = await createClient()

  try {
    // Get all variant types for this product with their options
    const { data: variantTypes } = await supabase
      .from('variant_types')
      .select(`
        id,
        name,
        variant_options(id, value)
      `)
      .eq('product_id', productId)
      .eq('is_active', true)

    if (!variantTypes || variantTypes.length === 0) {
      return null
    }

    // Build array of selected option IDs
    const selectedOptionIds: string[] = []
    for (const vt of variantTypes) {
      const selectedValue = selectedOptions[vt.id]
      if (!selectedValue) continue

      const option = (vt.variant_options as any[])?.find((vo: any) => vo.value === selectedValue)
      if (option) {
        selectedOptionIds.push(option.id)
      }
    }

    // Find matching product variant
    const { data: variants } = await supabase
      .from('product_variants')
      .select(`
        id,
        variant_option_values!inner(variant_option_id)
      `)
      .eq('product_id', productId)
      .eq('is_active', true)

    // Find variant that has all the selected option IDs
    const matchingVariant = variants?.find((v: any) => {
      const variantOptionIds = v.variant_option_values.map((vov: any) => vov.variant_option_id)
      return (
        selectedOptionIds.length === variantOptionIds.length &&
        selectedOptionIds.every((id) => variantOptionIds.includes(id))
      )
    })

    return matchingVariant?.id || null
  } catch (error) {
    console.error('Error finding variant:', error)
    return null
  }
}

export async function addToCartQuick(productId: string, variantId?: string): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: 'Ürün bulunamadı veya yayında değil' }
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
        return { success: false, error: 'Bu varyant satılamıyor' }
      }

      availableStock = variant.stock || 0
    }

    if (!availableStock || availableStock <= 0) {
      return { success: false, error: 'Stokta yok' }
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
        return { success: false, error: 'Bu seçenek için daha fazla stok yok' }
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

    revalidatePath('/')
    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Sepete eklenirken bir hata oluştu' }
  }
}

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
      redirect('/?error=Ürün bulunamadı veya yayında değil')
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
        redirect('/?error=Bu varyant satılamıyor')
      }

      availableStock = variant.stock || 0
    }

    if (!availableStock || availableStock <= 0) {
      redirect('/?error=Stokta yok')
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
        redirect('/?error=Bu seçenek için daha fazla stok yok')
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

    revalidatePath('/')
    revalidatePath('/cart')
  } catch (error) {
    console.error('Error adding to cart:', error)
    redirect('/?error=Sepete eklenirken bir hata oluştu')
  }

  redirect('/?success=Ürün sepete eklendi')
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

  revalidatePath('/cart')
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

  revalidatePath('/cart')
}
