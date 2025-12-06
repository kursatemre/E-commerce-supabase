import { TrendyolStockSyncButton } from '@/components/omnichannel/TrendyolStockSyncButton'
import type { TrendyolProductRow } from '@/lib/omnichannel/service'

export function TrendyolProductTable({ products }: { products: TrendyolProductRow[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-200">Trendyol Ürünleri</p>
          <h3 className="text-lg font-semibold text-white">Senkronize stok & fiyatlar</h3>
          <p className="text-sm text-gray-400">En son çekilen {products.length} ürünü görüntülüyorsunuz.</p>
        </div>
      </header>

      {products.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-gray-300">
          Trendyol ürün kaydı bulunamadı. Cron job çalıştıktan sonra burada listelenecek.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-gray-100">
            <thead className="text-left text-xs uppercase text-gray-400">
              <tr>
                <th className="px-3 py-2">Ürün</th>
                <th className="px-3 py-2">SKU / Barkod</th>
                <th className="px-3 py-2">Stok</th>
                <th className="px-3 py-2">Fiyat</th>
                <th className="px-3 py-2">Son Senkron</th>
                <th className="px-3 py-2 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-white/5">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-white">{product.title ?? product.marketplaceProductId}</p>
                    <p className="text-xs text-gray-400">
                      {product.product?.name ? `Store: ${product.product.name}` : 'Eşleşen ürün bulunamadı'}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-300">
                    <p>{product.sku ?? '—'}</p>
                    <p className="text-xs text-gray-500">{product.barcode ?? 'Barkod yok'}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold">
                      {typeof product.product?.stock === 'number' ? product.product.stock : '—'}
                      <span className="text-xs text-gray-400"> / mağaza</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {typeof product.stock === 'number' ? product.stock : '—'} <span> / Trendyol</span>
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-white">{formatPrice(product.discountedPrice ?? product.price, product.currency)}</p>
                    {product.discountedPrice && product.price && product.discountedPrice < product.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.price, product.currency)}</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-400">{formatDate(product.lastSyncedAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <TrendyolStockSyncButton productId={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function formatPrice(value: number | null | undefined, currency = 'TRY') {
  if (typeof value !== 'number') return '—'
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(value)
  } catch {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}
