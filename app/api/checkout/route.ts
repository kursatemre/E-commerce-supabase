import { submitCheckoutOrder } from '@/actions/orders'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const formData = await request.formData()
  const destination = await submitCheckoutOrder(formData)
  redirect(destination)
}
