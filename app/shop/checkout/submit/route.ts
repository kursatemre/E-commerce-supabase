import { submitCheckoutOrder } from '@/actions/orders'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const destination = await submitCheckoutOrder(formData)
  return NextResponse.redirect(destination)
}
