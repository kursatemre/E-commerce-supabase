import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductImages } from '@/components/shop/ProductImages'
import { ProductVariantSelector, ProductVariantSku, VariantTypeDefinition } from '@/components/ProductVariantSelector'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react'
import { ProductTabs } from '@/components/product/ProductTabs'
import { ProductReviews } from '@/components/product/ProductReviews'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import type { Metadata } from 'next'

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

type ProductImage = {
  id: string
  url: string
  alt: string | null
  sort_order: number | null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: product } = await supabase
    .from('products')
    .select(`
      name,
      description,
      seo_title,
      seo_description,
      seo_keywords,
      seo_canonical_url,
      seo_robots,
      product_images(url, sort_order)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Ürün bulunamadı',
      description: 'Aradığınız ürün yayında değil veya bulunamadı.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pageUrl = `${baseUrl}/shop/product/${slug}`
  const title = product.seo_title || product.name
  const description = product.seo_description || product.description || `${product.name} ürün detayları`
  const canonical = product.seo_canonical_url || pageUrl

  const keywords = product.seo_keywords
    ? product.seo_keywords.split(',').map((keyword: string) => keyword.trim()).filter(Boolean)
    : undefined

  const productImages: Array<{ url: string; sort_order?: number | null }> = product.product_images || []
  const primaryImage = [...productImages]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .find((image) => Boolean(image?.url))

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: product.seo_robots || 'index,follow',
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              alt: product.name,
            },
          ]
        : undefined,
    },
  }
}

export default async function ShopProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      categories(name, slug),
      brands(name),
      product_images(id, url, alt, sort_order)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  const galleryImages: ProductImage[] = (product as { product_images?: ProductImage[] }).product_images || []

  const [variantTypesResponse, variantOptionsResponse, variantSkusResponse] = await Promise.all([
    supabase
      .from('product_variant_types')
      .select(`
        variant_type_id,
        sort_order,
        variant_types ( id, name )
      `)
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_variant_options')
      .select(`
        variant_option_id,
        variant_options ( id, value, variant_type_id, is_active )
      `)
      .eq('product_id', product.id),
    supabase
      .from('product_variants')
      .select(`
        id,
        name,
        price,
        stock,
        is_active,
        variant_option_product_variants (
          variant_option_id,
          variant_options (
            id,
            value,
            variant_type_id
          )
        )
      `)
      .eq('product_id', product.id)
      .order('created_at', { ascending: true }),
  ])

  const productVariantTypes = variantTypesResponse.data ?? []
  const variantOptions = variantOptionsResponse.data ?? []
  const rawVariantSkus = variantSkusResponse.data ?? []

  const optionsByType = variantOptions.reduce<Record<string, { id: string; value: string }[]>>(
    (acc, optionRow) => {
      const option = Array.isArray(optionRow.variant_options)
        ? optionRow.variant_options[0]
        : optionRow.variant_options
      if (!option || option.is_active === false || !option.variant_type_id) {
        return acc
      }
      if (!acc[option.variant_type_id]) {
        acc[option.variant_type_id] = []
      }
      acc[option.variant_type_id].push({ id: option.id, value: option.value })
      return acc
    },
    {}
  )

  const variantTypeDefinitions: VariantTypeDefinition[] = productVariantTypes
    .map((row) => {
      const variantType = Array.isArray(row.variant_types)
        ? row.variant_types[0]
        : row.variant_types
      const typeId = variantType?.id ?? row.variant_type_id
      if (!typeId) return null
      const options = optionsByType[typeId] || []
      return {
        id: typeId,
        name: variantType?.name ?? 'Varyant',
        sortOrder: row.sort_order ?? 0,
        options,
      }
    })
    .filter((type): type is VariantTypeDefinition => Boolean(type && type.options.length > 0))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const variantSkus: ProductVariantSku[] = rawVariantSkus.map((variant) => ({
    id: variant.id,
    name: variant.name,
    price: variant.price,
    stock: variant.stock,
    isActive: variant.is_active,
    optionRelations: (variant.variant_option_product_variants ?? [])
      .map((relation) => {
        const variantOption = Array.isArray(relation.variant_options)
          ? relation.variant_options[0]
          : relation.variant_options
        return {
          optionId: relation.variant_option_id,
          optionValue: variantOption?.value ?? '',
          typeId: variantOption?.variant_type_id ?? '',
        }
      })
      .filter((relation) => relation.typeId),
  }))

  const usableVariantSkus = variantSkus.filter((variant) => variant.optionRelations.length > 0)

  const variantPrices = usableVariantSkus
    .map((variant) => variant.price ?? product.price)
    .filter((price): price is number => typeof price === 'number')

  const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : null
  const maxVariantPrice = variantPrices.length ? Math.max(...variantPrices) : null

  const hasVariantFlow = variantTypeDefinitions.length > 0 && usableVariantSkus.length > 0
  const showVariantPriceRange =
    hasVariantFlow &&
    minVariantPrice !== null &&
    maxVariantPrice !== null &&
    minVariantPrice !== maxVariantPrice

  const selectorBasePrice = hasVariantFlow ? (minVariantPrice ?? product.price) : product.price
  return (
    <div className="section-container py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/60 mb-6">
        <Link href="/shop" className="hover:text-brand-dark transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="w-4 h-4" />
        {product.categories && (
          <>
            <Link
              href={`/shop?category=${product.categories.slug}`}
              className="hover:text-brand-dark transition-colors"
            >
              {product.categories.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-brand-dark">{product.name}</span>
      </nav>

    <div className="pb-24 md:pb-8">
      {/* Back Button - Desktop */}
      <Link
        href="/shop"
        className="hidden md:inline-flex items-center gap-2 text-sm text-brand-dark/60 hover:text-brand-dark transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Tüm Ürünlere Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Product Images */}
        <div>
          <ProductImages images={galleryImages} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-5 md:space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-brand-dark/60">
            <Link
              href={`/shop?category=${product.categories?.slug}`}
              className="hover:text-action transition-colors"
            >
              {product.categories?.name || 'Kategori'}
            </Link>
            <span>•</span>
            <span>{product.brands?.name || 'Marka'}</span>
          </div>

          {/* Product Name */}
          <h1 className="font-heading text-h2-mobile md:text-h1 text-brand-dark leading-tight">
            {product.name}
          </h1>

          {/* Price Display - Non-Variant Products */}
          {!hasVariantFlow && (
            <div className="p-4 bg-surface-light rounded-2xl border border-gray-200">
              <p className="text-xs font-medium text-brand-dark/60 mb-1">Fiyat</p>
              <p className="text-2xl md:text-3xl font-heading font-semibold text-brand-dark">
                {currencyFormatter.format(product.price)}
              </p>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-xs text-action font-semibold mt-1">
                  Son {product.stock} ürün!
                </p>
              )}
              {product.stock === 0 && (
                <p className="text-xs text-error font-semibold mt-1">Stokta Yok</p>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-brand-dark">Ürün Açıklaması</h2>
              <p className="text-sm md:text-base text-brand-dark/80 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Variant Selector or Simple Add to Cart */}
          {hasVariantFlow ? (
            <ProductVariantSelector
              productId={product.id}
              variantTypes={variantTypeDefinitions}
              variants={usableVariantSkus}
              fallbackStock={product.stock}
              basePrice={selectorBasePrice}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-surface-light rounded-button border border-gray-200">
                <div className="flex items-center gap-2 text-xs text-brand-dark/60 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Güvenli ödeme</span>
                  <span>•</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Hızlı teslimat</span>
                </div>
                <AddToCartButton productId={product.id} stock={product.stock} />
              </div>
            </div>
          )}

          {/* Action Buttons - Desktop Only */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dark/60 hover:text-brand-dark transition-colors">
              <Heart className="w-5 h-5" />
              <span>Favorilere Ekle</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dark/60 hover:text-brand-dark transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Paylaş</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-surface-light rounded-2xl text-center">
          <div className="text-2xl mb-2">🚚</div>
          <p className="text-xs md:text-sm font-semibold text-brand-dark mb-1">Ücretsiz Kargo</p>
          <p className="text-xs text-brand-dark/60">500 TL üzeri</p>
        </div>
        <div className="p-4 bg-surface-light rounded-2xl text-center">
          <div className="text-2xl mb-2">↩️</div>
          <p className="text-xs md:text-sm font-semibold text-brand-dark mb-1">Kolay İade</p>
          <p className="text-xs text-brand-dark/60">14 gün içinde</p>
        </div>
        <div className="p-4 bg-surface-light rounded-2xl text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-xs md:text-sm font-semibold text-brand-dark mb-1">Güvenli Ödeme</p>
          <p className="text-xs text-brand-dark/60">SSL sertifikalı</p>
        </div>
        <div className="p-4 bg-surface-light rounded-2xl text-center">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-xs md:text-sm font-semibold text-brand-dark mb-1">7/24 Destek</p>
          <p className="text-xs text-brand-dark/60">Müşteri hizmetleri</p>
        </div>
      </div>
    </div>

      {/* Product Tabs */}
      <ProductTabs
        description={product.description}
        materials={product.material}
      />

      {/* Reviews */}
      <ProductReviews />

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
        categoryId={product.category_id}
      />
    </div>
  )
}
