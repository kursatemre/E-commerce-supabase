'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import type { ActionResult } from '@/actions/meta'

type GoogleActionResult = ActionResult

const sanitize = (value: FormDataEntryValue | null) => {
  if (!value) return null
  const normalized = String(value).trim()
  return normalized.length ? normalized : null
}

export async function saveGoogleIntegrations(_: GoogleActionResult, formData: FormData): Promise<GoogleActionResult> {
  const supabase = await createClient()
  const entries: Array<{
    integration_type: string
    primary_id: string
    secondary_id?: string | null
    client_email?: string | null
    credential?: Record<string, any> | null
    metadata?: Record<string, any> | null
  }> = []

  const ga4PropertyId = sanitize(formData.get('ga4_property_id'))
  const ga4MeasurementId = sanitize(formData.get('ga4_measurement_id'))
  if (ga4PropertyId || ga4MeasurementId) {
    entries.push({
      integration_type: 'ga4',
      primary_id: ga4PropertyId ?? '',
      secondary_id: ga4MeasurementId ?? null,
      metadata: {
        stream_name: sanitize(formData.get('ga4_stream_name')),
      },
    })
  }

  const searchConsoleSite = sanitize(formData.get('search_console_site_url'))
  if (searchConsoleSite) {
    entries.push({
      integration_type: 'search_console',
      primary_id: searchConsoleSite,
      metadata: {
        property_type: searchConsoleSite.startsWith('sc-domain:') ? 'domain' : 'url-prefix',
      },
    })
  }

  const adsCustomerId = sanitize(formData.get('google_ads_customer_id'))
  if (adsCustomerId) {
    entries.push({
      integration_type: 'google_ads',
      primary_id: adsCustomerId,
      secondary_id: sanitize(formData.get('google_ads_manager_id')),
    })
  }

  const serviceAccountEmail = sanitize(formData.get('service_account_email'))
  const serviceAccountKeyId = sanitize(formData.get('service_account_key_id'))
  const serviceAccountPrivateKey = sanitize(formData.get('service_account_private_key'))
  if (serviceAccountEmail) {
    entries.push({
      integration_type: 'service_account',
      primary_id: serviceAccountEmail,
      secondary_id: serviceAccountKeyId ?? null,
      credential: serviceAccountPrivateKey
        ? {
            private_key: serviceAccountPrivateKey,
          }
        : null,
    })
  }

  if (!entries.length) {
    return { success: false, message: 'Kaydedilecek Google verisi bulunamadı.' }
  }

  const { error } = await supabase.from('google_integrations').upsert(entries, {
    onConflict: 'integration_type',
  })

  if (error) {
    console.error('[GoogleActions] Entegrasyon kaydı başarısız', error)
    return { success: false, message: 'Google entegrasyonları kaydedilemedi.' }
  }

  revalidatePath('/admin/marketing')
  return { success: true, message: 'Google entegrasyonları güncellendi.' }
}
