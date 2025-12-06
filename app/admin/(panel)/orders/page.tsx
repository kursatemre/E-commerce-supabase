import { generateOrderDocument, queueOrderNotification, updateOrderStatus } from "@/actions/orders";
import { updateReturnStatus } from "@/actions/returns";
import OrdersClient, {
  type OrderDocumentRecord,
  type OrderNotificationRecord,
  type OrderRecord,
  type ReturnRequestRecord,
} from "./OrdersClient";
import { createClient } from "@/lib/supabase/server";

type TrendyolOrderRow = {
  id: string;
  marketplace_order_id: string;
  order_number: string | null;
  marketplace_status: string | null;
  order_date: string | null;
  total_price: number | null;
  currency: string | null;
  raw_payload: Record<string, unknown> | null;
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const [
    { data: ordersData, error: ordersError },
    { data: trendyolOrdersData, error: trendyolOrdersError },
    { data: documentsData, error: documentsError },
    { data: notificationsData, error: notificationsError },
    { data: returnRequestsData, error: returnRequestsError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, status, payment_status, fulfillment_status, total, created_at, cargo_tracking_code, delivered_at, invoice_number, invoice_issued_at"
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("trendyol_orders")
      .select("id, marketplace_order_id, order_number, marketplace_status, order_date, total_price, currency, raw_payload")
      .order("order_date", { ascending: false })
      .limit(100),
    supabase
      .from("order_documents")
      .select("id, order_id, document_type, document_number, status, file_url, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("order_notifications")
      .select("id, order_id, notification_type, recipient_email, subject, status, created_at, sent_at")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("return_requests")
      .select("id, order_id, user_id, status, reason, notes, refund_amount, requested_at, processed_at, metadata")
      .order("requested_at", { ascending: false })
      .limit(100),
  ]);

  if (ordersError) {
    console.error("Orders fetch error", ordersError);
  }
  if (trendyolOrdersError) {
    console.error("Trendyol orders fetch error", trendyolOrdersError);
  }
  if (documentsError) {
    console.error("Documents fetch error", documentsError);
  }
  if (notificationsError) {
    console.error("Notifications fetch error", notificationsError);
  }
  if (returnRequestsError) {
    console.error("Return requests fetch error", returnRequestsError);
  }

  const storeOrders = ((ordersData as OrderRecord[]) ?? []).map(hydrateStoreOrder);
  const marketplaceOrders = ((trendyolOrdersData as TrendyolOrderRow[]) ?? []).map(mapTrendyolOrder);

  return (
    <OrdersClient
      orders={[...marketplaceOrders, ...storeOrders]}
      documents={(documentsData as OrderDocumentRecord[]) ?? []}
      notifications={(notificationsData as OrderNotificationRecord[]) ?? []}
      returnRequests={(returnRequestsData as ReturnRequestRecord[]) ?? []}
      actions={{
        updateOrderStatus,
        generateOrderDocument,
        queueOrderNotification,
        updateReturnStatus,
      }}
    />
  );
}

function hydrateStoreOrder(order: OrderRecord): OrderRecord {
  return {
    ...order,
    channel: order.channel ?? "web",
    source: order.source ?? "web",
    origin: order.origin ?? "store",
  };
}

function mapTrendyolOrder(order: TrendyolOrderRow): OrderRecord {
  return {
    id: `trendyol-${order.id}`,
    order_number: order.order_number ?? order.marketplace_order_id,
    status: mapTrendyolOrderStatus(order.marketplace_status),
    payment_status: order.marketplace_status === "Cancelled" ? "refunded" : "paid",
    fulfillment_status: mapTrendyolFulfillment(order.marketplace_status),
    total: order.total_price,
    currency: order.currency ?? "TRY",
    created_at: order.order_date,
    channel: "trendyol",
    source: "trendyol",
    origin: "marketplace",
    marketplace_order_id: order.marketplace_order_id,
    metadata: order.raw_payload ?? order,
  } as OrderRecord;
}

function mapTrendyolOrderStatus(status: string | null | undefined) {
  switch ((status ?? "").toLowerCase()) {
    case "invoiced":
      return "processing";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

function mapTrendyolFulfillment(status: string | null | undefined) {
  switch ((status ?? "").toLowerCase()) {
    case "created":
      return "preparing";
    case "picking":
      return "packed";
    case "invoiced":
      return "packed";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    default:
      return "preparing";
  }
}
