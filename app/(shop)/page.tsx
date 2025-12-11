import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProductCard } from '@/components/shop/ProductCard'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { Pagination } from '@/components/Pagination'
import { HeroSection } from '@/components/shop/HeroSection'
import { TrustStrip } from '@/components/homepage/TrustStrip'
import { DualBanner } from '@/components/homepage/DualBanner'
import { SingleBanner } from '@/components/homepage/SingleBanner'
import { ProductCarousel } from '@/components/homepage/ProductCarousel'
import { homepageConfig } from '@/config/homepage'
import { Suspense } from 'react'

const ITEMS_PER_PAGE = 12

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

  // Determine if we should show homepage or product listing
  const isHomepage = !search && !categorySlug && page === 1

  if (isHomepage) {
    // Fetch featured products for homepage
    const { data: featuredProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        product_images(url, alt, sort_order)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8)

    // Fetch product variants with their option values using the advanced variant system
    const productIds = (featuredProducts ?? []).map(p => p.id)

    const { data: productVariants } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        variant_option_product_variants(
          variant_option_id,
          variant_options(
            id,
            value,
            variant_type_id,
            variant_types(id, name, code)
          )
        )
      `)
      .in('product_id', productIds)
      .eq('is_active', true)

    // Group variant options by product and variant type
    const variantsByProduct = new Map<string, Map<string, Set<string>>>()

    productVariants?.forEach((pv: any) => {
      if (!pv.product_id) return

      if (!variantsByProduct.has(pv.product_id)) {
        variantsByProduct.set(pv.product_id, new Map())
      }

      const productVariantMap = variantsByProduct.get(pv.product_id)!

      // Process each variant option value
      pv.variant_option_product_variants?.forEach((vopv: any) => {
        const option = vopv.variant_options
        const variantType = option?.variant_types

        if (variantType && option) {
          const typeKey = variantType.id

          if (!productVariantMap.has(typeKey)) {
            productVariantMap.set(typeKey, new Set())
          }

          productVariantMap.get(typeKey)!.add(option.value)
        }
      })
    })

    // Transform to the format expected by QuickAddModal
    const transformedVariants = new Map<string, any[]>()
    variantsByProduct.forEach((variantTypeMap, productId) => {
      const variantTypes: any[] = []

      variantTypeMap.forEach((optionValues, typeId) => {
        // Get the type name from any variant option for this product and type
        const sampleVariant = productVariants?.find((pv: any) => pv.product_id === productId)

        let typeName = ''
        if (sampleVariant?.variant_option_product_variants) {
          for (const vopv of sampleVariant.variant_option_product_variants) {
            const vt = (vopv as any).variant_options?.variant_types
            if (vt && vt.id === typeId) {
              typeName = vt.name
              break
            }
          }
        }

        if (typeName && optionValues.size > 0) {
          variantTypes.push({
            id: typeId,
            name: typeName,
            options: Array.from(optionValues).sort(),
          })
        }
      })

      transformedVariants.set(productId, variantTypes)
    })

    const transformedFeatured = (featuredProducts ?? []).map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || null,
      variants: transformedVariants.get(product.id) || [],
    }))

    return (
      <div className="space-y-0">
        {/* Hero Section - Tam Ekran Görsel */}
        <HeroSection />

        {/* Featured Products - En Çok Satanlar - Hafif Krem Arka Plan */}
        <div className="bg-surface-cream">
          {transformedFeatured.length > 0 && (
            <ProductCarousel
              title="En Çok Satanlar"
              subtitle="Bu haftanın en popüler ürünleri"
              products={transformedFeatured}
              viewAllLink="/"
              badge="bestseller"
            />
          )}
        </div>

        {/* Trust Strip - Saf Beyaz Arka Plan */}
        <div className="bg-white">
          <TrustStrip badges={homepageConfig.trustBadges} />
        </div>

        {/* Dual Banner - Kadın / Erkek - Saf Beyaz */}
        <div className="bg-white">
          <DualBanner
            leftBanner={homepageConfig.dualBanner.left}
            rightBanner={homepageConfig.dualBanner.right}
          />
        </div>

        {/* More Products - Yeni Gelenler - Açık Gri Arka Plan */}
        <div className="bg-surface-light">
          {transformedFeatured.length > 0 && (
            <ProductCarousel
              title="Yeni Gelenler"
              subtitle="Yeni sezon koleksiyonundan seçtiklerimiz"
              products={transformedFeatured}
              viewAllLink="/"
              badge="new"
            />
          )}
        </div>

        {/* Single Banner - Sustainability - Saf Beyaz */}
        <div className="bg-white">
          <SingleBanner {...homepageConfig.singleBanner} />
        </div>
      </div>
    )
  }

  // Product Listing Mode (when search/filter is active)
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

  // Transform products for ProductCard
  const transformedProducts = (products ?? []).map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.categories,
    brand: product.brands,
    images: product.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || null,
  }))

  return (
    <div className="section-container py-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="font-heading text-h1 md:text-h1 text-brand-dark mb-2">
            Ürünlerimiz
          </h1>
          <p className="text-brand-dark/60 text-sm md:text-base">
            {count || 0} ürün bulundu
            {search && ` - "${search}" için`}
            {categorySlug && ` - ${categories?.find(c => c.slug === categorySlug)?.name} kategorisinde`}
          </p>
        </div>

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <Suspense fallback={<div className="h-10 bg-surface-light animate-pulse rounded-full" />}>
          <CategoryFilter categories={categories} />
        </Suspense>
      )}

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
            <Suspense fallback={<div className="h-12 bg-surface-light animate-pulse rounded" />}>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          )}
        </>
      ) : (
        <div className="bg-surface-white rounded-2xl border border-gray-200 p-12 md:p-16 text-center">
          <div className="text-6xl mb-4 opacity-40">🔍</div>
          <h2 className="font-heading text-2xl font-semibold text-brand-dark mb-2">
            Ürün Bulunamadı
          </h2>
          <p className="text-brand-dark/60 mb-6">
            {search
              ? `"${search}" için sonuç bulunamadı`
              : 'Bu kategoride ürün bulunmuyor'}
          </p>
          <Link
            href="/"
            className="btn-cta inline-block"
          >
            Tüm Ürünleri Gör
          </Link>
        </div>
      )}
      </div>
    </div>
  )
}
