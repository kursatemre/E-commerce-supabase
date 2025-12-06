'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { pushTrendyolStock } from '@/actions/omnichannel'

const initialState = { success: false, message: undefined as string | undefined }

export function TrendyolStockSyncButton({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(pushTrendyolStock, initialState)

  return (
    <form action={formAction} className="space-y-1 text-left">
      <input type="hidden" name="trendyol_product_id" value={productId} />
      <SyncButton />
      {state.message && <p className={`text-xs ${state.success ? 'text-emerald-300' : 'text-red-300'}`}>{state.message}</p>}
    </form>
  )
}

function SyncButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-cyan-400/40 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Gönderiliyor…' : 'Stok Gönder'}
    </button>
  )
}
