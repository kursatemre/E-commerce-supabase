import { google } from 'googleapis'
import { canUseServiceClient, getServiceClient } from '@/lib/supabase/service'

type SearchConsoleMetrics = {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type SearchConsoleQuery = {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type SearchConsoleData = {
  totalMetrics: SearchConsoleMetrics
  topQueries: SearchConsoleQuery[]
  period: {
    startDate: string
    endDate: string
  }
}

async function getServiceAccountCredentials() {
  if (!canUseServiceClient()) {
    throw new Error('Supabase service client not available')
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('google_integrations')
    .select('primary_id, credential')
    .eq('integration_type', 'service_account')
    .maybeSingle()

  if (error || !data) {
    throw new Error('Service account not found in database')
  }

  if (!data.credential?.private_key) {
    throw new Error('Service account private key not found')
  }

  return {
    client_email: data.primary_id,
    private_key: data.credential.private_key,
  }
}

async function getSiteUrl() {
  if (!canUseServiceClient()) {
    throw new Error('Supabase service client not available')
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('google_integrations')
    .select('primary_id')
    .eq('integration_type', 'search_console')
    .maybeSingle()

  if (error || !data) {
    throw new Error('Search Console site URL not configured')
  }

  return data.primary_id
}

export async function fetchSearchConsoleData(days: number = 30): Promise<SearchConsoleData> {
  const credentials = await getServiceAccountCredentials()
  const siteUrl = await getSiteUrl()

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  try {
    // Fetch total metrics
    const totalResponse = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: [],
      },
    })

    const totalMetrics: SearchConsoleMetrics = {
      clicks: totalResponse.data.rows?.[0]?.clicks ?? 0,
      impressions: totalResponse.data.rows?.[0]?.impressions ?? 0,
      ctr: totalResponse.data.rows?.[0]?.ctr ?? 0,
      position: totalResponse.data.rows?.[0]?.position ?? 0,
    }

    // Fetch top queries
    const queriesResponse = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 10,
      },
    })

    const topQueries: SearchConsoleQuery[] = (queriesResponse.data.rows ?? []).map((row: any) => ({
      query: row.keys[0],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))

    return {
      totalMetrics,
      topQueries,
      period: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
    }
  } catch (error) {
    console.error('[SearchConsole] API error:', error)
    throw new Error('Failed to fetch Search Console data')
  }
}

export async function fetchSearchConsolePages(days: number = 30, limit: number = 10) {
  const credentials = await getServiceAccountCredentials()
  const siteUrl = await getSiteUrl()

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: limit,
      },
    })

    return (response.data.rows ?? []).map((row: any) => ({
      page: row.keys[0],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
  } catch (error) {
    console.error('[SearchConsole] Pages API error:', error)
    throw new Error('Failed to fetch Search Console pages')
  }
}
