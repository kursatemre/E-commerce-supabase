import { createClient } from '@/lib/supabase/server'
import { ProductCarousel } from '@/components/homepage/ProductCarousel'

interface RelatedProductsProps {
  currentProductId: string
  categoryId?: string
  limit?: number
}

export async function RelatedProducts({
  currentProductId,
  categoryId,
  limit = 8,
}: RelatedProductsProps) {
  const supabase = await createClient()

  // Query for related products from same category
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      product_images(url, alt, sort_order)
    `)
    .eq('is_active', true)
    .neq('id', currentProductId)
    .limit(limit)

  // If category is provided, filter by it
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: relatedProducts } = await query

  if (!relatedProducts || relatedProducts.length === 0) {
    return null
  }

  const transformedProducts = relatedProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    images: product.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || null,
  }))

  return (
    <div className="mt-12 md:mt-16 border-t border-gray-200 pt-8">
      <ProductCarousel
        title="Benzer Ürünler"
        subtitle="İlginizi çekebilecek diğer ürünler"
        products={transformedProducts}
      />
    </div>
  )
}
