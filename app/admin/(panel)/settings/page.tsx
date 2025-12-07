import { NotificationPreferencesForm, SecuritySettingsForm, StoreProfileForm } from '@/components/settings/SettingsForms'
import { createClient } from '@/lib/supabase/server'
import type { StoreSettingsRecord } from '@/types/settings'

type NotificationRecord = {
  status: string | null
}

type StatCard = {
  label: string
  value: string
  helper: string
}

type TimelineEntry = {
  title: string
  subtitle: string
  tone: 'info' | 'success' | 'warning'
}

const fallbackSettings: StoreSettingsRecord = {
  id: 'primary',
  store_name: 'Mağazanız',
  support_email: 'destek@example.com',
  support_phone: '+90 000 000 00 00',
  preferred_currency: 'TRY',
  return_window_days: 14,
  timezone: 'Europe/Istanbul',
  working_hours: '09:00 - 18:00',
  notifications_email: true,
  notifications_sms: false,
  notifications_returns: true,
  alerts_low_stock: true,
  two_factor_required: true,
  session_timeout_minutes: 30,
}

const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function SettingsPage() {
  const supabase = await createClient()

  const [settingsResult, adminCountResult, notificationsResult] = await Promise.all([
    supabase.from('store_settings').select('*').eq('id', 'primary').maybeSingle(),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['admin', 'owner']),
    supabase
      .from('order_notifications')
      .select('status')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (settingsResult.error) {
    console.error('Store settings fetch error', settingsResult.error)
  }
  if (adminCountResult.error) {
    console.error('Admin count fetch error', adminCountResult.error)
  }
  if (notificationsResult.error) {
    console.error('Notification fetch error', notificationsResult.error)
  }

  const storeSettings: StoreSettingsRecord = settingsResult.data ?? fallbackSettings
  const adminCount = adminCountResult.count ?? 0
  const notificationStatuses = (notificationsResult.data as NotificationRecord[] | null) ?? []

  const stats = buildStats(storeSettings, adminCount, notificationStatuses)
  const timeline = buildTimeline(storeSettings, notificationStatuses)

  return (
    <div className="space-y-6 text-gray-100">
      <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 shadow-2xl shadow-black/60">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">Kontrol Merkezi</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-white">Ayarlar & Erişim Politikaları</h1>
              <p className="text-sm text-gray-300">
                Mağaza kimliği, operasyon bildirimleri ve güvenlik katmanlarını tek panelden yönetin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-200">
              {['Destek', 'Bildirim', 'Güvenlik'].map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold tracking-wide">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 shadow-inner shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-gray-400">Mağaza</p>
            <p className="text-2xl font-semibold text-white">{storeSettings.store_name}</p>
            <p className="text-xs text-gray-400">{storeSettings.support_email}</p>
            <p className="text-xs text-gray-400">TZ: {storeSettings.timezone}</p>
          </div>
        </div>
      </section>

      <StatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <StoreProfileForm initialData={storeSettings} />
        <NotificationPreferencesForm initialData={storeSettings} />
        <SecuritySettingsForm initialData={storeSettings} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <SystemChannelsCard settings={storeSettings} adminCount={adminCount} />
        <AuditTimeline entries={timeline} />
      </div>
    </div>
  )
}

function buildStats(settings: StoreSettingsRecord, adminCount: number, notifications: NotificationRecord[]): StatCard[] {
  const totalNotifications = notifications.length
  const delivered = notifications.filter((notification) => notification.status === 'sent').length
  const deliveryRate = totalNotifications === 0 ? 0 : Math.round((delivered / totalNotifications) * 100)

  return [
    {
      label: 'Aktif Admin',
      value: adminCount.toString(),
      helper: 'Rolü admin/owner olan kullanıcı',
    },
    {
      label: 'Bildirim Sağlığı',
      value: `${deliveryRate}%`,
      helper: `${delivered}/${totalNotifications || 0} son 20 uyarı`,
    },
    {
      label: 'İade Süresi',
      value: `${settings.return_window_days ?? 14} gün`,
      helper: 'return_window_days',
    },
    {
      label: '2FA Durumu',
      value: settings.two_factor_required ? 'Zorunlu' : 'Opsiyonel',
      helper: 'two_factor_required',
    },
  ]
}

function buildTimeline(settings: StoreSettingsRecord, notifications: NotificationRecord[]): TimelineEntry[] {
  const latestNotice = notifications.at(0)?.status

  const entries: TimelineEntry[] = [
    {
      title: settings.two_factor_required ? '2FA zorunlu' : '2FA opsiyonel',
      subtitle: settings.two_factor_required
        ? 'Tüm admin girişlerinde çift doğrulama istenir.'
        : 'Girişler yalnızca e-posta/şifre ile tamamlanır.',
      tone: settings.two_factor_required ? 'success' : 'warning',
    },
    {
      title: settings.notifications_email ? 'Sipariş e-postaları aktif' : 'Sipariş e-postaları pasif',
      subtitle: settings.notifications_email
        ? 'Yeni sipariş ve ödeme onayı bildirimleri gönderiliyor.'
        : 'E-posta bildirimi devre dışı.',
      tone: settings.notifications_email ? 'success' : 'warning',
    },
    {
      title: `Son bildirim sonucu: ${latestNotice ?? '—'}`,
      subtitle: 'order_notifications tablosundaki en güncel kayıt.',
      tone: latestNotice === 'sent' ? 'success' : latestNotice === 'failed' ? 'warning' : 'info',
    },
  ]

  if (settings.updated_at) {
    entries.unshift({
      title: 'Ayarlar güncellendi',
      subtitle: dateTimeFormatter.format(new Date(settings.updated_at)),
      tone: 'info',
    })
  }

  return entries
}

function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-lg shadow-black/30">
          <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.helper}</p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-500/50 via-fuchsia-500/50 to-transparent" />
        </div>
      ))}
    </div>
  )
}

function SystemChannelsCard({ settings, adminCount }: { settings: StoreSettingsRecord; adminCount: number }) {
  return (
    <section className="rounded-3xl border border-gray-800 bg-gray-900/50 p-6 shadow-2xl shadow-black/30 lg:col-span-2">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Destek & SLA</p>
        <h3 className="text-lg font-semibold text-white">Operasyon Kanalları</h3>
        <p className="text-sm text-gray-400">Ekiplere dağıtılan temel iletişim bilgileri.</p>
      </header>
      <div className="mt-4 space-y-3 text-sm text-gray-300">
        <InfoRow label="Destek E-posta" value={settings.support_email ?? '—'} />
        <InfoRow label="Destek Telefonu" value={settings.support_phone ?? '—'} />
        <InfoRow label="Çalışma Saatleri" value={settings.working_hours ?? 'Tanımlanmadı'} />
        <InfoRow label="Saat Dilimi" value={settings.timezone ?? 'Europe/Istanbul'} />
        <InfoRow label="Admin Sayısı" value={`${adminCount} kişi`} />
      </div>
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-gray-300">
        <p>Bildirimler {settings.alert_email || 'tanımlanmış e-posta'} adresine ve opsiyonel Slack webhook&apos;una gönderilir.</p>
      </div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2">
      <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function AuditTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <section className="rounded-3xl border border-gray-800 bg-gray-950/50 p-6 shadow-2xl shadow-black/30 lg:col-span-3">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Denetim</p>
        <h3 className="text-lg font-semibold text-white">Politika Günlükleri</h3>
        <p className="text-sm text-gray-400">Son değişikliklerin özet akışı.</p>
      </header>
      <ol className="mt-4 space-y-4">
        {entries.map((entry, index) => (
          <li key={`${entry.title}-${index}`} className="flex items-start gap-3">
            <span
              className={`mt-1 h-3 w-3 rounded-full ${
                entry.tone === 'success' ? 'bg-emerald-400' : entry.tone === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-white">{entry.title}</p>
              <p className="text-xs text-gray-400">{entry.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
