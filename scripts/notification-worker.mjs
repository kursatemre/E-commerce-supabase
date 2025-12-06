import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri zorunludur.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
})

const QUEUE_LIMIT = Number(process.env.NOTIFICATION_BATCH_SIZE || 25)
const smsProvider = (process.env.NOTIFICATION_SMS_PROVIDER || 'twilio').toLowerCase()
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER

const twilioClient = twilioAccountSid && twilioAuthToken ? twilio(twilioAccountSid, twilioAuthToken) : null

async function fetchQueuedNotifications() {
  const { data, error } = await supabase
    .from('order_notifications')
    .select(
      'id, order_id, notification_type, channel, recipient_email, recipient_phone, subject, body, attempt_count, provider_payload'
    )
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(QUEUE_LIMIT)

  if (error) {
    throw error
  }

  return data ?? []
}

async function markNotification(notification, status, options = {}) {
  const nextAttemptCount = (notification.attempt_count ?? 0) + 1
  const payload = {
    status,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
    attempt_count: nextAttemptCount,
  }

  if (options.providerPayload !== undefined) {
    payload.provider_payload = options.providerPayload
  }

  if (options.errorCode !== undefined) {
    payload.error_code = options.errorCode
  }

  const { error } = await supabase
    .from('order_notifications')
    .update(payload)
    .eq('id', notification.id)

  if (error) {
    console.error('Bildirim durum güncelleme hatası:', error)
  }
}

async function deliverNotification(notification) {
  const channel = (notification.channel || 'email').toLowerCase()

  if (channel === 'sms') {
    return deliverSms(notification)
  }

  return deliverEmail(notification)
}

async function deliverEmail(notification) {
  console.log(`E-posta kuyruğu → ${notification.notification_type} | ${notification.recipient_email}`)
  return { success: true }
}

async function deliverSms(notification) {
  if (smsProvider !== 'twilio') {
    return { success: false, errorCode: 'sms_provider_unsupported' }
  }

  if (!twilioClient || !twilioFromNumber) {
    return { success: false, errorCode: 'twilio_not_configured' }
  }

  const to = notification.recipient_phone

  if (!to) {
    return { success: false, errorCode: 'missing_phone' }
  }

  try {
    const message = await twilioClient.messages.create({
      to,
      from: twilioFromNumber,
      body: notification.body,
    })

    return {
      success: true,
      providerPayload: {
        sid: message.sid,
        status: message.status,
      },
    }
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? error.code : 'twilio_error'
    const message = error instanceof Error ? error.message : 'Twilio mesaj gönderimi başarısız'
    console.error('Twilio SMS hatası:', message)
    return {
      success: false,
      errorCode: code || 'twilio_error',
    }
  }
}

async function processQueue() {
  const queued = await fetchQueuedNotifications()

  if (!queued.length) {
    console.log('Kuyrukta bildirim yok.')
    return
  }

  console.log(`Toplam ${queued.length} bildirim işleniyor...`)

  for (const notification of queued) {
    try {
      const result = await deliverNotification(notification)
      if (result.success) {
        await markNotification(notification, 'sent', {
          providerPayload: result.providerPayload,
          errorCode: null,
        })
      } else {
        await markNotification(notification, 'failed', {
          errorCode: result.errorCode ?? 'unknown_error',
        })
      }
    } catch (error) {
      console.error('Bildirim gönderim hatası:', error)
      await markNotification(notification, 'failed', {
        errorCode: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }
}

processQueue()
  .then(() => {
    console.log('Bildirim kuyruğu taraması tamamlandı.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Kuyruk işleyici hata verdi:', error)
    process.exit(1)
  })
