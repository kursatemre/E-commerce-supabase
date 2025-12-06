'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  try {
    // Get cart with items
    const { data: cart } = await supabase
      .from('carts')
      .select(`
        id,
        cart_items (
          id,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            stock
          )
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      redirect('/shop/cart?error=Sepetiniz boş')
    }

    // Calculate total
    const total = cart.cart_items.reduce((sum: number, item: any) => {
      return sum + (item.products.price * item.quantity)
    }, 0)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`

    // Get addresses from form
    const shippingAddress = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      zipCode: formData.get('zipCode'),
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'awaiting_payment',
        fulfillment_status: 'preparing',
        total,
        shipping_address: shippingAddress,
        billing_address: shippingAddress, // Same as shipping for now
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = cart.cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      product_price: item.products.price,
      quantity: item.quantity,
      subtotal: item.products.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Update stock
    for (const item of cart.cart_items) {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      if (product && typeof product.stock === 'number') {
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock: product.stock - item.quantity
          })
          .eq('id', item.product_id)

        if (stockError) throw stockError
      }
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    revalidatePath('/shop/cart')
    redirect(`/shop/orders/${order.id}?success=Siparişiniz başarıyla oluşturuldu`)
  } catch (error) {
    console.error('Error creating order:', error)
    redirect('/shop/cart?error=Sipariş oluşturulurken bir hata oluştu')
  }
}

type StatusUpdatePayload = {
  order_id: string
  status?: string | null
  payment_status?: string | null
  fulfillment_status?: string | null
  cargo_tracking_code?: string | null
  invoice_number?: string | null
  invoice_issued_at?: string | null
}

const toNullableField = (value: FormDataEntryValue | null) => {
  if (!value) return null
  const normalized = String(value).trim()
  return normalized.length ? normalized : null
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()
  const getField = (key: string) => (formData.has(key) ? toNullableField(formData.get(key)) : undefined)
  const payload: StatusUpdatePayload = {
    order_id: formData.get('order_id') as string,
    status: getField('status'),
    payment_status: getField('payment_status'),
    fulfillment_status: getField('fulfillment_status'),
    cargo_tracking_code: getField('cargo_tracking_code'),
    invoice_number: getField('invoice_number'),
    invoice_issued_at: getField('invoice_issued_at'),
  }

  if (!payload.order_id) {
    throw new Error('Sipariş kimliği bulunamadı')
  }

  const updatePayload: Record<string, unknown> = {}

  if (payload.status !== undefined) {
    updatePayload.status = payload.status
    if (payload.status === 'delivered') {
      updatePayload.delivered_at = new Date().toISOString()
    }
  }
  if (payload.payment_status !== undefined) {
    updatePayload.payment_status = payload.payment_status
  }
  if (payload.fulfillment_status !== undefined) {
    updatePayload.fulfillment_status = payload.fulfillment_status
  }
  if (payload.cargo_tracking_code !== undefined) {
    updatePayload.cargo_tracking_code = payload.cargo_tracking_code
  }
  if (payload.invoice_number !== undefined) {
    updatePayload.invoice_number = payload.invoice_number
  }
  if (payload.invoice_issued_at !== undefined) {
    updatePayload.invoice_issued_at = payload.invoice_issued_at
  }

  if (!Object.keys(updatePayload).length) {
    revalidatePath('/admin/customers')
    return
  }

  const { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', payload.order_id)

  if (error) {
    console.error('Order status update error:', error)
    throw new Error('Sipariş güncellenemedi')
  }

  revalidatePath('/admin/customers')
  revalidatePath('/admin/orders')
  revalidatePath('/admin/orders')
}

export async function generateOrderDocument(formData: FormData) {
  const supabase = await createClient()
  const orderId = formData.get('order_id') as string
  const documentType = toNullableField(formData.get('document_type'))
  const documentNumber = toNullableField(formData.get('document_number'))
  const fileUrl = toNullableField(formData.get('file_url'))
  const notes = toNullableField(formData.get('notes'))

  if (!orderId || !documentType || !documentNumber) {
    throw new Error('Belge oluşturmak için eksik bilgi var')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('order_documents').insert({
    order_id: orderId,
    document_type: documentType,
    document_number: documentNumber,
    status: 'created',
    file_url: fileUrl,
    payload: notes ? { notes } : null,
    created_by: user?.id ?? null,
  })

  if (error) {
    console.error('Order document create error:', error)
    throw new Error('Belge oluşturulamadı')
  }

  revalidatePath('/admin/customers')
  revalidatePath('/admin/orders')
}

export async function queueOrderNotification(formData: FormData) {
  const supabase = await createClient()
  const orderId = toNullableField(formData.get('order_id'))
  const type = toNullableField(formData.get('notification_type'))
  const email = toNullableField(formData.get('recipient_email'))
  const subject = toNullableField(formData.get('subject'))
  const body = toNullableField(formData.get('body'))

  if (!type || !email || !subject || !body) {
    throw new Error('Bildirim oluşturmak için tüm alanlar zorunlu')
  }

  const { error } = await supabase.from('order_notifications').insert({
    order_id: orderId,
    notification_type: type,
    recipient_email: email,
    subject,
    body,
    status: 'queued',
  })

  if (error) {
    console.error('Order notification queue error:', error)
    throw new Error('E-posta bildirimi kuyruklanamadı')
  }

  revalidatePath('/admin/customers')
}
