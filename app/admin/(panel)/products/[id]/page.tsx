import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import { ProductImages } from '@/components/ProductImages'
import { ProductVariantManager } from '@/components/ProductVariantManager'
import { updateProduct } from '@/actions/products'

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const [
    productResponse,
    categoriesResponse,
    brandsResponse,
    imagesResponse,
    variantTypesResponse,
    variantOptionsResponse,
    productVariantTypesResponse,
    productVariantOptionsResponse,
    variantSkusResponse,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(name), brands(name)')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('id, name, is_active').order('name'),
    supabase.from('brands').select('id, name, is_active').order('name'),
    supabase
      .from('product_images')
      .select('id, url, alt, sort_order')
      .eq('product_id', id)
      .order('sort_order'),
    supabase
      .from('variant_types')
      .select('id, code, name, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('variant_options')
      .select('id, variant_type_id, value, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('value', { ascending: true }),
    supabase
      .from('product_variant_types')
      .select('variant_type_id, sort_order')
      .eq('product_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_variant_options')
      .select('variant_option_id')
      .eq('product_id', id),
    supabase
      .from('product_variants')
      .select(`
        id,
        name,
        sku,
        price,
        stock,
        is_active,
        variant_option_product_variants (
          variant_option_id,
          variant_options (
            value,
            variant_types (
              name
            )
          )
        )
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (productResponse.error || !productResponse.data) {
    notFound()
  }

  const product = productResponse.data
  const categories = categoriesResponse.data ?? []
  const brands = brandsResponse.data ?? []
  const images = imagesResponse.data ?? []
  const variantTypes = variantTypesResponse.data ?? []
  const variantOptions = variantOptionsResponse.data ?? []
  const selectedTypes = (productVariantTypesResponse.data ?? []).map((row) => ({
    variant_type_id: row.variant_type_id,
    sort_order: row.sort_order,
  }))
  const selectedOptionIds = (productVariantOptionsResponse.data ?? []).map(
    (row) => row.variant_option_id
  )

  const existingVariants = (variantSkusResponse.data ?? []).map((variant) => ({
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
    is_active: variant.is_active,
    optionRelations: (variant.variant_option_product_variants ?? []).map((relation) => {
      const variantOption = Array.isArray(relation.variant_options)
        ? relation.variant_options[0]
        : relation.variant_options
      const variantType = variantOption?.variant_types
        ? (Array.isArray(variantOption.variant_types) ? variantOption.variant_types[0] : variantOption.variant_types)
        : null
      return {
        optionId: relation.variant_option_id,
        optionValue: variantOption?.value ?? '',
        typeName: variantType?.name ?? '',
      }
    }),
  }))

  const variantCount = existingVariants.length
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const publicProductUrl = product.slug ? `${baseUrl}/shop/product/${product.slug}` : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">Ürün Yönetimi</p>
          <h1 className="text-2xl font-semibold text-white">{product.name}</h1>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-sm text-gray-200 hover:bg-gray-700/50"
        >
          Ürün Listesine Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Ürün Bilgileri</h2>
                <p className="text-sm text-gray-400">Temel alanları güncelleyin.</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  product.is_active
                    ? 'text-emerald-300 border-emerald-500/40'
                    : 'text-red-300 border-red-500/40'
                }`}
              >
                {product.is_active ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <form action={updateProduct} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">
                    Ürün Adı
                  </label>
                  <input
                    id="name"
                    name="name"
                    defaultValue={product.name}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="sku">
                    Ana SKU
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    defaultValue={product.sku ?? ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="price">
                    Fiyat (TL)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product.price}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="stock">
                    Toplam Stok
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={product.stock}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="category_id">
                    Kategori
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    defaultValue={product.category_id ?? ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {!category.is_active ? ' (Pasif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="brand_id">
                    Marka
                  </label>
                  <select
                    id="brand_id"
                    name="brand_id"
                    defaultValue={product.brand_id ?? ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Marka Seçin</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                        {!brand.is_active ? ' (Pasif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="is_active">
                    Durum
                  </label>
                  <select
                    id="is_active"
                    name="is_active"
                    defaultValue={product.is_active ? 'true' : 'false'}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="description">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={product.description || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">SEO Ayarları</h3>
                    <p className="text-sm text-gray-400">Mağaza ve arama motoru sonuçları için meta bilgileri düzenleyin.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="seo_title">
                      Meta Başlık
                    </label>
                    <input
                      id="seo_title"
                      name="seo_title"
                      maxLength={70}
                      defaultValue={product.seo_title || ''}
                      placeholder="Ürün adını güçlendiren başlık"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Önerilen 50-60 karakter.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="seo_keywords">
                      Anahtar Kelimeler
                    </label>
                    <input
                      id="seo_keywords"
                      name="seo_keywords"
                      defaultValue={product.seo_keywords || ''}
                      placeholder="telefon, gece modu, 256GB"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak girin (opsiyonel).</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="seo_description">
                      Meta Açıklama
                    </label>
                    <textarea
                      id="seo_description"
                      name="seo_description"
                      rows={3}
                      maxLength={160}
                      defaultValue={product.seo_description || ''}
                      placeholder="Arama sonuçlarında gözükecek kısa açıklama"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Önerilen 140-160 karakter.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="seo_canonical_url">
                      Kanonik URL
                    </label>
                    <input
                      id="seo_canonical_url"
                      name="seo_canonical_url"
                      type="url"
                      defaultValue={product.seo_canonical_url || ''}
                      placeholder="https://example.com/urun/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="seo_robots">
                      Robots
                    </label>
                    <input
                      id="seo_robots"
                      name="seo_robots"
                      defaultValue={product.seo_robots || 'index,follow'}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Örnek: <span className="font-mono">index,follow</span> veya <span className="font-mono">noindex,nofollow</span>.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
              >
                Ürünü Güncelle
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Ürün Görselleri</h2>
              <div className="mb-6">
                <ImageUpload productId={id} />
              </div>
              <ProductImages productId={id} images={images} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Varyantlar</h2>
                <p className="text-sm text-gray-400">Tip ve SKU kombinasyonlarını yönetin.</p>
              </div>
              <span className="text-sm text-gray-400">{variantCount} SKU</span>
            </div>
            <ProductVariantManager
              productId={id}
              variantTypes={variantTypes}
              variantOptions={variantOptions}
              selectedTypes={selectedTypes}
              selectedOptionIds={selectedOptionIds}
              existingVariants={existingVariants}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Ürün Özeti</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Kategori</span>
                <span className="text-gray-100">{product.categories?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Marka</span>
                <span className="text-gray-100">{product.brands?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Liste Fiyatı</span>
                <span className="text-gray-100">{currencyFormatter.format(product.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Stok</span>
                <span className="text-gray-100">{product.stock}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Canlı Ürün Bağlantısı</h2>
            <p className="text-sm text-gray-400 mb-4">Mağaza tarafında ürünün göründüğü URL.</p>
            {publicProductUrl ? (
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                <Link
                  href={publicProductUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all"
                >
                  {publicProductUrl}
                </Link>
              </div>
            ) : (
              <div className="text-sm text-gray-400 p-4 bg-gray-900 rounded-xl border border-gray-700">
                Bu ürün için slug tanımlı değil.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
