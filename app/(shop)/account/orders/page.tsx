import { redirect } from "next/navigation";

import { createReturnRequest } from "@/actions/returns";
import { createClient } from "@/lib/supabase/server";

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
};

type ReturnRequestMetadata = {
  customer_note?: string | null;
  email?: string | null;
  order_number?: string | null;
};

type ReturnRequest = {
  id: string;
  status: string;
  reason: string | null;
  notes: string | null;
  refund_amount: number | null;
  requested_at: string | null;
  processed_at: string | null;
  metadata: ReturnRequestMetadata | null;
};

type OrderWithItems = {
  id: string;
  order_number: string | null;
  status: string | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  total: number | null;
  created_at: string | null;
  delivered_at: string | null;
  shipping_address: Record<string, unknown> | null;
  order_items: OrderItem[];
  return_requests: ReturnRequest[];
};

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabels: Record<string, string> = {
  pending: "Onay Bekliyor",
  processing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  return_requested: "İade Talep Edildi",
  return_in_transit: "İade Kargoda",
  return_inspection: "Kontrol Ediliyor",
  refunded: "İade Tamamlandı",
  awaiting_payment: "Ödeme Bekleniyor",
  paid: "Ödeme Alındı",
  refunded_payment: "Ücret İade Edildi",
  preparing: "Depoda Hazırlanıyor",
  packed: "Paketlendi",
};

const RETURN_STATUS_LABELS: Record<string, string> = {
  pending: "Talep Alındı",
  approved: "Onaylandı",
  in_transit: "İade Kargoda",
  inspection: "Kontrol Aşamasında",
  refunded: "İade Tamamlandı",
  rejected: "Reddedildi",
};

const ACTIVE_RETURN_STATUSES = new Set(["pending", "approved", "in_transit", "inspection"]);

const RETURN_REASON_OPTIONS = [
  { value: "size_issue", label: "Beden / Ölçü Sorunu" },
  { value: "defective", label: "Ürün Hasarlı" },
  { value: "not_as_expected", label: "Beklenti Karşılanmadı" },
  { value: "wrong_item", label: "Yanlış Ürün Gönderildi" },
  { value: "other", label: "Diğer" },
];

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, payment_status, fulfillment_status, total, created_at, delivered_at, shipping_address,
      order_items ( id, product_name, product_price, quantity, subtotal ),
      return_requests ( id, status, reason, notes, refund_amount, requested_at, processed_at, metadata )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    console.error("Account orders fetch error", error);
  }

  const normalizedOrders: OrderWithItems[] = (orders as OrderWithItems[])?.map((order) => ({
    ...order,
    order_items: order.order_items ?? [],
    return_requests: order.return_requests ?? [],
  })) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Siparişlerim</h2>
        <p className="text-sm text-gray-600">
          Son siparişlerinizi, kargo durumlarını ve Kolay İade aksiyonlarını buradan takip edebilirsiniz.
        </p>
      </header>

      {normalizedOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
          Henüz bir siparişiniz yok. Alışverişe başlamak için mağazaya dönebilirsiniz.
        </div>
      ) : (
        <ol className="space-y-4">
          {normalizedOrders.map((order) => {
            const latestReturnRequest = getLatestReturnRequest(order.return_requests);
            const hasActiveReturn = latestReturnRequest ? ACTIVE_RETURN_STATUSES.has(latestReturnRequest.status) : false;
            const isEligibleForReturn = Boolean(order.delivered_at) && !hasActiveReturn;

            return (
              <li key={order.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Sipariş</p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.order_number || order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.created_at ? dateFormatter.format(new Date(order.created_at)) : "Tarih bulunamadı"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex flex-wrap justify-end gap-2 text-xs">
                    <StatusBadge label="Sipariş" value={order.status} />
                    <StatusBadge label="Kargo" value={order.fulfillment_status} variant="info" />
                    <StatusBadge label="Ödeme" value={order.payment_status} variant="success" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Toplam</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currencyFormatter.format(order.total ?? 0)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-300"
                    >
                      Detay
                    </button>
                    <ReturnRequestTrigger
                      orderId={order.id}
                      request={latestReturnRequest}
                      hasActiveReturn={hasActiveReturn}
                      isEligible={isEligibleForReturn}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Sipariş İçeriği</p>
                  <ul className="mt-2 space-y-2">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-500">
                            Adet: {item.quantity} • Birim: {currencyFormatter.format(item.product_price)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{currencyFormatter.format(item.subtotal)}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Teslimat Bilgisi</p>
                  <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    {renderAddress(order.shipping_address)}
                  </div>
                </div>
              </div>

                {latestReturnRequest && (
                  <div className="mt-4">
                    <ReturnStatusCard request={latestReturnRequest} />
                  </div>
                )}
            </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function getLatestReturnRequest(requests: ReturnRequest[]): ReturnRequest | null {
  if (!requests?.length) return null;
  return requests.reduce((latest, current) => {
    const latestTime = getReturnTimestamp(latest);
    const currentTime = getReturnTimestamp(current);
    return currentTime > latestTime ? current : latest;
  });
}

const getReturnTimestamp = (request: ReturnRequest | null | undefined) => {
  if (!request) return 0;
  const stamp = request.processed_at ?? request.requested_at;
  return stamp ? new Date(stamp).getTime() : 0;
};

type ReturnRequestTriggerProps = {
  orderId: string;
  request: ReturnRequest | null;
  hasActiveReturn: boolean;
  isEligible: boolean;
};

function ReturnRequestTrigger({ orderId, request, hasActiveReturn, isEligible }: ReturnRequestTriggerProps) {
  if (hasActiveReturn && request) {
    return (
      <div className="text-right">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true"></span>
          {RETURN_STATUS_LABELS[request.status] ?? "İade Süreci"}
        </span>
        <p className="mt-1 text-[11px] text-gray-500">Talep {formatDate(request.requested_at)}</p>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-400"
      >
        İade İçin Uygun Değil
      </button>
    );
  }

  return (
    <details className="group relative w-full sm:w-auto [&_summary::-webkit-details-marker]:hidden">
      <summary className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        Kolay İade Başlat
      </summary>
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-left text-sm shadow-lg sm:absolute sm:right-0 sm:z-10 sm:w-80">
        <p className="font-semibold text-gray-900">İade Talebi</p>
        <p className="text-xs text-gray-500">Neden seçip kısa bir açıklama ekleyebilirsiniz.</p>
        <div className="mt-3">
          <ReturnRequestForm orderId={orderId} />
        </div>
      </div>
    </details>
  );
}

function ReturnRequestForm({ orderId }: { orderId: string }) {
  return (
    <form action={createReturnRequest} className="space-y-3 text-left">
      <input type="hidden" name="order_id" value={orderId} />
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">İade Nedeni</label>
        <select
          name="reason"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
          defaultValue=""
        >
          <option value="" disabled>
            Bir neden seçin
          </option>
          {RETURN_REASON_OPTIONS.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Not (opsiyonel)</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Sorunu kısaca anlatın"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
        />
      </div>
      <button type="submit" className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
        Talebi Gönder
      </button>
    </form>
  );
}

function ReturnStatusCard({ request }: { request: ReturnRequest }) {
  const palette = getReturnStatusPalette(request.status);
  const label = RETURN_STATUS_LABELS[request.status] ?? "İade Talebi";
  const reasonLabel = getReasonLabel(request.reason);
  const rawCustomerNote = request.metadata?.customer_note ?? null;
  const customerNote = rawCustomerNote?.trim() ? rawCustomerNote : null;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${palette.border} ${palette.background}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">İade Durumu</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette.badge}`}>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-900">{reasonLabel}</p>
      <p className="text-xs text-gray-500">Talep Tarihi: {formatDate(request.requested_at)}</p>
      {customerNote && (
        <blockquote className="mt-2 rounded-lg border border-dashed border-gray-200 bg-white/70 px-3 py-2 text-xs italic text-gray-700">
          “{customerNote}”
        </blockquote>
      )}
      {request.refund_amount && (
        <p className="mt-2 text-sm font-semibold text-gray-900">
          İade Tutarı: {currencyFormatter.format(request.refund_amount)}
        </p>
      )}
      {request.notes && <p className="mt-1 text-xs text-gray-600">Operasyon Notu: {request.notes}</p>}
    </div>
  );
}

const formatDate = (value: string | null) => (value ? dateFormatter.format(new Date(value)) : "—");

const getReasonLabel = (reason: string | null) =>
  RETURN_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason ?? "Neden belirtilmedi";

function getReturnStatusPalette(status: string) {
  const paletteMap: Record<
    string,
    { border: string; background: string; badge: string }
  > = {
    pending: { border: "border-amber-200", background: "bg-amber-50", badge: "bg-amber-100 text-amber-800" },
    approved: { border: "border-blue-200", background: "bg-blue-50", badge: "bg-blue-100 text-blue-800" },
    in_transit: { border: "border-purple-200", background: "bg-purple-50", badge: "bg-purple-100 text-purple-800" },
    inspection: { border: "border-orange-200", background: "bg-orange-50", badge: "bg-orange-100 text-orange-800" },
    refunded: { border: "border-emerald-200", background: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-800" },
    rejected: { border: "border-rose-200", background: "bg-rose-50", badge: "bg-rose-100 text-rose-800" },
  };

  return paletteMap[status] ?? { border: "border-gray-200", background: "bg-gray-50", badge: "bg-gray-100 text-gray-800" };
}

function StatusBadge({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | null;
  variant?: "default" | "info" | "success";
}) {
  const colorMap = {
    default: "bg-gray-100 text-gray-700",
    info: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${colorMap[variant]}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      <span className="text-xs font-medium">{statusLabels[value ?? ""] || "Bilinmiyor"}</span>
    </span>
  );
}

function renderAddress(address: Record<string, unknown> | null) {
  if (!address || typeof address !== "object") {
    return <p>Adres bilgisi bulunamadı.</p>;
  }

  const fullName = String(address.fullName ?? address.name ?? "");
  const phone = String(address.phone ?? "");
  const rawAddress = String(address.address ?? address.line ?? "");
  const city = String(address.city ?? "");
  const zipCode = String(address.zipCode ?? address.postal_code ?? "");

  return (
    <div className="space-y-1">
      <p className="font-semibold text-gray-900">{fullName || "Gönderim Adresi"}</p>
      <p>{rawAddress}</p>
      <p>
        {city} {zipCode}
      </p>
      <p className="text-xs text-gray-500">{phone || "Telefon belirtilmedi"}</p>
    </div>
  );
}
