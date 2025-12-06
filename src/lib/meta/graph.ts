const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v19.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

export class MetaGraphError extends Error {
  code?: number
  subcode?: number
  type?: string

  constructor(message: string, code?: number, subcode?: number, type?: string) {
    super(message)
    this.name = 'MetaGraphError'
    this.code = code
    this.subcode = subcode
    this.type = type
  }
}

type GraphErrorResponse = {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
  }
}

async function graphGet<T>(path: string, accessToken: string, params: Record<string, string> = {}) {
  if (!accessToken) {
    throw new Error('Meta Graph API erişimi için access token gerekli')
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const url = new URL(`${GRAPH_BASE}/${normalizedPath}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })

  url.searchParams.append('access_token', accessToken)

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await response.json()

  if (!response.ok || (payload as GraphErrorResponse).error) {
    const graphError = (payload as GraphErrorResponse).error
    if (graphError) {
      throw new MetaGraphError(graphError.message, graphError.code, graphError.error_subcode, graphError.type)
    }
    throw new MetaGraphError('Meta Graph API isteği başarısız oldu', response.status)
  }

  return payload as T
}

async function safeGraphGet<T>(path: string, accessToken: string, params: Record<string, string> = {}) {
  try {
    return await graphGet<T>(path, accessToken, params)
  } catch (error) {
    console.error(`[MetaGraph] ${path} isteği başarısız`, error)
    return null
  }
}

export type MetaPixelSummary = {
  id: string
  name: string
  last_fired_time?: string
  creation_time?: string
}

export type MetaCatalogSummary = {
  id: string
  name: string
  product_count?: number
}

export type MetaCatalogFeed = {
  id: string
  name: string
  schedule?: string | null
  last_upload_time?: string | null
  status?: string | null
  error_count?: number | null
  warning_count?: number | null
  error_summary?: string | null
}

type RawFeedUpload = {
  id: string
  end_time?: string
  start_time?: string
  error_count?: number
  warning_count?: number
  error_summary?: string
  status?: string
}

type RawFeed = {
  id: string
  name: string
  schedule?: {
    interval?: string
    url?: string
    hour?: number
  } | null
}

export async function fetchPixelSummary(accessToken: string, pixelId: string) {
  return graphGet<MetaPixelSummary>(pixelId, accessToken, {
    fields: 'id,name,last_fired_time,creation_time',
  })
}

export async function fetchCatalogSummary(accessToken: string, catalogId: string) {
  return graphGet<MetaCatalogSummary>(catalogId, accessToken, {
    fields: 'id,name,product_count',
  })
}

export async function fetchCatalogFeeds(accessToken: string, catalogId: string, limit = 4) {
  const feedsResponse = await safeGraphGet<{ data: RawFeed[] }>(`${catalogId}/product_feeds`, accessToken, {
    limit: String(limit),
    fields: 'id,name,schedule',
  })

  if (!feedsResponse?.data?.length) {
    return [] as MetaCatalogFeed[]
  }

  const feeds = await Promise.all(
    feedsResponse.data.map(async (feed) => {
      const uploads = await safeGraphGet<{ data: RawFeedUpload[] }>(`${feed.id}/uploads`, accessToken, {
        limit: '1',
        fields: 'id,end_time,start_time,error_count,warning_count,error_summary,status',
      })

      const latestUpload = uploads?.data?.[0]

      return {
        id: feed.id,
        name: feed.name,
        schedule: feed.schedule?.interval ?? null,
        last_upload_time: latestUpload?.end_time ?? latestUpload?.start_time ?? null,
        status: latestUpload?.status ?? null,
        error_count: latestUpload?.error_count ?? null,
        warning_count: latestUpload?.warning_count ?? null,
        error_summary: latestUpload?.error_summary ?? null,
      }
    })
  )

  return feeds
}
