import { CheckoutFormValues, processCheckoutOrderPayload } from '@/actions/orders'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CheckoutFormValues
    const redirectUrl = await processCheckoutOrderPayload(payload)
    return NextResponse.json({ redirectUrl })
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sipariş oluşturulamadı' },
      { status: 400 }
    )
  }
}
