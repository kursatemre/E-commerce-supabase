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
  createdAtLabel: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
  lastOrderLabel: string
}

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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Müşteri Yönetimi</p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Müşteriler & CRM</h1>
          <p className="text-sm text-gray-600">
            Son sipariş verileri, toplam harcama ve hızlı aksiyonlar tek ekranda.
          </p>
        </div>
        <div className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500">
          Güncel kayıtlar • {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
        </div>
      </header>

      <StatsGrid stats={dashboardStats} />

      <section className="rounded-2xl border bg-card/5 shadow-sm">
        <div className="border-b px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Müşteri Listesi</h2>
              <p className="text-sm text-gray-500">Son 200 müşteri, sipariş verileriyle birlikte görüntülenir.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {customers.length} kayıt
            </span>
          </div>
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
      createdAtLabel,
      orderCount: stats.count,
      totalSpent: stats.total,
      lastOrderDate: stats.lastOrder,
      lastOrderLabel,
    }
  })

  return rows.sort((a, b) => b.totalSpent - a.totalSpent)
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
        <div key={stat.label} className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.helper}</p>
        </div>
      ))}
    </div>
  )
}

function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  if (!customers.length) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-500">
        Henüz müşteri kaydı bulunmuyor.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-900">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">Müşteri</th>
            <th className="px-6 py-3">Sipariş</th>
            <th className="px-6 py-3">Toplam Harcama</th>
            <th className="px-6 py-3">Son Sipariş</th>
            <th className="px-6 py-3 text-right">Hızlı İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t">
              <td className="px-6 py-4 align-top">
                <div className="font-semibold text-gray-900">{customer.name}</div>
                <p className="text-xs text-gray-500">{customer.phone || 'Telefon yok'}</p>
                <p className="text-xs text-gray-400">Kayıt: {customer.createdAtLabel}</p>
              </td>
              <td className="px-6 py-4 align-top">
                <p className="font-semibold">{customer.orderCount} sipariş</p>
                <p className="text-xs text-gray-500">SMS: {customer.smsConsent ? 'Açık' : 'Kapalı'}</p>
                <p className="text-xs text-gray-500">KVKK: {customer.kvkkConsent ? 'Var' : 'Yok'}</p>
              </td>
              <td className="px-6 py-4 align-top font-semibold">
                {currencyFormatter.format(customer.totalSpent)}
              </td>
              <td className="px-6 py-4 align-top">
                <p className="text-sm text-gray-900">{customer.lastOrderLabel}</p>
                <p className="text-xs text-gray-500">
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
          className="w-full rounded-full border px-3 py-1 font-semibold text-gray-700 hover:border-gray-400"
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
          className="w-full rounded-full border px-3 py-1 font-semibold text-gray-700 hover:border-gray-400"
        >
          {customer.kvkkConsent ? 'KVKK İzni Kaldır' : 'KVKK İzni Ver'}
        </button>
      </form>
      <div className="rounded-full border border-dashed px-3 py-1 font-semibold text-gray-500">
        ID: {customer.id.slice(0, 8)}…
      </div>
    </div>
  )
}
