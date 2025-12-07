import { updateCustomerFlag } from '@/actions/customers'
import { createClient } from '@/lib/supabase/server'

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

type ProfileRecord = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  kvkk_consent: boolean | null
  sms_consent: boolean | null
  created_at: string | null
}

type OrderRecord = {
  id: string
  user_id: string | null
  total: number | null
  created_at: string | null
  status: string | null
}

type CustomerRow = {
  id: string
  name: string
  phone: string | null
  smsConsent: boolean
  kvkkConsent: boolean
  createdAt: string | null
  createdAtLabel: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
  lastOrderLabel: string
}

type SegmentSnapshot = {
  label: string
  value: number
  helper: string
}[]

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const [profilesResult, ordersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, phone, kvkk_consent, sms_consent, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('orders')
      .select('id, user_id, total, created_at, status')
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  if (profilesResult.error) {
    console.error('Profiles fetch error', profilesResult.error)
  }
  if (ordersResult.error) {
    console.error('Orders fetch error', ordersResult.error)
  }

  const profiles = (profilesResult.data as ProfileRecord[] | null) ?? []
  const orders = (ordersResult.data as OrderRecord[] | null) ?? []

  const customers = buildCustomerRows(profiles, orders)
  const dashboardStats = buildDashboardStats(customers, orders)
  const segmentSnapshot = buildSegmentSnapshot(customers)
  const refreshedAtLabel = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })

  return (
    <div className="space-y-6 text-gray-100">
      <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 shadow-2xl shadow-black/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">Müşteri Yönetimi</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white">Müşteriler & CRM</h1>
              <p className="text-sm text-gray-300">
                Sadakat, yeniden satın alma ve SMS/KVKK aksiyonlarını tek bir karar panelinden yönetin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-200">
              {['Segmentasyon', 'Sadakat', 'Analitik'].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold tracking-wide text-gray-100"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 shadow-inner shadow-black/20">
            <p className="text-xs uppercase tracking-wide text-gray-400">Güncel kayıtlar</p>
            <p className="text-2xl font-semibold text-white">{refreshedAtLabel}</p>
            <p className="text-xs text-gray-400">Supabase canlı veri • her yenilemede güncellenir</p>
          </div>
        </div>
      </section>

      <StatsGrid stats={dashboardStats} />

      <SegmentBadges segments={segmentSnapshot} />

      <section className="rounded-3xl border border-gray-800 bg-gray-900/70 shadow-2xl shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 bg-gray-900/80 px-6 py-5">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">CRM Kaynakları</p>
            <h2 className="text-lg font-semibold text-white">Müşteri Listesi</h2>
            <p className="text-sm text-gray-400">Son 200 müşteri, sipariş metrikleriyle birlikte eşlenir.</p>
          </div>
          <span className="rounded-full border border-gray-700 bg-gray-800/70 px-4 py-1.5 text-xs font-semibold text-gray-200">
            {customers.length} kayıt
          </span>
        </div>

        <CustomerTable customers={customers} />
      </section>
    </div>
  )
}

function buildCustomerRows(profiles: ProfileRecord[], orders: OrderRecord[]): CustomerRow[] {
  const statsByUser = new Map<string, { total: number; count: number; lastOrder: string | null }>()

  orders.forEach((order) => {
    if (!order.user_id) return
    const current = statsByUser.get(order.user_id) ?? { total: 0, count: 0, lastOrder: null }
    current.total += order.total ?? 0
    current.count += 1
    if (!current.lastOrder || (order.created_at && order.created_at > current.lastOrder)) {
      current.lastOrder = order.created_at ?? null
    }
    statsByUser.set(order.user_id, current)
  })

  const formatter = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' })

  const rows = profiles.map((profile) => {
    const stats = statsByUser.get(profile.id) ?? { total: 0, count: 0, lastOrder: null }
    const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    const createdAtLabel = profile.created_at ? formatter.format(new Date(profile.created_at)) : '—'
    const lastOrderLabel = stats.lastOrder ? formatter.format(new Date(stats.lastOrder)) : 'Sipariş yok'

    return {
      id: profile.id,
      name: fullName || 'İsimsiz Müşteri',
      phone: profile.phone,
      smsConsent: Boolean(profile.sms_consent),
      kvkkConsent: Boolean(profile.kvkk_consent),
      createdAt: profile.created_at,
      createdAtLabel,
      orderCount: stats.count,
      totalSpent: stats.total,
      lastOrderDate: stats.lastOrder,
      lastOrderLabel,
    }
  })

  return rows.sort((a, b) => b.totalSpent - a.totalSpent)
}

function buildSegmentSnapshot(customers: CustomerRow[]): SegmentSnapshot {
  const now = Date.now()
  const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30

  const newCustomers = customers.filter((customer) => {
    if (!customer.createdAt) return false
    const createdAtTime = new Date(customer.createdAt).getTime()
    if (Number.isNaN(createdAtTime)) return false
    return now - createdAtTime <= thirtyDaysMs
  }).length

  const vipCustomers = customers.filter((customer) => customer.totalSpent >= 10000).length
  const dormantCustomers = customers.filter((customer) => !customer.lastOrderDate).length

  return [
    { label: 'VIP', value: vipCustomers, helper: '10K+ TL harcama' },
    { label: 'Uyuyan', value: dormantCustomers, helper: 'Henüz sipariş yok' },
    { label: 'Yeni', value: newCustomers, helper: 'Son 30 günde eklendi' },
  ]
}

function buildDashboardStats(customers: CustomerRow[], orders: OrderRecord[]) {
  const totalCustomers = customers.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0)
  const returningCustomers = customers.filter((customer) => customer.orderCount > 1).length

  const avgOrderValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders
  const repeatRate = totalCustomers === 0 ? 0 : (returningCustomers / totalCustomers) * 100

  return [
    {
      label: 'Toplam Müşteri',
      value: totalCustomers.toLocaleString('tr-TR'),
      helper: 'profiles kaydı',
    },
    {
      label: 'Toplam Sipariş',
      value: totalOrders.toLocaleString('tr-TR'),
      helper: 'orders tablosu',
    },
    {
      label: 'Ciro',
      value: currencyFormatter.format(totalRevenue),
      helper: 'orders.total toplamı',
    },
    {
      label: 'Tekrar Sipariş %',
      value: `${repeatRate.toFixed(1)}%`,
      helper: '>= 2 sipariş verenler',
    },
    {
      label: 'Ortalama Sipariş',
      value: currencyFormatter.format(avgOrderValue || 0),
      helper: 'Toplam / Sipariş',
    },
    {
      label: 'SMS İzni',
      value: `${customers.filter((customer) => customer.smsConsent).length}/${totalCustomers}`,
      helper: 'sms_consent = true',
    },
  ]
}

function StatsGrid({
  stats,
}: {
  stats: {
    label: string
    value: string
    helper: string
  }[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4 shadow-lg shadow-black/30"
        >
          <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.helper}</p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-500/60 via-fuchsia-500/60 to-transparent" />
        </div>
      ))}
    </div>
  )
}

function SegmentBadges({ segments }: { segments: SegmentSnapshot }) {
  if (!segments.length) return null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 text-gray-200 shadow-lg shadow-black/20"
        >
          <p className="text-xs uppercase tracking-wide text-gray-400">{segment.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{segment.value.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-gray-500">{segment.helper}</p>
        </div>
      ))}
    </div>
  )
}

function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  if (!customers.length) {
    return (
      <div className="px-6 py-12 text-center text-sm text-gray-400">
        Henüz müşteri kaydı bulunmuyor.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-100">
        <thead className="text-left text-xs uppercase tracking-wide text-gray-400">
          <tr className="border-b border-gray-800 bg-gray-900/60">
            <th className="px-6 py-3 font-semibold">Müşteri</th>
            <th className="px-6 py-3 font-semibold">Sipariş</th>
            <th className="px-6 py-3 font-semibold">Toplam Harcama</th>
            <th className="px-6 py-3 font-semibold">Son Sipariş</th>
            <th className="px-6 py-3 text-right font-semibold">Hızlı İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="border-t border-gray-800/80 bg-gray-900/20 transition-colors hover:bg-gray-900/50"
            >
              <td className="px-6 py-4 align-top">
                <div className="font-semibold text-white">{customer.name}</div>
                <p className="text-xs text-gray-400">{customer.phone || 'Telefon yok'}</p>
                <p className="text-xs text-gray-500">Kayıt: {customer.createdAtLabel}</p>
              </td>
              <td className="px-6 py-4 align-top">
                <p className="font-semibold text-white">{customer.orderCount} sipariş</p>
                <p className="text-xs text-gray-400">SMS: {customer.smsConsent ? 'Açık' : 'Kapalı'}</p>
                <p className="text-xs text-gray-400">KVKK: {customer.kvkkConsent ? 'Var' : 'Yok'}</p>
              </td>
              <td className="px-6 py-4 align-top font-semibold text-blue-300">
                {currencyFormatter.format(customer.totalSpent)}
              </td>
              <td className="px-6 py-4 align-top">
                <p className="text-sm text-white">{customer.lastOrderLabel}</p>
                <p className="text-xs text-gray-400">
                  {customer.lastOrderDate ? 'Güncel sipariş var' : 'Sipariş bekleniyor'}
                </p>
              </td>
              <td className="px-6 py-4 align-top text-right">
                <CustomerQuickActions customer={customer} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CustomerQuickActions({ customer }: { customer: CustomerRow }) {
  return (
    <div className="flex flex-col gap-2 text-xs">
      <form action={updateCustomerFlag} className="space-y-2">
        <input type="hidden" name="profile_id" value={customer.id} />
        <input type="hidden" name="field" value="sms_consent" />
        <input type="hidden" name="value" value={(!customer.smsConsent).toString()} />
        <button
          type="submit"
          className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-3 py-2 font-semibold text-gray-100 transition hover:border-blue-500 hover:bg-blue-600/20 hover:text-white"
        >
          {customer.smsConsent ? 'SMS İzni Kapat' : 'SMS İzni Aç'}
        </button>
      </form>
      <form action={updateCustomerFlag} className="space-y-2">
        <input type="hidden" name="profile_id" value={customer.id} />
        <input type="hidden" name="field" value="kvkk_consent" />
        <input type="hidden" name="value" value={(!customer.kvkkConsent).toString()} />
        <button
          type="submit"
          className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-3 py-2 font-semibold text-gray-100 transition hover:border-fuchsia-500 hover:bg-fuchsia-600/20 hover:text-white"
        >
          {customer.kvkkConsent ? 'KVKK İzni Kaldır' : 'KVKK İzni Ver'}
        </button>
      </form>
      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 px-3 py-2 font-semibold text-gray-400">
        ID: {customer.id.slice(0, 8)}…
      </div>
    </div>
  )
}
