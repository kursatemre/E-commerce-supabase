import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/DeleteButton'
import { createProduct, deleteProduct, toggleProductActive } from '@/actions/products'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()

  const [
    { data: products },
    { data: categories },
    { data: brands }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(name), brands(name)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').eq('is_active', true).order('name'),
    supabase.from('brands').select('*').eq('is_active', true).order('name')
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Ürünler</h1>
      </div>

      {/* Create Form */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Yeni Ürün Ekle</h2>
        <form action={createProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="iPhone 15 Pro"
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="IP15P-BLK-256"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Fiyat (TL) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="49999.99"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
                Stok *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="100"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-1">
                Kategori
              </label>
              <select
                id="category_id"
                name="category_id"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Kategori Seçin</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="brand_id" className="block text-sm font-medium text-gray-300 mb-1">
                Marka
              </label>
              <select
                id="brand_id"
                name="brand_id"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Marka Seçin</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Ürün açıklaması..."
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-300 mb-1">
              Ürün Görselleri
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/10 file:text-blue-300"
            />
            <p className="text-xs text-gray-500 mt-1">Birden fazla PNG, JPG veya WebP yükleyebilirsiniz • Maks 5MB / dosya</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Yeni Varyant Sistemi</h3>
                <p className="text-sm text-gray-400">
                  Ürünü kaydettikten sonra detay sayfasındaki üç adımlı yönetici ile tüm varyant tiplerini ve SKU kombinasyonlarını oluşturabilirsiniz.
                </p>
              </div>
              <Link
                href="/admin/products/variants"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition"
              >
                Varyant Tanımları
              </Link>
            </div>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Önce varyant tiplerinizi (ör. Renk, Beden) bu sekmeden tanımlayın.</li>
              <li>Ürün detayında tipleri seçip kombinasyon üreticisiyle SKU’ları oluşturun.</li>
              <li>Fiyat ve stok değerlerini SKU bazında kaydedin, mağaza tarafı otomatik güncellenir.</li>
            </ul>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
          >
            Ürün Ekle
          </button>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Kategori / Marka
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
            {products?.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white">{product.name}</div>
                  <div className="text-sm text-gray-400">{product.sku}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{product.categories?.name || '-'}</div>
                  <div className="text-sm text-gray-400">{product.brands?.name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="isActive" value={product.is_active.toString()} />
                    <button
                      type="submit"
                      className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full transition ${
                        product.is_active
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/50'
                          : 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {product.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-600/10 border border-transparent hover:border-blue-600/30"
                  >
                    Detay
                  </Link>
                  <DeleteButton
                    id={product.id}
                    action={deleteProduct}
                    confirmMessage="Bu ürünü silmek istediğinizden emin misiniz?"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!products || products.length === 0) && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-sm">Henüz ürün eklenmemiş.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
