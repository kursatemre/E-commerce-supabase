import { fetchCatalogFeeds, fetchCatalogSummary, fetchPixelSummary, type MetaCatalogFeed, type MetaCatalogSummary, type MetaPixelSummary } from './graph'
import { canUseServiceClient, getServiceClient } from '@/lib/supabase/service'

type MetaAssetRow = {
  asset_type: string
  external_id: string
  display_name: string | null
  status: string | null
  metadata: Record<string, any> | null
  last_synced_at: string | null
}

type PrivateTokenInfo = {
  accessToken: string
  expiresAt: string | null
  source: 'env' | 'supabase'
  metadata: Record<string, any> | null
}

export type PublicTokenInfo = {
  source: 'env' | 'supabase'
  expiresAt: string | null
  daysRemaining: number | null
  metadata: Record<string, any> | null
}

export type MetaOverview = {
  generatedAt: string
  pixel: MetaPixelSummary | null
  catalog: MetaCatalogSummary | null
  feeds: MetaCatalogFeed[]
  token: PublicTokenInfo | null
  assets: MetaAssetRow[]
  errors: string[]
}

export async function getMetaOverview(): Promise<MetaOverview> {
  const errors: string[] = []
  const assets = await collectAssets()
  const tokenInfo = await resolveSystemUserToken()

  if (!tokenInfo) {
    errors.push('Meta Graph API access token bulunamadı. META_SYSTEM_USER_TOKEN ortam değişkenini veya meta_tokens tablosunu doldurun.')
    return {
      generatedAt: new Date().toISOString(),
      assets,
      pixel: null,
      catalog: null,
      feeds: [],
      token: null,
      errors,
    }
  }

  const pixelAsset = assets.find((asset) => asset.asset_type === 'pixel')
  const catalogAsset = assets.find((asset) => asset.asset_type === 'catalog')

  const [pixel, catalog, feeds] = await Promise.all([
    safeFetch('Pixel', () => (pixelAsset ? fetchPixelSummary(tokenInfo.accessToken, pixelAsset.external_id) : Promise.resolve(null)), errors),
    safeFetch('Catalog', () => (catalogAsset ? fetchCatalogSummary(tokenInfo.accessToken, catalogAsset.external_id) : Promise.resolve(null)), errors),
    safeFetch('Catalog Feeds', () => (catalogAsset ? fetchCatalogFeeds(tokenInfo.accessToken, catalogAsset.external_id, 4) : Promise.resolve([])), errors).then((result) => result ?? []),
  ])

  return {
    generatedAt: new Date().toISOString(),
    assets,
    pixel: pixel ?? null,
    catalog: catalog ?? null,
    feeds,
    token: toPublicToken(tokenInfo),
    errors,
  }
}

async function collectAssets(): Promise<MetaAssetRow[]> {
  const assets: MetaAssetRow[] = []

  if (canUseServiceClient()) {
    try {
      const supabase = getServiceClient()
      const { data, error } = await supabase
        .from('meta_assets')
        .select('asset_type, external_id, display_name, status, metadata, last_synced_at')

      if (error) {
        console.error('[Meta] meta_assets sorgusu başarısız', error)
      } else if (data) {
        assets.push(...data)
      }
    } catch (error) {
      console.error('[Meta] meta_assets okunamadı', error)
    }
  }

  addEnvAsset(assets, 'pixel', process.env.META_PIXEL_ID, 'Meta Pixel')
  addEnvAsset(assets, 'catalog', process.env.META_CATALOG_ID, 'Commerce Catalog')
  addEnvAsset(assets, 'conversions_api', process.env.META_CAPI_APP_ID, 'Conversions API')
  addEnvAsset(assets, 'ad_account', process.env.META_AD_ACCOUNT_ID, 'Ad Account')

  return assets
}

function addEnvAsset(assets: MetaAssetRow[], assetType: string, externalId?: string, displayName?: string) {
  if (!externalId) return

  const alreadyExists = assets.some((asset) => asset.asset_type === assetType && asset.external_id === externalId)
  if (alreadyExists) return

  assets.push({
    asset_type: assetType,
    external_id: externalId,
    display_name: displayName ?? null,
    status: 'configured',
    metadata: null,
    last_synced_at: null,
  })
}

async function resolveSystemUserToken(): Promise<PrivateTokenInfo | null> {
  if (process.env.META_SYSTEM_USER_TOKEN) {
    return {
      accessToken: process.env.META_SYSTEM_USER_TOKEN,
      expiresAt: process.env.META_SYSTEM_USER_TOKEN_EXPIRES_AT ?? null,
      source: 'env',
      metadata: null,
    }
  }

  if (!canUseServiceClient()) {
    return null
  }

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('meta_tokens')
      .select('access_token, expires_at, metadata')
      .eq('token_type', 'system_user')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[Meta] meta_tokens sorgusu başarısız', error)
      return null
    }

    if (!data?.access_token) {
      return null
    }

    return {
      accessToken: data.access_token,
      expiresAt: data.expires_at ?? null,
      source: 'supabase',
      metadata: data.metadata ?? null,
    }
  } catch (error) {
    console.error('[Meta] meta_tokens okunamadı', error)
    return null
  }
}

function toPublicToken(token: PrivateTokenInfo | null): PublicTokenInfo | null {
  if (!token) return null

  return {
    source: token.source,
    expiresAt: token.expiresAt,
    daysRemaining: token.expiresAt ? calculateDaysRemaining(token.expiresAt) : null,
    metadata: token.metadata,
  }
}

function calculateDaysRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

async function safeFetch<T>(label: string, fn: () => Promise<T>, errors: string[]): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[Meta] ${label} isteği başarısız`, error)
    errors.push(`${label} verisi alınamadı`)
    return null
  }
}
