import { canUseServiceClient, getServiceClient } from '@/lib/supabase/service'

export type GoogleIntegrationRow = {
  integration_type: string
  primary_id: string | null
  secondary_id: string | null
  client_email: string | null
  credential: Record<string, any> | null
  metadata: Record<string, any> | null
  updated_at: string | null
}

export type GoogleCard = {
  label: string
  id: string
  status: 'aktif' | 'beklemede'
  sync: string
  note: string
}

export type GoogleOverview = {
  generatedAt: string
  integrations: GoogleIntegrationRow[]
  cards: GoogleCard[]
  warnings: string[]
}

export async function getGoogleOverview(): Promise<GoogleOverview> {
  const integrations = await fetchIntegrations()
  const warnings: string[] = []
  if (!integrations.length) {
    warnings.push('Google entegrasyonları için henüz kayıt yapılmadı.')
  }

  const cards = buildCards(integrations)

  if (!integrations.some((row) => row.integration_type === 'service_account') && !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    warnings.push('Service account bilgisi eksik. Google API çağrıları yapılamaz.')
  }

  return {
    generatedAt: new Date().toISOString(),
    integrations,
    cards,
    warnings,
  }
}

async function fetchIntegrations(): Promise<GoogleIntegrationRow[]> {
  if (!canUseServiceClient()) {
    return []
  }

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('google_integrations')
      .select('integration_type, primary_id, secondary_id, client_email, credential, metadata, updated_at')

    if (error) {
      console.error('[GoogleOverview] google_integrations sorgusu başarısız', error)
      return []
    }

    return data ?? []
  } catch (error) {
    console.error('[GoogleOverview] google_integrations okunamadı', error)
    return []
  }
}

function buildCards(rows: GoogleIntegrationRow[]): GoogleCard[] {
  const cards: GoogleCard[] = []
  const ga4 = rows.find((row) => row.integration_type === 'ga4')
  cards.push({
    label: 'GA4 Property',
    id: ga4?.primary_id ?? 'Tanımlı değil',
    status: ga4?.primary_id ? 'aktif' : 'beklemede',
    sync: ga4?.updated_at ? formatRelative(ga4.updated_at) : 'hiç kaydedilmedi',
    note: ga4?.secondary_id ? `Measurement ID: ${ga4.secondary_id}` : 'Measurement ID eksik',
  })

  const searchConsole = rows.find((row) => row.integration_type === 'search_console')
  cards.push({
    label: 'Search Console',
    id: searchConsole?.primary_id ?? 'Site eklenmemiş',
    status: searchConsole?.primary_id ? 'aktif' : 'beklemede',
    sync: searchConsole?.updated_at ? formatRelative(searchConsole.updated_at) : 'hiç kaydedilmedi',
    note: searchConsole?.metadata?.property_type ? `${searchConsole.metadata.property_type} property` : 'Property türü bilinmiyor',
  })

  const googleAds = rows.find((row) => row.integration_type === 'google_ads')
  cards.push({
    label: 'Google Ads',
    id: googleAds?.primary_id ?? 'Müşteri ID girilmedi',
    status: googleAds?.primary_id ? 'aktif' : 'beklemede',
    sync: googleAds?.updated_at ? formatRelative(googleAds.updated_at) : 'hiç kaydedilmedi',
    note: googleAds?.secondary_id ? `MC ID: ${googleAds.secondary_id}` : 'Manager ID opsiyonel',
  })

  const serviceAccount = rows.find((row) => row.integration_type === 'service_account')
  cards.push({
    label: 'Service Account',
    id: serviceAccount?.primary_id ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? 'E-posta eksik',
    status: serviceAccount?.primary_id || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'aktif' : 'beklemede',
    sync: serviceAccount?.updated_at ? formatRelative(serviceAccount.updated_at) : 'hiç kaydedilmedi',
    note: serviceAccount?.secondary_id ? `Key ID: ${serviceAccount.secondary_id}` : 'Key ID belirtilmedi',
  })

  return cards
}

function formatRelative(dateInput: string) {
  const diff = Date.now() - new Date(dateInput).getTime()
  const minutes = Math.max(Math.round(diff / 60000), 0)
  if (minutes < 1) return 'az önce'
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} sa önce`
  const days = Math.round(hours / 24)
  return `${days} g önce`
}
