import { createClient } from '@/lib/supabase/server'
import { getServiceClient, canUseServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const regularClient = await createClient()
  const supabase = canUseServiceClient() ? getServiceClient() : regularClient
  
  try {
    const { itemId, quantity } = await request.json()

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Missing itemId or quantity' }, { status: 400 })
    }

    if (quantity <= 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)

      if (error) throw error
    }

    revalidatePath('/cart')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
