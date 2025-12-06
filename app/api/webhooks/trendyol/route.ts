import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/trendyol/client'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/middleware/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'webhook')
  if (rateLimitResult.response) {
    return rateLimitResult.response
  }

  try {
    const signature = request.headers.get('x-trendyol-signature')
    const body = await request.text()

    if (!signature) {
      console.error('[Trendyol Webhook] Missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get webhook secret from database
    const supabase = await createClient()
    const { data: integration } = await supabase
      .from('marketplace_integrations')
      .select('api_secret')
      .eq('channel', 'trendyol')
      .maybeSingle()

    if (!integration?.api_secret) {
      console.error('[Trendyol Webhook] No API secret configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify signature
    const isValid = verifyWebhookSignature(body, signature, integration.api_secret)
    if (!isValid) {
      console.error('[Trendyol Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const eventType = payload.eventType || 'unknown'

    // Log webhook event
    await supabase.from('trendyol_webhook_events').insert({
      event_type: eventType,
      payload,
      received_at: new Date().toISOString(),
    })

    // Process based on event type
    switch (eventType) {
      case 'order.created':
        await handleOrderCreated(payload)
        break
      case 'order.updated':
        await handleOrderUpdated(payload)
        break
      case 'product.updated':
        await handleProductUpdated(payload)
        break
      case 'product.stock.updated':
        await handleStockUpdated(payload)
        break
      default:
        console.log('[Trendyol Webhook] Unknown event type:', eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Trendyol Webhook] Error:', error)

    // Log error in webhook events table
    try {
      const supabase = await createClient()
      await supabase.from('trendyol_webhook_events').insert({
        event_type: 'error',
        payload: { error: error instanceof Error ? error.message : 'Unknown error' },
        error_message: error instanceof Error ? error.message : 'Unknown error',
        received_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.error('[Trendyol Webhook] Failed to log error:', logError)
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function handleOrderCreated(payload: any) {
  const supabase = await createClient()
  const order = payload.order

  try {
    // Insert into trendyol_orders
    const { data: trendyolOrder, error: orderError } = await supabase
      .from('trendyol_orders')
      .insert({
        marketplace_order_id: order.orderNumber,
        order_number: order.orderNumber,
        marketplace_status: order.status,
        order_date: new Date(order.orderDate).toISOString(),
        buyer_name: `${order.invoiceAddress?.firstName} ${order.invoiceAddress?.lastName}`,
        buyer_email: order.customerEmail,
        total_price: order.totalPrice,
        currency: 'TRY',
        shipping_address: order.shipmentAddress,
        billing_address: order.invoiceAddress,
        raw_payload: order,
        last_status_synced_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('[Trendyol Webhook] Failed to insert order:', orderError)
      return
    }

    // Insert order items
    if (order.lines && Array.isArray(order.lines)) {
      const items = order.lines.map((line: any) => ({
        trendyol_order_id: trendyolOrder.id,
        marketplace_order_item_id: line.lineItemId,
        trendyol_product_id: line.productId,
        sku: line.barcode,
        quantity: line.quantity,
        unit_price: line.price,
        vat_rate: line.vatRate,
        discount: line.discount,
        status: line.status,
        metadata: line,
      }))

      const { error: itemsError } = await supabase.from('trendyol_order_items').insert(items)

      if (itemsError) {
        console.error('[Trendyol Webhook] Failed to insert order items:', itemsError)
      }
    }

    // Mark webhook as processed
    await supabase
      .from('trendyol_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('payload->order->orderNumber', order.orderNumber)
      .is('processed_at', null)

    console.log('[Trendyol Webhook] Order created successfully:', order.orderNumber)
  } catch (error) {
    console.error('[Trendyol Webhook] handleOrderCreated error:', error)
    throw error
  }
}

async function handleOrderUpdated(payload: any) {
  const supabase = await createClient()
  const order = payload.order

  try {
    await supabase
      .from('trendyol_orders')
      .update({
        marketplace_status: order.status,
        shipment_package_id: order.shipmentPackageId,
        last_status_synced_at: new Date().toISOString(),
      })
      .eq('marketplace_order_id', order.orderNumber)

    console.log('[Trendyol Webhook] Order updated:', order.orderNumber)
  } catch (error) {
    console.error('[Trendyol Webhook] handleOrderUpdated error:', error)
    throw error
  }
}

async function handleProductUpdated(payload: any) {
  const supabase = await createClient()
  const product = payload.product

  try {
    await supabase
      .from('trendyol_products')
      .update({
        title: product.title,
        price: product.salePrice,
        discounted_price: product.listPrice,
        status: product.approved ? 'active' : 'passive',
        last_synced_at: new Date().toISOString(),
        metadata: product,
      })
      .eq('marketplace_product_id', product.productMainId)

    console.log('[Trendyol Webhook] Product updated:', product.productMainId)
  } catch (error) {
    console.error('[Trendyol Webhook] handleProductUpdated error:', error)
    throw error
  }
}

async function handleStockUpdated(payload: any) {
  const supabase = await createClient()
  const stockInfo = payload.stock

  try {
    await supabase
      .from('trendyol_products')
      .update({
        stock: stockInfo.quantity,
        last_synced_at: new Date().toISOString(),
      })
      .eq('barcode', stockInfo.barcode)

    console.log('[Trendyol Webhook] Stock updated for barcode:', stockInfo.barcode)
  } catch (error) {
    console.error('[Trendyol Webhook] handleStockUpdated error:', error)
    throw error
  }
}
