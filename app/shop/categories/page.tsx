import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Kategoriler - E-Ticaret',
  description: 'Tüm ürün kategorilerimize göz atın',
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="section-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/60 mb-6">
        <Link href="/shop" className="hover:text-brand-dark transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-brand-dark">Kategoriler</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-dark mb-2">
          Tüm Kategoriler
        </h1>
        <p className="text-brand-dark/60">
          {categories?.length || 0} kategori bulundu
        </p>
      </div>

      {/* Categories Grid */}
      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-light border border-gray-200 hover:border-action transition-all hover:shadow-lg"
            >
              {/* Category Name */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center">
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-brand-dark group-hover:text-action transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-brand-dark/60 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-action rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-surface-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4 opacity-40">📂</div>
          <h2 className="font-heading text-2xl font-semibold text-brand-dark mb-2">
            Kategori Bulunamadı
          </h2>
          <p className="text-brand-dark/60 mb-6">
            Şu anda aktif kategori bulunmuyor.
          </p>
          <Link href="/shop" className="btn-cta inline-block">
            Tüm Ürünlere Dön
          </Link>
        </div>
      )}
    </div>
  )
}
