import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductVariantSelector, ProductVariantSku, VariantTypeDefinition } from '@/components/ProductVariantSelector'
import type { Metadata } from 'next'

const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

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
  const sortedImages = [...galleryImages].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )
  const heroImage = sortedImages[0]

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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Tüm Ürünlere Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
            {heroImage ? (
              <Image
                src={heroImage.url}
                alt={heroImage.alt || product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                📦
              </div>
            )}
          </div>
          {sortedImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {sortedImages.map((image) => (
                <div key={image.id} className="aspect-square bg-gray-100 rounded-xl relative overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    sizes="(max-width: 768px) 25vw, 10vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {product.categories?.name || 'Kategori Yok'} • {product.brands?.name || 'Marka Yok'}
            </p>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">{product.name}</h1>
            {hasVariantFlow ? (
              <>
                {showVariantPriceRange ? (
                  <p className="text-3xl font-bold text-gray-900">
                    {currencyFormatter.format(minVariantPrice!)} − {currencyFormatter.format(maxVariantPrice!)}
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {currencyFormatter.format(minVariantPrice ?? product.price)}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Varyant seçiminize göre fiyat netleşir.
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {currencyFormatter.format(product.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Stok: {product.stock}</p>
              </>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Açıklama</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {hasVariantFlow ? (
            <ProductVariantSelector
              productId={product.id}
              variantTypes={variantTypeDefinitions}
              variants={usableVariantSkus}
              fallbackStock={product.stock}
              basePrice={selectorBasePrice}
            />
          ) : (
            <div className="p-4 border rounded-xl bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Güvenli ödeme, hızlı teslimat ve 7/24 destek.
              </p>
              <AddToCartButton productId={product.id} stock={product.stock} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
