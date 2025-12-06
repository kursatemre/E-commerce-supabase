"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { generateOrderDocument, queueOrderNotification, updateOrderStatus } from "@/actions/orders";
import type { updateReturnStatus } from "@/actions/returns";

const tabs = [
  { id: "all", label: "Tüm Siparişler" },
  { id: "ready", label: "Hazırlanmaya Hazır" },
  { id: "returns", label: "İadeler (RMA)" },
  { id: "invoices", label: "Fatura & Bildirim" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Beklemede" },
  { value: "processing", label: "Hazırlanıyor" },
  { value: "shipped", label: "Kargoda" },
  { value: "delivered", label: "Teslim" },
  { value: "return_requested", label: "İade Talebi" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "awaiting_payment", label: "Ödeme Bekleniyor" },
  { value: "paid", label: "Ödeme Alındı" },
  { value: "refunded", label: "İade Edildi" },
];

const FULFILLMENT_STATUS_OPTIONS = [
  { value: "preparing", label: "Hazırlanıyor" },
  { value: "packed", label: "Paketlendi" },
  { value: "shipped", label: "Kargoya Verildi" },
  { value: "delivered", label: "Teslim Edildi" },
];

const DOCUMENT_TYPES = [
  { value: "e_invoice", label: "e-Fatura" },
  { value: "e_archive", label: "e-Arşiv" },
  { value: "dispatch", label: "İrsaliye" },
];

const NOTIFICATION_TYPES = [
  { value: "order_confirmation", label: "Sipariş Onayı" },
  { value: "shipment_update", label: "Kargo Güncellemesi" },
  { value: "return_flow", label: "İade Süreci" },
];

const CHANNEL_FILTER_OPTIONS = [
  { value: "web", label: "Web Mağaza" },
  { value: "trendyol", label: "Trendyol" },
];

const RETURN_STATUS_OPTIONS = [
  { value: "pending", label: "Talep Alındı" },
  { value: "approved", label: "Onaylandı" },
  { value: "in_transit", label: "İade Kargoda" },
  { value: "inspection", label: "Kalite Kontrol" },
  { value: "refunded", label: "Ücret İade" },
  { value: "rejected", label: "Reddedildi" },
];

const RETURN_STATUS_LABELS: Record<string, string> = {
  pending: "Talep Alındı",
  approved: "Onaylandı",
  in_transit: "İade Kargoda",
  inspection: "Kontrol Aşamasında",
  refunded: "İade Tamamlandı",
  rejected: "Reddedildi",
};

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatOrderCurrency(value: number | null | undefined, currency = "TRY") {
  try {
    const formatter = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
    });
    return formatter.format(typeof value === "number" ? value : 0);
  } catch (error) {
    console.warn("[OrdersClient] Para formatlanamadı", error);
    return currencyFormatter.format(typeof value === "number" ? value : 0);
  }
}

type ReturnRequestMetadata = {
  email?: string;
  order_number?: string;
  customer_note?: string;
};

export type OrderRecord = {
  id: string;
  order_number: string | null;
  status: string | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  total: number | null;
  currency?: string | null;
  created_at: string | null;
  cargo_tracking_code?: string | null;
  delivered_at?: string | null;
  invoice_number?: string | null;
  invoice_issued_at?: string | null;
  payment_method?: string | null;
  channel?: string | null;
  source?: string | null;
  origin?: string | null;
  marketplace_order_id?: string | null;
  metadata?: Record<string, unknown> | null;
} & Record<string, unknown>;

export type OrderDocumentRecord = {
  id: string;
  order_id: string;
  document_type: string;
  document_number: string;
  status: string;
  file_url?: string | null;
  created_at: string | null;
};

export type OrderNotificationRecord = {
  id: string;
  order_id: string | null;
  notification_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string | null;
  sent_at: string | null;
};

export type ReturnRequestRecord = {
  id: string;
  order_id: string;
  user_id: string;
  status: string;
  reason: string | null;
  notes: string | null;
  refund_amount: number | null;
  requested_at: string | null;
  processed_at: string | null;
  metadata: ReturnRequestMetadata | null;
};

export type OrdersClientProps = {
  orders: OrderRecord[];
  documents: OrderDocumentRecord[];
  notifications: OrderNotificationRecord[];
  returnRequests: ReturnRequestRecord[];
  actions: {
    updateOrderStatus: typeof updateOrderStatus;
    generateOrderDocument: typeof generateOrderDocument;
    queueOrderNotification: typeof queueOrderNotification;
    updateReturnStatus: typeof updateReturnStatus;
  };
};

type NormalizedOrder = {
  id: string;
  code: string;
  channelKey: string;
  channelLabel: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalValue: number;
  totalFormatted: string;
  createdAtLabel: string;
};

type MetricBadge = {
  label: string;
  value: number;
};

type RmaPipelineStage = {
  label: string;
  items: number;
  description: string;
};

type InvoiceSummaryItem = {
  label: string;
  value: number;
};

type FilterState = {
  channel: string;
  status: string;
  payment: string;
  fulfillment: string;
};

export default function OrdersClient({ orders, documents, notifications, returnRequests, actions }: OrdersClientProps) {
  const normalizedOrders = useMemo<NormalizedOrder[]>(
    () =>
      (orders ?? []).map((order) => {
        const channelKey = String(order.channel ?? order.source ?? "web").toLowerCase();
        const channelLabel = channelKey === "trendyol" ? "Trendyol" : "Web";
        const currency = order.currency ?? "TRY";
        const numericTotal = typeof order.total === "number" ? order.total : 0;

        return {
          id: order.id,
          code: order.order_number || order.id.slice(0, 8).toUpperCase(),
          channelKey,
          channelLabel,
          paymentMethod: order.payment_method ?? (channelKey === "trendyol" ? "Trendyol" : "Kart"),
          status: order.status ?? "pending",
          paymentStatus: order.payment_status ?? "awaiting_payment",
          fulfillmentStatus: order.fulfillment_status ?? "preparing",
          totalValue: numericTotal,
          totalFormatted: formatOrderCurrency(order.total, currency),
          createdAtLabel: order.created_at ? dateFormatter.format(new Date(order.created_at)) : "-",
        } satisfies NormalizedOrder;
      }),
    [orders]
  );

  const readyOrders = useMemo(
    () =>
      normalizedOrders.filter(
        (order) => order.paymentStatus === "paid" && ["preparing", "packed"].includes(order.fulfillmentStatus)
      ),
    [normalizedOrders]
  );

  const readyBadges = useMemo<MetricBadge[]>(
    () => [
      { label: "Ödeme Onaylı", value: normalizedOrders.filter((order) => order.paymentStatus === "paid").length },
      { label: "Stok Hazır", value: readyOrders.length },
      { label: "Bekleyen Kargo", value: normalizedOrders.filter((order) => order.fulfillmentStatus === "packed").length },
    ],
    [normalizedOrders, readyOrders]
  );

  const rmaPipeline = useMemo<RmaPipelineStage[]>(() => {
    const countByStatus = (status: string) => returnRequests.filter((request) => request.status === status).length;
    return [
      { label: "Beklemede", items: countByStatus("pending"), description: "Müşteri talebi alındı." },
      { label: "Kargo Geldi", items: countByStatus("in_transit"), description: "Depoya giriş yapıldı." },
      { label: "Kalite Kontrol", items: countByStatus("inspection"), description: "Ürün inceleniyor." },
      { label: "Para İadesi", items: countByStatus("refunded"), description: "Tamamlanan iadeler." },
    ];
  }, [returnRequests]);

  const invoiceSummary = useMemo<InvoiceSummaryItem[]>(() => {
    const drafts = documents.filter((doc) => doc.status === "draft").length;
    const sent = documents.filter((doc) => ["sent", "created"].includes(doc.status)).length;
    const pending = documents.filter((doc) => ["pending_sync", "queued"].includes(doc.status)).length;
    return [
      { label: "e-Fatura Taslağı", value: drafts },
      { label: "e-Arşiv Gönderildi", value: sent },
      { label: "Muhasebe Bekliyor", value: pending },
    ];
  }, [documents]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const tabTitle = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label, [activeTab]);

  const [filters, setFilters] = useState<FilterState>({
    channel: "",
    status: "",
    payment: "",
    fulfillment: "",
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-100">Sipariş Yönetimi</p>
          <h1 className="text-3xl font-semibold tracking-tight">Siparişler</h1>
          <p className="text-sm text-gray-100">
            Tüm kanallardan gelen siparişleri yönetin, lojistik ve faturaları tek ekran üzerinden takip edin.
          </p>
        </div>
        <div className="hidden sm:flex gap-2 text-xs">
          <Badge>Pazar Yerleri</Badge>
          <Badge>Lojistik</Badge>
          <Badge>Muhasebe</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              activeTab === tab.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-gray-200 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-200">Aktif görünüm</p>
            <h2 className="text-xl font-semibold">{tabTitle}</h2>
          </div>
          <div className="text-sm text-gray-200">Operasyon modu • Canlı veri</div>
        </div>

        {activeTab === "all" && (
          <AllOrdersPanel
            orders={normalizedOrders}
            onUpdate={actions.updateOrderStatus}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
        {activeTab === "ready" && <ReadyToShipPanel orders={readyOrders} badges={readyBadges} />}
        {activeTab === "returns" && (
          <ReturnsPanel
            pipeline={rmaPipeline}
            orders={normalizedOrders}
            requests={returnRequests}
            onUpdate={actions.updateReturnStatus}
          />
        )}
        {activeTab === "invoices" && (
          <InvoicePanel
            summary={invoiceSummary}
            documents={documents}
            notifications={notifications}
            orders={normalizedOrders}
            actions={{
              generateOrderDocument: actions.generateOrderDocument,
              queueOrderNotification: actions.queueOrderNotification,
            }}
          />
        )}
      </section>
    </div>
  );
}

type AllOrdersPanelProps = {
  orders: NormalizedOrder[];
  onUpdate: typeof updateOrderStatus;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
};

function AllOrdersPanel({ orders, onUpdate, filters, onFilterChange }: AllOrdersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<NormalizedOrder | null>(null);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (filters.channel && order.channelKey !== filters.channel) return false;
      if (filters.status && order.status !== filters.status) return false;
      if (filters.payment && order.paymentStatus !== filters.payment) return false;
      if (filters.fulfillment && order.fulfillmentStatus !== filters.fulfillment) return false;
      if (normalizedQuery) {
        const haystack = `${order.code} ${order.channelLabel} ${order.paymentMethod}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [orders, filters, searchQuery]);

  useEffect(() => {
    setSelectedOrders((prev) => prev.filter((id) => filteredOrders.some((order) => order.id === id)));
  }, [filteredOrders]);

  const isAllSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length;
  const quickStatusFilters = [{ value: "", label: "Tümü" }, ...ORDER_STATUS_OPTIONS];

  const summaryCards = useMemo(() => {
    const pendingCount = orders.filter((order) => order.status === "pending").length;
    const processingCount = orders.filter((order) => order.status === "processing").length;
    const shippedCount = orders.filter((order) => order.fulfillmentStatus === "shipped").length;
    const totalAmount = currencyFormatter.format(orders.reduce((acc, order) => acc + order.totalValue, 0));

    return [
      { label: "Toplam Sipariş", value: String(orders.length), helper: `${pendingCount} beklemede` },
      { label: "Hazırlanıyor", value: String(processingCount), helper: "Operasyon kuyruğu" },
      { label: "Kargoda", value: String(shippedCount), helper: "Teslimata çıktı" },
      { label: "Brüt Tutar", value: totalAmount, helper: "Son 30 gün" },
    ];
  }, [orders]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]));
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrders([]);
      return;
    }
    setSelectedOrders(filteredOrders.map((order) => order.id));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Operasyon Panosu</p>
            <h3 className="text-2xl font-semibold text-white">Sipariş akışını gerçek zamanlı izleyin</h3>
            <p className="text-sm text-gray-300">Kanallara göre filtreleyin, seçim yapın ve tek ekrandan aksiyon alın.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-100">
            <Badge>Pazar Yeri</Badge>
            <Badge>Lojistik</Badge>
            <Badge>Muhasebe</Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.label} label={card.label} value={card.value} helper={card.helper} />
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-gray-800 bg-gray-900/70 px-10 py-2.5 text-sm text-white placeholder:text-gray-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              placeholder="Sipariş kodu, kanal veya ödeme yöntemi ara"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:border-blue-500 hover:text-white"
            >
              CSV Dışa Aktar
            </button>
            <button
              type="button"
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Yeni Sipariş
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickStatusFilters.map((option) => (
            <FilterChip
              key={option.value || "all"}
              label={option.label}
              active={filters.status === option.value}
              onClick={() => onFilterChange("status", option.value)}
            />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FilterSelect
            label="Kaynak"
            value={filters.channel}
            placeholder="Tüm kaynaklar"
            options={CHANNEL_FILTER_OPTIONS}
            onChange={(value) => onFilterChange("channel", value)}
          />
          <FilterSelect
            label="Ödeme Durumu"
            value={filters.payment}
            placeholder="Ödeme seç"
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(value) => onFilterChange("payment", value)}
          />
          <FilterSelect
            label="Kargo Durumu"
            value={filters.fulfillment}
            placeholder="Kargo seç"
            options={FULFILLMENT_STATUS_OPTIONS}
            onChange={(value) => onFilterChange("fulfillment", value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-100">
          <Badge>Toplu Seçim</Badge>
          <Badge variant="outline">Durum Güncelle</Badge>
          <Badge variant="outline">Fatura Oluştur</Badge>
          <Badge variant="outline">Etiket Yazdır</Badge>
        </div>
      </div>

      {selectedOrders.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-100 shadow-lg shadow-blue-500/20 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">{selectedOrders.length} sipariş seçildi</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full bg-gray-900/70 px-4 py-1 text-xs font-semibold text-white">
              Durum Güncelle
            </button>
            <button type="button" className="rounded-full bg-gray-900/70 px-4 py-1 text-xs font-semibold text-white">
              Kargo Etiketi
            </button>
            <button
              type="button"
              onClick={() => setSelectedOrders([])}
              className="rounded-full border border-white/40 px-4 py-1 text-xs font-semibold text-white"
            >
              Temizle
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 shadow-xl shadow-black/30">
        <table className="w-full text-sm text-gray-200">
          <thead className="bg-gray-900 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-700 bg-transparent text-blue-500 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left">Sipariş</th>
              <th className="px-4 py-3 text-left">Kanallar</th>
              <th className="px-4 py-3 text-left">Durumlar</th>
              <th className="px-4 py-3 text-left">Toplam</th>
              <th className="px-4 py-3 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">
                  Filtre kriterlerinize uyan sipariş bulunamadı.
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => {
              const isSelected = selectedOrders.includes(order.id);
              return (
                <tr
                  key={order.id}
                  className={`border-t border-gray-800 transition ${
                    isSelected ? "bg-blue-500/10 border-blue-500/40" : "hover:bg-gray-800/70"
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="h-4 w-4 rounded border-gray-700 bg-transparent text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{order.code}</p>
                    <p className="text-xs text-gray-400">{order.createdAtLabel}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-gray-700 px-3 py-0.5 text-[11px] uppercase tracking-wide text-gray-200">
                        {order.channelLabel}
                      </span>
                      <span className="text-xs text-gray-400">Ödeme: {order.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <StatusPill>{order.status}</StatusPill>
                      <StatusPill variant="info">{order.fulfillmentStatus}</StatusPill>
                      <StatusPill variant="success">{order.paymentStatus}</StatusPill>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-white">{order.totalFormatted}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDetailOrder(order)}
                      className="rounded-full border border-gray-600 px-4 py-1 text-xs font-semibold text-gray-100 hover:border-blue-500"
                    >
                      Görüntüle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <StatusUpdateForm orders={orders} action={onUpdate} />

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
    </div>
  );
}

type ReadyToShipPanelProps = {
  orders: NormalizedOrder[];
  badges: MetricBadge[];
};

function ReadyToShipPanel({ orders, badges }: ReadyToShipPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div key={badge.label} className="rounded-lg border border-white/10 px-4 py-3">
                <p className="text-2xl font-semibold">{badge.value}</p>
                <p className="text-xs text-gray-200">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Etiket Kuyruğu</h3>
              <p className="text-sm text-gray-100">Ödeme onaylı ve stok hazır siparişler.</p>
            </div>
            <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Toplu Etiket
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
                <div>
                  <p className="font-medium">{order.code}</p>
                  <p className="text-xs text-gray-200">Stok: Tamam • Kargo: Beklemede</p>
                </div>
                <button className="text-sm font-medium text-primary">Etiket Oluştur</button>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-gray-200">Hazırlanmaya hazır sipariş yok.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Operasyon Notları</h3>
          <p className="text-sm text-gray-100">Stok ve lojistik uyarıları burada listelenecek.</p>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="rounded-lg border border-white/10 px-3 py-2">
            <p className="font-medium">Trendyol - Kampanya teslim süresi 24 saat.</p>
          </li>
          <li className="rounded-lg border border-white/10 px-3 py-2">
            <p className="font-medium">Depo A - Kargo çıkış saati 17:00.</p>
          </li>
          <li className="rounded-lg border border-white/10 px-3 py-2">
            <p className="font-medium">Desi üstü paketler için manuel onay gerekiyor.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

type ReturnsPanelProps = {
  pipeline: RmaPipelineStage[];
  orders: NormalizedOrder[];
  requests: ReturnRequestRecord[];
  onUpdate: typeof updateReturnStatus;
};

function ReturnsPanel({ pipeline, orders, requests, onUpdate }: ReturnsPanelProps) {
  const orderLookup = new Map(orders.map((order) => [order.id, order.code]));
  const getOrderCode = (orderId: string) => orderLookup.get(orderId) ?? orderId.slice(0, 8).toUpperCase();

  const pendingRequests = requests.filter((request) => ["pending", "approved"].includes(request.status)).slice(0, 4);
  const refundQueue = requests.filter((request) => ["inspection", "refunded"].includes(request.status)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-lg font-semibold">İade Akış Şeması</h3>
        <p className="text-sm text-gray-100">Talep → Kargo → Kontrol → İade ödeme.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((stage) => (
            <div key={stage.label} className="rounded-lg border border-white/10 px-4 py-3">
              <p className="text-2xl font-semibold">{stage.items}</p>
              <p className="text-sm font-medium">{stage.label}</p>
              <p className="text-xs text-gray-200">{stage.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-lg font-semibold">Bekleyen Talepler</h3>
          <p className="text-sm text-gray-100">Müşteri tarafından açılan yeni iadeler.</p>
          {pendingRequests.length === 0 && <p className="text-sm text-gray-200">Aktif talep bulunmuyor.</p>}
          {pendingRequests.map((request) => {
            const customerNote = request.metadata?.customer_note?.trim();
            return (
            <div key={request.id} className="rounded-lg border border-white/10 px-3 py-3">
              <p className="font-medium">{getOrderCode(request.order_id)}</p>
              <p className="text-xs text-gray-200">{request.reason || "Neden belirtilmedi"}</p>
              {customerNote && <p className="mt-1 text-xs text-gray-300 italic">“{customerNote}”</p>}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-200">
                <span>{request.requested_at ? dateFormatter.format(new Date(request.requested_at)) : "—"}</span>
                <ReturnStatusBadge status={request.status} />
              </div>
            </div>
            );
          })}
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-lg font-semibold">Para İadesi Kuyruğu</h3>
          <p className="text-sm text-gray-100">Finans onayı bekleyen iadeler.</p>
          <div className="space-y-3">
            {refundQueue.length === 0 && <p className="text-sm text-gray-200">Finans kuyruğunda talep yok.</p>}
            {refundQueue.map((request) => {
              const customerNote = request.metadata?.customer_note?.trim();
              return (
              <div key={request.id} className="rounded-lg border border-white/10 px-3 py-3">
                <p className="font-medium">{getOrderCode(request.order_id)}</p>
                <p className="text-xs text-gray-200">Talep: {request.reason || "Belirtilmedi"}</p>
                {customerNote && <p className="text-xs text-gray-300">Müşteri: {customerNote}</p>}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Tutar: {request.refund_amount ? currencyFormatter.format(request.refund_amount) : "Belirlenmedi"}</Badge>
                  <Badge variant="outline">{request.processed_at ? "Ödeme çıkarıldı" : "Onay bekleniyor"}</Badge>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <ReturnModerationTable requests={requests} onUpdate={onUpdate} getOrderCode={getOrderCode} />
    </div>
  );
}

type ReturnModerationTableProps = {
  requests: ReturnRequestRecord[];
  onUpdate: typeof updateReturnStatus;
  getOrderCode: (orderId: string) => string;
};

function ReturnModerationTable({ requests, onUpdate, getOrderCode }: ReturnModerationTableProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">İade Talep Listesi</h3>
          <p className="text-sm text-gray-100">Durum güncellemesi ve notları buradan yönetin.</p>
        </div>
        <span className="text-xs text-gray-200">{requests.length} kayıt</span>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-gray-200">
          Henüz iade talebi açılmamış.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-gray-100">
            <thead className="text-left text-xs uppercase text-gray-300">
              <tr>
                <th className="px-3 py-2">Sipariş</th>
                <th className="px-3 py-2">Durum</th>
                <th className="px-3 py-2">Talep</th>
                <th className="px-3 py-2 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 10).map((request) => (
                <tr key={request.id} className="border-t border-white/5">
                  <td className="px-3 py-3">
                    <p className="font-semibold">{getOrderCode(request.order_id)}</p>
                    <p className="text-xs text-gray-300">{request.reason || "Neden belirtilmedi"}</p>
                    <p className="text-[11px] text-gray-400">
                      {request.requested_at ? dateFormatter.format(new Date(request.requested_at)) : "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <ReturnStatusBadge status={request.status} />
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    <p className="text-xs text-gray-300">
                      Müşteri: {request.metadata?.customer_note?.trim() || "Not iletilmedi"}
                    </p>
                    <p className="text-xs text-gray-200">
                      Operasyon: {request.notes || "Henüz eklenmedi"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <form action={onUpdate} className="flex flex-col gap-2 text-xs">
                      <input type="hidden" name="return_request_id" value={request.id} />
                      <select
                        name="status"
                        defaultValue={request.status}
                        className="rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                      >
                        {RETURN_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        name="refund_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={request.refund_amount ?? ""}
                        placeholder="İade Tutarı"
                        className="rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                      />
                      <input
                        name="notes"
                        defaultValue={request.notes ?? ""}
                        placeholder="Operasyon notu"
                        className="rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                      >
                        Güncelle
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type InvoicePanelProps = {
  summary: InvoiceSummaryItem[];
  documents: OrderDocumentRecord[];
  notifications: OrderNotificationRecord[];
  orders: NormalizedOrder[];
  actions: {
    generateOrderDocument: typeof generateOrderDocument;
    queueOrderNotification: typeof queueOrderNotification;
  };
};

function InvoicePanel({ summary, documents, notifications, orders, actions }: InvoicePanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border bg-card px-4 py-3">
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-gray-200">Son eşitleme 5 dk önce.</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DocumentManager documents={documents} orders={orders} action={actions.generateOrderDocument} />
        <NotificationManager notifications={notifications} orders={orders} action={actions.queueOrderNotification} />
      </div>
    </div>
  );
}

type StatusUpdateFormProps = {
  orders: NormalizedOrder[];
  action: typeof updateOrderStatus;
};

function StatusUpdateForm({ orders, action }: StatusUpdateFormProps) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-gray-200">
        Durum güncellemesi yapabilmek için en az bir sipariş gerekir.
      </div>
    );
  }

  return (
    <form action={action} className="rounded-xl border bg-card p-4 space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-gray-100">Sipariş</label>
          <select name="order_id" required className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
            <option value="">Sipariş seçin</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.code}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-100">Sipariş Durumu</label>
          <select name="status" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-gray-100">Ödeme Durumu</label>
          <select name="payment_status" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-100">Hazırlık Durumu</label>
          <select name="fulfillment_status" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
            {FULFILLMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="cargo_tracking_code"
          placeholder="Kargo Takip"
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <input
          name="invoice_number"
          placeholder="Fatura No"
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <input
          type="date"
          name="invoice_issued_at"
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Güncelle
      </button>
    </form>
  );
}

type DocumentManagerProps = {
  documents: OrderDocumentRecord[];
  orders: NormalizedOrder[];
  action: typeof generateOrderDocument;
};

function DocumentManager({ documents, orders, action }: DocumentManagerProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Belge Oluşturma</h3>
          <p className="text-sm text-gray-100">Toplu veya tekil e-Fatura/e-Arşiv.</p>
        </div>
      </div>

      <form action={action} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-100">Sipariş</label>
          <select name="order_id" required className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
            <option value="">Sipariş seçin</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.code}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-100">Belge Tipi</label>
            <select name="document_type" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-100">Belge No</label>
            <input
              name="document_number"
              required
              placeholder="INV-2025-001"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <input
          name="file_url"
          type="url"
          placeholder="Belge URL (opsiyonel)"
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <textarea
          name="notes"
          rows={2}
          placeholder="Not"
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Belge Oluştur
        </button>
      </form>

      <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
        {documents.length === 0 && <p className="text-gray-200">Henüz belge oluşturulmamış.</p>}
        {documents.slice(0, 5).map((doc) => (
          <div key={doc.id} className="rounded-lg border border-white/10 px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{DOCUMENT_TYPES.find((type) => type.value === doc.document_type)?.label || doc.document_type}</p>
              <span className="text-xs text-gray-200">
                {doc.created_at ? dateFormatter.format(new Date(doc.created_at)) : ""}
              </span>
            </div>
            <p className="text-xs text-gray-200">Belge No: {doc.document_number}</p>
            {doc.file_url && (
              <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary">
                Dosyayı Aç
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type NotificationManagerProps = {
  notifications: OrderNotificationRecord[];
  orders: NormalizedOrder[];
  action: typeof queueOrderNotification;
};

function NotificationManager({ notifications, orders, action }: NotificationManagerProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">E-posta Bildirimleri</h3>
          <p className="text-sm text-gray-100">Siparişe bağlı otomatik bilgilendirmeler.</p>
        </div>
      </div>

      <form action={action} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-100">Bildirim Tipi</label>
            <select name="notification_type" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-100">Sipariş (opsiyonel)</label>
            <select name="order_id" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
              <option value="">Sipariş seçin</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.code}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-100">Alıcı E-posta</label>
          <input
            type="email"
            name="recipient_email"
            required
            placeholder="musteri@email.com"
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
          />
        </div>
        <input
          name="subject"
          required
          placeholder="Konu"
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <textarea
          name="body"
          rows={3}
          required
          placeholder="Mesaj içeriği"
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
        />
        <button type="submit" className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
          Bildirim Gönder
        </button>
      </form>

      <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
        {notifications.length === 0 && <p className="text-gray-200">Henüz bildirim kuyruğu oluşmadı.</p>}
        {notifications.slice(0, 5).map((notification) => (
          <div key={notification.id} className="rounded-lg border border-white/10 px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {NOTIFICATION_TYPES.find((type) => type.value === notification.notification_type)?.label ||
                  notification.notification_type}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  notification.status === "sent" ? "bg-emerald-500/20 text-emerald-100" : "bg-amber-500/20 text-amber-100"
                }`}
              >
                {notification.status === "sent" ? "Gönderildi" : "Kuyrukta"}
              </span>
            </div>
            <p className="text-xs text-gray-200">{notification.subject}</p>
            <p className="text-xs text-gray-100">{notification.recipient_email}</p>
            <p className="text-[11px] text-gray-100">
              {notification.created_at ? dateFormatter.format(new Date(notification.created_at)) : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

type ReturnStatusBadgeProps = {
  status: string;
};

function ReturnStatusBadge({ status }: ReturnStatusBadgeProps) {
  const label = RETURN_STATUS_LABELS[status] ?? status;
  const colorMap: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-100",
    approved: "bg-blue-500/20 text-blue-100",
    in_transit: "bg-purple-500/20 text-purple-100",
    inspection: "bg-orange-500/20 text-orange-100",
    refunded: "bg-emerald-500/20 text-emerald-100",
    rejected: "bg-rose-500/20 text-rose-100",
  };

  const style = colorMap[status] ?? "bg-white/10 text-white";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{label}</span>;
}

type BadgeProps = {
  children: ReactNode;
  variant?: "solid" | "outline";
};

function Badge({ children, variant = "solid" }: BadgeProps) {
  if (variant === "outline") {
    return <span className="rounded-full border border-white/30 px-3 py-1 text-xs text-gray-100">{children}</span>;
  }

  return <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">{children}</span>;
}

type FilterSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, placeholder, options, onChange }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-300">{label}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-gray-800 bg-gray-900/70 px-3 py-2 text-sm text-gray-100 focus:border-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type StatusPillProps = {
  children: ReactNode;
  variant?: "default" | "info" | "success";
};

function StatusPill({ children, variant = "default" }: StatusPillProps) {
  if (variant === "info") {
    return <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-100">{children}</span>;
  }

  if (variant === "success") {
    return <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100">{children}</span>;
  }

  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">{children}</span>;
}

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
};

function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      <p className="text-xs text-gray-500">{helper}</p>
    </div>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-600/40"
          : "border-gray-800 bg-gray-900/60 text-gray-100 hover:border-blue-500"
      }`}
    >
      {label}
    </button>
  );
}

type OrderDetailModalProps = {
  order: NormalizedOrder;
  onClose: () => void;
};

function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-gray-400">Sipariş Kodu</p>
            <h3 className="text-2xl font-semibold text-white">{order.code}</h3>
            <p className="text-xs text-gray-500">{order.createdAtLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-gray-100"
          >
            Kapat
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm text-gray-200">
          <div className="flex items-center justify-between">
            <span>Kaynak</span>
            <span className="font-semibold text-white">{order.channelLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Ödeme</span>
            <span className="font-semibold text-white">{order.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tutar</span>
            <span className="font-semibold text-white">{order.totalFormatted}</span>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-xs text-gray-300">
          <p className="font-semibold uppercase tracking-wide text-gray-400">Durumlar</p>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{order.status}</StatusPill>
            <StatusPill variant="info">{order.fulfillmentStatus}</StatusPill>
            <StatusPill variant="success">{order.paymentStatus}</StatusPill>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="rounded-full border border-white/10 px-3 py-1">CSV Paylaş</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Not Ekle</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Lojistik Gönder</span>
        </div>
      </div>
    </div>
  );
}
