import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error

    revalidatePath('/shop/cart')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart remove error:', error)
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}
