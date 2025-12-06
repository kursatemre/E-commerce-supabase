import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductFilter } from '@/components/ProductFilter'
import { Pagination } from '@/components/Pagination'
import { Suspense } from 'react'

const ITEMS_PER_PAGE = 12
const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

type ProductVariantRow = {
  product_id: string | null
  price: number | null
  is_active: boolean | null
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const categorySlug = params.category || ''

  // Base query
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(name, slug),
      brands(name),
      product_images(url, alt, sort_order)
    `, { count: 'exact' })
    .eq('is_active', true)

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply category filter
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  // Get total count
  const { count } = await query

  // Apply pagination
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: products } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  const productIds = (products ?? []).map((product) => product.id).filter(Boolean)

  let variantPriceStats: Record<string, { minPrice: number; maxPrice: number }> = {}

  if (productIds.length > 0) {
    const { data: productVariants } = await supabase
      .from('product_variants')
      .select(`
        product_id,
        price,
        is_active
      `)
      .in('product_id', productIds)

    const variantsByProduct = (productVariants ?? []).reduce<Record<string, ProductVariantRow[]>>((acc, variant) => {
      if (!variant.product_id) {
        return acc
      }
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = []
      }
      acc[variant.product_id].push(variant)
      return acc
    }, {})

    variantPriceStats = (products ?? []).reduce<Record<string, { minPrice: number; maxPrice: number }>>(
      (acc, product) => {
        const variants = variantsByProduct[product.id] || []
        const usableVariants = variants.filter((variant) => variant.is_active !== false)

        if (!usableVariants.length) {
          return acc
        }

        const prices = usableVariants
          .map((variant) => (typeof variant.price === 'number' ? variant.price : product.price))
          .filter((price): price is number => typeof price === 'number')

        if (!prices.length) {
          return acc
        }

        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        acc[product.id] = { minPrice, maxPrice }
        return acc
      },
      {},
    )
  }

  // Get categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Ürünlerimiz</h1>

        {/* Search */}
        <Suspense>
          <ProductFilter />
        </Suspense>

        {/* Categories Filter */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/shop"
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                !categorySlug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              Tümü
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  categorySlug === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Results info */}
        {(search || categorySlug) && (
          <div className="mt-4 text-sm text-gray-600">
            {count} ürün bulundu
            {search && ` - "${search}" için`}
            {categorySlug && ` - ${categories?.find(c => c.slug === categorySlug)?.name} kategorisinde`}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const firstImage = product.product_images?.[0]
              const priceStats = variantPriceStats[product.id]
              const showRange = priceStats && priceStats.minPrice !== priceStats.maxPrice
              return (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <Link
                  href={`/shop/product/${product.slug}`}
                  className="aspect-square bg-gray-200 rounded-t-lg relative overflow-hidden block"
                >
                  {firstImage ? (
                    <Image
                      src={firstImage.url}
                      alt={firstImage.alt || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📦</span>
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {product.categories?.name || 'Genel'} • {product.brands?.name || 'Marka yok'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Link href={`/shop/product/${product.slug}`} className="hover:text-blue-600 transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {priceStats
                          ? showRange
                            ? `${currencyFormatter.format(priceStats.minPrice)} − ${currencyFormatter.format(priceStats.maxPrice)}`
                            : currencyFormatter.format(priceStats.minPrice)
                          : currencyFormatter.format(product.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stok: {product.stock}
                      </div>
                    </div>
                    <AddToCartButton productId={product.id} stock={product.stock} />
                  </div>
                </div>
              </div>
            )}
            )}
          </div>

          {/* Pagination */}
          <Suspense>
            <Pagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Ürün Bulunamadı
          </h2>
          <p className="text-gray-600 mb-4">
            {search
              ? `"${search}" için sonuç bulunamadı`
              : 'Bu kategoride ürün bulunmuyor'}
          </p>
          <Link
            href="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Tüm Ürünleri Gör
          </Link>
        </div>
      )}
    </div>
  )
}
