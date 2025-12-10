import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProductCard } from '@/components/shop/ProductCard'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

const ITEMS_PER_PAGE = 12

type ProductVariantRow = {
  product_id: string | null
  price: number | null
  is_active: boolean | null
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1')

  // Get category by slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Get products for this category
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: products, count } = await supabase
    .from('products')
    .select(`
      *,
      brands(name),
      product_images(url, alt, sort_order)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('category_id', category.id)
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

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  // Transform products for ProductCard
  const transformedProducts = (products ?? []).map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    brand: product.brands,
    images: product.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || null,
  }))

  return (
    <div className="section-container py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-2 text-sm text-brand-dark/60 mb-3">
            <Link href="/" className="hover:text-action transition-colors">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="text-brand-dark font-medium">{category.name}</span>
          </div>
          <h1 className="font-heading text-h1 font-semibold text-brand-dark mb-2">
            {category.name}
          </h1>
          <p className="text-brand-dark/60 text-sm md:text-base">
            {count || 0} ürün bulundu
          </p>
        </div>

        {/* Products Grid */}
        {transformedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {transformedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priceRange={variantPriceStats[product.id] || null}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/categories/${slug}?page=${page - 1}`}
                    className="px-4 py-2 bg-surface-light rounded-button hover:bg-gray-200 transition-colors"
                  >
                    ← Önceki
                  </Link>
                )}
                <span className="px-4 py-2 text-brand-dark">
                  Sayfa {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/categories/${slug}?page=${page + 1}`}
                    className="px-4 py-2 bg-surface-light rounded-button hover:bg-gray-200 transition-colors"
                  >
                    Sonraki →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-surface-white rounded-2xl border border-gray-200 p-12 md:p-16 text-center">
            <div className="text-6xl mb-4 opacity-40">🔍</div>
            <h2 className="font-heading text-2xl font-semibold text-brand-dark mb-2">
              Ürün Bulunamadı
            </h2>
            <p className="text-brand-dark/60 mb-6">
              Bu kategoride henüz ürün bulunmuyor
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-action text-white font-semibold rounded-button hover:bg-action-hover transition-colors"
            >
              Anasayfaya Dön
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
