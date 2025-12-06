'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type ActionResult = { success: boolean; message?: string }

const sanitize = (value: FormDataEntryValue | null) => {
  if (!value) return null
  const input = String(value).trim()
  return input.length ? input : null
}

export async function saveMetaSystemUserToken(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const token = sanitize(formData.get('system_user_token'))
  const expiresAt = sanitize(formData.get('system_user_token_expires_at'))
  const scopes = sanitize(formData.get('system_user_scopes'))

  if (!token) {
    return { success: false, message: 'System user token boş olamaz.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('meta_tokens')
    .upsert(
      {
        token_type: 'system_user',
        access_token: token,
        expires_at: expiresAt ?? null,
        scopes: scopes ? scopes.split(',').map((scope) => scope.trim()).filter(Boolean) : null,
      },
      { onConflict: 'token_type' }
    )

  if (error) {
    console.error('[MetaActions] Token kaydedilemedi', error)
    return { success: false, message: 'Token kaydedilemedi.' }
  }

  revalidatePath('/admin/marketing')
  return { success: true, message: 'Token kaydedildi.' }
}

const assetDisplayMap: Record<string, string> = {
  pixel: 'Meta Pixel',
  catalog: 'Commerce Catalog',
  conversions_api: 'Conversions API',
  app: 'Meta App',
  ad_account: 'Ad Account',
}

export async function saveMetaAssets(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const entries: Array<{ asset_type: string; external_id: string; display_name: string }> = []

  const pixel = sanitize(formData.get('pixel_id'))
  if (pixel) entries.push({ asset_type: 'pixel', external_id: pixel, display_name: assetDisplayMap.pixel })

  const catalog = sanitize(formData.get('catalog_id'))
  if (catalog) entries.push({ asset_type: 'catalog', external_id: catalog, display_name: assetDisplayMap.catalog })

  const capiApp = sanitize(formData.get('capi_app_id'))
  if (capiApp) entries.push({ asset_type: 'conversions_api', external_id: capiApp, display_name: assetDisplayMap.conversions_api })

  const appId = sanitize(formData.get('app_id'))
  if (appId) entries.push({ asset_type: 'app', external_id: appId, display_name: assetDisplayMap.app })

  const adAccount = sanitize(formData.get('ad_account_id'))
  if (adAccount) entries.push({ asset_type: 'ad_account', external_id: adAccount, display_name: assetDisplayMap.ad_account })

  if (!entries.length) {
    return { success: false, message: 'Kaydedilecek ID bulunamadı.' }
  }

  const { error } = await supabase
    .from('meta_assets')
    .upsert(entries, { onConflict: 'asset_type,external_id' })

  if (error) {
    console.error('[MetaActions] Asset kaydı başarısız', error)
    return { success: false, message: 'ID kaydedilemedi.' }
  }

  revalidatePath('/admin/marketing')
  return { success: true, message: 'ID bilgileri güncellendi.' }
}
