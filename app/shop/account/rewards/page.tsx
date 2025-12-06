const summaryHighlights = [
  {
    label: "Toplam Puan",
    value: "—",
    helper: "loyalty_balances.current_balance",
  },
  {
    label: "Bu Ay Kazanılan",
    value: "—",
    helper: "loyalty_transactions.earned_this_month",
  },
  {
    label: "Yakında Dolacak",
    value: "—",
    helper: "loyalty_balances.expires_at",
  },
  {
    label: "Kullanılabilir Kupon",
    value: "—",
    helper: "coupon_codes.status = 'active'",
  },
];

const loyaltyTimeline = [
  {
    title: "Siparişten Puan Kazan",
    description: "order_events.completed tetiklendiğinde loyalty_transactions tablosuna +100 puan yaz.",
    futureHook: "trigger: order_events → loyalty_transactions",
  },
  {
    title: "Puan Harca",
    description: "checkout sırasında loyalty_balances'tan düşülen tutarı order_discounts tablosuna kaydet.",
    futureHook: "mutation: applyLoyaltyDiscount",
  },
  {
    title: "Puan Son Kullanma",
    description: "expires_at alanı dolduğunda otomatik sıfırlama job'ı çalıştır (cron).",
    futureHook: "job: loyalty_expirations",
  },
];

const couponRoadmap = [
  {
    code: "WELCOME20",
    status: "Planlandı",
    note: "Yeni kayıt olanlara özel tek kullanımlık kupon.",
  },
  {
    code: "POINTS-BOOST",
    status: "Bekliyor",
    note: "Belirli kategorilerden alışverişe %10 ekstra puan.",
  },
  {
    code: "BIRTHDAY",
    status: "Bekliyor",
    note: "Doğum günü haftasında otomatik tetiklenecek hediye kuponu.",
  },
];

const integrationChecklist = [
  "Supabase'de loyalty_balances ve loyalty_transactions tablolarını tanımla (customer_id FK).",
  "coupon_codes ve coupon_usages tablolarıyla kuponların lifecycle'ını izle.",
  "Order submit sırasında loyalty earn web hook'u tetiklemek için background job ekle.",
  "Account tabs içinde promolara dair günlük cache (revalidateTag: 'rewards').",
  "Admin panelinde manual puan düzeltme action'ı için endpoint hazırlığı.",
];

export default function AccountRewardsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Puanlarım & Kuponlarım</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Placeholder
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Gerçek veri modeli hazır olana kadar bu bölüm bilgi kartı olarak hizmet ediyor. Aşağıdaki plan doğrultusunda
          sadakat kurgusu devreye alınacak.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-dashed bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{item.value}</p>
            <p className="mt-1 text-xs text-gray-400">{item.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white/80 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sadakat Akışı</h3>
              <p className="text-sm text-gray-600">loyalty_transactions tablosuna gidecek işlemler</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Yakında</span>
          </div>
          <div className="mt-4 space-y-4">
            {loyaltyTimeline.map((step) => (
              <div key={step.title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                <p className="mt-2 text-xs font-mono text-gray-500">{step.futureHook}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white/80 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kupon Fikirleri</h3>
              <p className="text-sm text-gray-600">coupon_codes + coupon_usages taslağı</p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">Planlama</span>
          </div>
          <div className="mt-4 space-y-3">
            {couponRoadmap.map((coupon) => (
              <div key={coupon.code} className="flex flex-col rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-900">{coupon.code}</p>
                  <p className="text-sm text-gray-600">{coupon.note}</p>
                </div>
                <span className="mt-2 inline-flex w-max rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:mt-0">
                  {coupon.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Teknik Notlar & Sonraki Adımlar</h3>
        <p className="text-sm text-gray-600">Hazırlık tamamlandığında bu liste check-list olarak kullanılabilir.</p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          {integrationChecklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-400"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
