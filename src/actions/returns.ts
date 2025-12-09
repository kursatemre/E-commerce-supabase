'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

const ACTIVE_RETURN_STATUSES = ['pending', 'approved', 'in_transit', 'inspection'] as const

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type ActiveStatus = (typeof ACTIVE_RETURN_STATUSES)[number]
type Nullable<T> = T | null

type ReturnRequestMetadata = {
  email?: string | null
  order_number?: string | null
  customer_note?: string | null
}

type ReturnNotificationContext = {
  orderNumber: string
  status: string
  reason?: string | null
}

type ReturnNotificationTemplate = {
  subject: (ctx: ReturnNotificationContext) => string
  body: (ctx: ReturnNotificationContext) => string
}

const RETURN_NOTIFICATION_TEMPLATES: Record<string, ReturnNotificationTemplate> = {
  pending: {
    subject: ({ orderNumber }) => `${orderNumber} iade talebiniz alındı`,
    body: ({ orderNumber, reason }) =>
      [
        `${orderNumber} numaralı siparişiniz için iade talebiniz kaydedildi.`,
        reason ? `Bildirdiğiniz sebep: ${reason}.` : null,
        'Depo ekibimiz talebinizi kontrol ettikten sonra sonraki adımlar e-posta ile paylaşılacak.',
      ]
        .filter(Boolean)
        .join(' '),
  },
  approved: {
    subject: ({ orderNumber }) => `${orderNumber} iade talebiniz onaylandı`,
    body: () =>
      'Talebiniz onaylandı. Ürünü anlaşmalı kargo kodu ile gönderdikten sonra takip numarasını bu e-postaya yanıtlayabilirsiniz.',
  },
  in_transit: {
    subject: ({ orderNumber }) => `${orderNumber} iade kargoda`,
    body: () => 'Kargonuz bize ulaştığında kalite ekibi inceleme sürecini başlatacaktır.',
  },
  inspection: {
    subject: ({ orderNumber }) => `${orderNumber} kalite kontrol aşamasında`,
    body: () => 'Ürün inceleniyor. Ortalama 2 iş günü içerisinde sonuçlandırılacaktır.',
  },
  refunded: {
    subject: ({ orderNumber }) => `${orderNumber} iade ödemeniz tamamlandı`,
    body: () => 'İade tutarı ödeme yönteminiz üzerinden finans ekibi tarafından aktarılmıştır. Bankanıza göre 1-3 iş günü sürebilir.',
  },
  rejected: {
    subject: ({ orderNumber }) => `${orderNumber} iade talebiniz hakkında`,
    body: () =>
      'Talebiniz belirtilen şartları karşılamadığı için reddedildi. Detaylar için müşteri hizmetlerine ulaşabilirsiniz.',
  },
}

const isActiveStatus = (status: Nullable<string>): status is ActiveStatus => {
  if (!status) return false
  return ACTIVE_RETURN_STATUSES.includes(status as ActiveStatus)
}

const resolveOrderCode = (orderNumber: string | null, fallbackId: string) =>
  orderNumber?.trim().length ? orderNumber : fallbackId.slice(0, 8).toUpperCase()

const extractMetadata = (metadata: ReturnRequestMetadata | null | undefined) => ({
  email: metadata?.email ?? null,
  orderNumber: metadata?.order_number ?? null,
  customerNote: metadata?.customer_note ?? null,
})

const queueReturnFlowNotification = async (
  supabase: SupabaseServerClient,
  options: {
    orderId: string
    orderNumber: string
    email?: string | null
    status: string
    reason?: string | null
  }
) => {
  const { email, status } = options
  if (!email) return

  const template = RETURN_NOTIFICATION_TEMPLATES[status]
  if (!template) return

  const context: ReturnNotificationContext = {
    orderNumber: options.orderNumber,
    status,
    reason: options.reason,
  }

  const { error } = await supabase.from('order_notifications').insert({
    order_id: options.orderId,
    notification_type: 'return_flow',
    recipient_email: email,
    subject: template.subject(context),
    body: template.body(context),
    status: 'queued',
  })

  if (error) {
    console.error('Return notification queue error:', error)
  }
}



export async function createReturnRequest(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const orderId = (formData.get('order_id') as string | null)?.trim()
  const reason = (formData.get('reason') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim()

  if (!orderId || !reason) {
    throw new Error('İade talebi oluşturmak için sipariş ve neden zorunlu')
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (orderError || !order) {
    throw new Error('Sipariş bulunamadı veya bu kullanıcıya ait değil')
  }

  const orderCode = resolveOrderCode(order.order_number, order.id)
  const customerEmail = user.email ?? null

  const metadata: ReturnRequestMetadata = {
    email: customerEmail,
    order_number: orderCode,
  }

  if (description) {
    metadata.customer_note = description
  }

  const { data: existing } = await supabase
    .from('return_requests')
    .select('id, status')
    .eq('order_id', orderId)
    .order('requested_at', { ascending: false })
    .limit(1)

  if (existing && existing.length && isActiveStatus(existing[0]?.status)) {
    throw new Error('Bu sipariş için zaten aktif bir iade talebi var')
  }

  const { error: insertError } = await supabase.from('return_requests').insert({
    order_id: orderId,
    user_id: user.id,
    reason,
    status: 'pending',
    metadata,
  })

  if (insertError) {
    console.error('Return request create error:', insertError)
    throw new Error('İade talebi kaydedilemedi')
  }

  await supabase
    .from('orders')
    .update({ status: 'return_requested' })
    .eq('id', orderId)
    .eq('user_id', user.id)

  await queueReturnFlowNotification(supabase, {
    orderId,
    orderNumber: orderCode,
    email: customerEmail,
    status: 'pending',
    reason,
  })

  revalidatePath('/account/orders')
  revalidatePath('/admin/orders')
}

export async function updateReturnStatus(formData: FormData) {
  const supabase = await createClient()

  const requestId = (formData.get('return_request_id') as string | null)?.trim()
  const status = (formData.get('status') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim() || null
  const refundAmountRaw = (formData.get('refund_amount') as string | null)?.trim()
  const refundAmount = refundAmountRaw ? Number(refundAmountRaw) : null

  if (!requestId || !status) {
    throw new Error('İade talebi veya durum bilgisi eksik')
  }

  const { data, error } = await supabase
    .from('return_requests')
    .update({
      status,
      notes,
      refund_amount: refundAmount,
      processed_at: ['refunded', 'rejected'].includes(status) ? new Date().toISOString() : null,
    })
    .eq('id', requestId)
    .select('order_id, metadata, reason')
    .single()

  if (error) {
    console.error('Return request update error:', error)
    throw new Error('İade talebi güncellenemedi')
  }

  if (status === 'refunded' && data?.order_id) {
    await supabase
      .from('orders')
      .update({ status: 'refunded', payment_status: 'refunded' })
      .eq('id', data.order_id)
  }

  if (data?.order_id) {
    const { email, orderNumber } = extractMetadata(data.metadata as ReturnRequestMetadata | null)
    let resolvedOrderNumber = orderNumber

    if (!resolvedOrderNumber) {
      const { data: orderRow } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', data.order_id)
        .single()

      resolvedOrderNumber = resolveOrderCode(orderRow?.order_number ?? null, data.order_id)
    }

    await queueReturnFlowNotification(supabase, {
      orderId: data.order_id,
      orderNumber: resolvedOrderNumber,
      email,
      status,
      reason: data.reason,
    })
  }

  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
}
