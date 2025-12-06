'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { saveTrendyolIntegration } from '@/actions/omnichannel'
import type { TrendyolIntegration } from '@/lib/omnichannel/service'

const initialState = { success: false, message: undefined as string | undefined }

export function TrendyolIntegrationForm({ initialData }: { initialData: TrendyolIntegration | null }) {
  const [state, formAction] = useActionState(saveTrendyolIntegration, initialState)

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-white/10 bg-gray-900/70 p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-cyan-200">Trendyol</p>
        <h2 className="text-xl font-semibold text-white">API Bağlantısı</h2>
        <p className="text-sm text-gray-400">App Key/Secret değerleri Supabase&apos;de şifrelenmiş olarak saklanır.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Input label="Mağaza Adı" name="store_name" placeholder="Ör: ModaHouse" defaultValue={initialData?.storeName ?? ''} required />
        <Input label="Bölge" name="region" placeholder="TR" defaultValue={initialData?.region ?? 'TR'} required />
        <Input label="Supplier ID" name="supplier_id" placeholder="123456" defaultValue={initialData?.supplierId ?? ''} required />
        <Input label="Warehouse ID" name="warehouse_id" placeholder="654321" defaultValue={initialData?.warehouseId ?? ''} />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">API Anahtarları</p>
          <p className="text-xs text-gray-400">App Key & Secret değerlerini Trendyol Partner Panel &gt; Entegrasyon Yönetimi sayfasından alabilirsiniz.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="App Key" name="api_key" placeholder="xxxxxxxxxxxxxxxx" type="password" required />
          <Input label="App Secret" name="api_secret" placeholder="xxxxxxxxxxxxxxxx" type="password" required />
        </div>
      </section>

      <section>
        <Input label="Callback URL" name="callback_url" placeholder="https://example.com/api/trendyol" defaultValue={initialData?.callbackUrl ?? ''} />
      </section>

      {state.message && <p className={`text-sm ${state.success ? 'text-emerald-300' : 'text-red-300'}`}>{state.message}</p>}

      <SubmitButton label="Trendyol Bilgilerini Kaydet" />
    </form>
  )
}

function Input({ label, name, placeholder, type = 'text', defaultValue, required }: { label: string; name: string; placeholder?: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-300" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        required={required}
      />
    </div>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-cyan-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Kaydediliyor…' : label}
    </button>
  )
}
