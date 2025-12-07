'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  saveNotificationSettings,
  saveSecuritySettings,
  saveStoreProfile,
  type SettingsActionState,
} from '@/actions/settings'
import type { StoreSettingsRecord } from '@/types/settings'

const initialState: SettingsActionState = { success: false, message: undefined }

export function StoreProfileForm({ initialData }: { initialData: StoreSettingsRecord }) {
  const [state, formAction] = useActionState(saveStoreProfile, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-gray-950/60 p-6 shadow-xl shadow-black/30">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Mağaza</p>
        <h3 className="text-lg font-semibold text-white">Genel Bilgiler</h3>
        <p className="text-sm text-gray-400">Destek iletişim bilgileri, iade politikası ve para birimi.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Mağaza Adı" name="store_name" defaultValue={initialData.store_name ?? ''} required />
        <Input label="Destek E-posta" name="support_email" defaultValue={initialData.support_email ?? ''} type="email" required />
        <Input label="Destek Telefonu" name="support_phone" defaultValue={initialData.support_phone ?? ''} />
        <Input label="Çalışma Saatleri" name="working_hours" defaultValue={initialData.working_hours ?? '09:00 - 18:00'} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Para Birimi"
          name="preferred_currency"
          defaultValue={initialData.preferred_currency ?? 'TRY'}
          options={[
            { label: 'TRY', value: 'TRY' },
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
          ]}
        />
        <Input
          label="İade Süresi (gün)"
          name="return_window_days"
          type="number"
          min={1}
          max={60}
          defaultValue={String(initialData.return_window_days ?? 14)}
          required
        />
        <Input label="Saat Dilimi" name="timezone" defaultValue={initialData.timezone ?? 'Europe/Istanbul'} />
      </div>
      <FormFooter state={state} cta="Mağaza Bilgilerini Kaydet" />
    </form>
  )
}

export function NotificationPreferencesForm({ initialData }: { initialData: StoreSettingsRecord }) {
  const [state, formAction] = useActionState(saveNotificationSettings, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-gray-950/50 p-6 shadow-xl shadow-black/30">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Bildirim</p>
        <h3 className="text-lg font-semibold text-white">Operasyon Uyarıları</h3>
        <p className="text-sm text-gray-400">Sipariş, iade ve stok uyarılarının iletileceği kanalları seçin.</p>
      </header>
      <div className="space-y-3">
        <CheckboxRow label="Sipariş E-postaları" name="notifications_email" defaultChecked={Boolean(initialData.notifications_email)} helper="Yeni sipariş ve ödeme onayı" />
        <CheckboxRow label="SMS Uyarıları" name="notifications_sms" defaultChecked={Boolean(initialData.notifications_sms)} helper="Kritik durumlarda hızlı bildirim" />
        <CheckboxRow label="İade Akışı Bildirimleri" name="notifications_returns" defaultChecked={Boolean(initialData.notifications_returns)} helper="RMA durum değişiklikleri" />
        <CheckboxRow label="Düşük Stok Alarmı" name="alerts_low_stock" defaultChecked={Boolean(initialData.alerts_low_stock)} helper="Minimum stok seviyeleri için e-posta" />
        <CheckboxRow label="Yüksek Risk Sipariş" name="alerts_high_risk" defaultChecked={Boolean(initialData.alerts_high_risk)} helper="Fraud şüphesi, manuel inceleme" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Uyarı E-postası" name="alert_email" defaultValue={initialData.alert_email ?? ''} type="email" />
        <Input label="Slack Webhook URL" name="slack_webhook_url" defaultValue={initialData.slack_webhook_url ?? ''} placeholder="https://hooks.slack.com/..." />
      </div>
      <FormFooter state={state} cta="Bildirim Tercihlerini Kaydet" accent="bg-blue-600/80 hover:bg-blue-500" />
    </form>
  )
}

export function SecuritySettingsForm({ initialData }: { initialData: StoreSettingsRecord }) {
  const [state, formAction] = useActionState(saveSecuritySettings, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-gray-950/50 p-6 shadow-xl shadow-black/30">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Güvenlik</p>
        <h3 className="text-lg font-semibold text-white">Erişim Politikaları</h3>
        <p className="text-sm text-gray-400">2FA zorunluluğu, alan adı ve IP kısıtlamaları.</p>
      </header>
      <div className="space-y-3">
        <CheckboxRow label="2FA Zorunlu" name="two_factor_required" defaultChecked={Boolean(initialData.two_factor_required)} helper="Tüm admin girişlerinde SMS / Authenticator" />
      </div>
      <div className="grid gap-4">
        <Input
          label="Session Timeout (dk)"
          name="session_timeout_minutes"
          type="number"
          min={5}
          max={240}
          defaultValue={String(initialData.session_timeout_minutes ?? 30)}
          required
        />
        <Textarea label="İzinli Alan Adları" name="allowed_domains" placeholder="example.com, brand.com" defaultValue={initialData.allowed_domains ?? ''} />
        <Textarea label="IP Allowlist" name="ip_allowlist" placeholder="192.168.1.10, 85.97.13.5" defaultValue={initialData.ip_allowlist ?? ''} />
        <Input label="Giriş Uyarı E-postası" name="login_alert_email" type="email" defaultValue={initialData.login_alert_email ?? ''} />
      </div>
      <FormFooter state={state} cta="Güvenlik Ayarlarını Kaydet" accent="bg-fuchsia-600/80 hover:bg-fuchsia-500" />
    </form>
  )
}

function Input({ label, name, type = 'text', defaultValue, required, placeholder, min, max }: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-400" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500"
      />
    </div>
  )
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: { label: string; value: string }[]; defaultValue?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-400" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Textarea({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-400" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500"
      />
    </div>
  )
}

function CheckboxRow({ label, name, defaultChecked, helper }: { label: string; name: string; defaultChecked?: boolean; helper?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border border-white/20 bg-transparent accent-blue-500"
      />
      <span>
        <span className="font-semibold">{label}</span>
        {helper && <p className="text-xs text-gray-400">{helper}</p>}
      </span>
    </label>
  )
}

function FormFooter({ state, cta, accent = 'bg-emerald-600/80 hover:bg-emerald-500' }: { state: SettingsActionState; cta: string; accent?: string }) {
  return (
    <div className="space-y-2">
      {state.message && (
        <p className={`text-xs ${state.success ? 'text-emerald-300' : 'text-red-300'}`}>{state.message}</p>
      )}
      <SubmitButton accent={accent}>{cta}</SubmitButton>
    </div>
  )
}

function SubmitButton({ children, accent }: { children: string; accent: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-2xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${accent}`}
    >
      {pending ? 'Kaydediliyor...' : children}
    </button>
  )
}
