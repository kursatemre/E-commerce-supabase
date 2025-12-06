'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { saveMetaAssets, saveMetaSystemUserToken, type ActionResult } from '@/actions/meta'

const initialState: ActionResult = { success: false, message: undefined }

export function MetaTokenForm() {
  const [state, formAction] = useActionState(saveMetaSystemUserToken, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-white/10 bg-gray-900/60 p-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-blue-200">System User Token</p>
        <h3 className="text-lg font-semibold text-white">CAPI Access Token</h3>
        <p className="text-sm text-gray-400">Business Settings → System Users bölümünden aldığınız tokenı girin.</p>
      </header>
      <div className="space-y-1">
        <label className="text-sm text-gray-300" htmlFor="system_user_token">
          Access Token
        </label>
        <textarea
          id="system_user_token"
          name="system_user_token"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          placeholder="EAABsbCS1iHgBAG..."
          rows={3}
          required
        />
        <p className="text-xs text-gray-500">En az `ads_management` ve `business_management` izinleri olmalı.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-gray-300" htmlFor="system_user_token_expires_at">
            Token Bitiş Tarihi
          </label>
          <input
            type="datetime-local"
            id="system_user_token_expires_at"
            name="system_user_token_expires_at"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-300" htmlFor="system_user_scopes">
            Scopes (opsiyonel)
          </label>
          <input
            type="text"
            id="system_user_scopes"
            name="system_user_scopes"
            placeholder="ads_management, pages_show_list"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>
      {state.message && (
        <p className={`text-xs ${state.success ? 'text-emerald-300' : 'text-red-300'}`}>{state.message}</p>
      )}
      <SubmitButton label="Token'ı Kaydet" />
    </form>
  )
}

export function MetaAssetForm() {
  const [state, formAction] = useActionState(saveMetaAssets, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-white/10 bg-gray-900/60 p-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-amber-200">Meta Asset ID&apos;leri</p>
        <h3 className="text-lg font-semibold text-white">Pixel / Catalog / App</h3>
        <p className="text-sm text-gray-400">ID&apos;leri Meta panelinden kopyalayarak kaydedebilirsiniz.</p>
      </header>
      <div className="space-y-1">
        <label className="text-sm text-gray-300" htmlFor="pixel_id">
          Pixel ID
        </label>
        <input
          id="pixel_id"
          name="pixel_id"
          placeholder="123456789012345"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300" htmlFor="catalog_id">
          Catalog ID
        </label>
        <input
          id="catalog_id"
          name="catalog_id"
          placeholder="987654321098765"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300" htmlFor="capi_app_id">
          Conversions API App ID
        </label>
        <input
          id="capi_app_id"
          name="capi_app_id"
          placeholder="app_1234567890"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300" htmlFor="app_id">
          Meta App ID
        </label>
        <input
          id="app_id"
          name="app_id"
          placeholder="123456789012345"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300" htmlFor="ad_account_id">
          Reklam Hesabı ID (act_...)
        </label>
        <input
          id="ad_account_id"
          name="ad_account_id"
          placeholder="act_123456789012345"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
      </div>
      {state.message && (
        <p className={`text-xs ${state.success ? 'text-emerald-300' : 'text-red-300'}`}>{state.message}</p>
      )}
      <SubmitButton label="ID'leri Güncelle" />
    </form>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Kaydediliyor...' : label}
    </button>
  )
}
