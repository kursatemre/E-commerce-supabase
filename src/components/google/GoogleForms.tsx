'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { saveGoogleIntegrations } from '@/actions/google'

const initialState = { success: false, message: undefined as string | undefined }

export function GoogleIntegrationForm() {
  const [state, formAction] = useActionState(saveGoogleIntegrations, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-white/10 bg-gray-900/60 p-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-cyan-200">Google Entegrasyonları</p>
        <h3 className="text-lg font-semibold text-white">GA4 / Search Console / Ads</h3>
        <p className="text-sm text-gray-400">Property ve müşteri ID&apos;lerini burada saklayın. Service account bilgisi gizli tutulur.</p>
      </header>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-white">GA4</legend>
        <Input label="GA4 Property ID" name="ga4_property_id" placeholder="properties/123456789" />
        <Input label="GA4 Measurement ID" name="ga4_measurement_id" placeholder="G-ABCDE12345" />
        <Input label="GA4 Stream Adı (opsiyonel)" name="ga4_stream_name" placeholder="Web Stream" />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-white">Search Console</legend>
        <Input label="Site URL veya sc-domain" name="search_console_site_url" placeholder="https://example.com/ veya sc-domain:example.com" />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-white">Google Ads</legend>
        <Input label="Müşteri ID" name="google_ads_customer_id" placeholder="123-456-7890" />
        <Input label="Manager ID (opsiyonel)" name="google_ads_manager_id" placeholder="987-654-3210" />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-white">Service Account</legend>
        <Input label="Service Account Email" name="service_account_email" placeholder="ga4-sync@project.iam.gserviceaccount.com" />
        <Input label="Key ID" name="service_account_key_id" placeholder="abcd1234efgh5678" />
        <Textarea label="Private Key" name="service_account_private_key" placeholder="-----BEGIN PRIVATE KEY-----" />
      </fieldset>

      {state.message && (
        <p className={`text-xs ${state.success ? 'text-emerald-300' : 'text-red-300'}`}>{state.message}</p>
      )}

      <SubmitButton label="Google Bilgilerini Kaydet" />
    </form>
  )
}

function Input({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-300" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
      />
    </div>
  )
}

function Textarea({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-300" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
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
      className="w-full rounded-xl bg-cyan-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Kaydediliyor...' : label}
    </button>
  )
}
