import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

type WebhookPayload = {
  eventType?: string
  type?: string
  status?: string
  orderId?: string | number
  orderNumber?: string
  lines?: Array<{ status?: string }>
  [key: string]: unknown
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_FUNCTIONS_URL = Deno.env.get('SUPABASE_FUNCTIONS_URL')
const WEBHOOK_TOKEN = Deno.env.get('TRENDYOL_WEBHOOK_TOKEN')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables for Trendyol webhook')
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Only POST is accepted.' }, 405)
  }

  if (WEBHOOK_TOKEN) {
    const headerToken = req.headers.get('x-webhook-token') ?? req.headers.get('authorization')?.replace('Bearer ', '')
    if (headerToken !== WEBHOOK_TOKEN) {
      return jsonResponse({ success: false, message: 'Unauthorized' }, 401)
    }
  }

  let payload: WebhookPayload
  try {
    payload = (await req.json()) as WebhookPayload
  } catch (error) {
    console.error('[TrendyolWebhook] Payload parse error', error)
    return jsonResponse({ success: false, message: 'Invalid JSON payload.' }, 400)
  }

  const eventType = extractEventType(payload)

  const eventMetadata = {
    headers: {
      'x-trendyol-event': req.headers.get('x-trendyol-event'),
      'user-agent': req.headers.get('user-agent'),
    },
  }

  const { data: insertedEvent, error: insertError } = await supabase
    .from('trendyol_webhook_events')
    .insert({
      event_type: eventType,
      payload,
      metadata: eventMetadata,
    })
    .select('id')
    .single()

  if (insertError || !insertedEvent) {
    console.error('[TrendyolWebhook] Event insert failed', insertError)
    return jsonResponse({ success: false, message: 'Event could not be stored.' }, 500)
  }

  const statuses = collectStatuses(payload)

  try {
    await triggerOrdersSync(statuses)
    await supabase
      .from('trendyol_webhook_events')
      .update({
        processed_at: new Date().toISOString(),
        metadata: { ...eventMetadata, statuses },
      })
      .eq('id', insertedEvent.id)

    return jsonResponse({ success: true, triggered: statuses })
  } catch (error) {
    console.error('[TrendyolWebhook] sync trigger failed', error)
    await supabase
      .from('trendyol_webhook_events')
      .update({ error_message: error instanceof Error ? error.message : String(error) })
      .eq('id', insertedEvent.id)

    return jsonResponse({ success: false, message: 'Sync trigger failed.' }, 500)
  }
})

function extractEventType(payload: WebhookPayload) {
  return payload.eventType ?? payload.type ?? 'unknown'
}

function collectStatuses(payload: WebhookPayload) {
  const statusSet = new Set<string>()
  if (payload.status) {
    statusSet.add(String(payload.status))
  }
  if (Array.isArray(payload.lines)) {
    payload.lines.forEach((line) => {
      if (line?.status) {
        statusSet.add(String(line.status))
      }
    })
  }
  return Array.from(statusSet)
}

async function triggerOrdersSync(statuses: string[]) {
  if (!SUPABASE_FUNCTIONS_URL) {
    console.warn('[TrendyolWebhook] SUPABASE_FUNCTIONS_URL tanımlı değil, cron tetiklenemedi')
    return
  }

  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/trendyol-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ type: 'orders', statuses: statuses.length ? statuses : undefined }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Sync function failed: ${response.status} ${message}`)
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
