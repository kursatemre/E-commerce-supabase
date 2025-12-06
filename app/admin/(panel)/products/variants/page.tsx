import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  createVariantOption,
  createVariantType,
  toggleVariantOptionActive,
  toggleVariantTypeActive,
} from '@/actions/variant-system'

type VariantType = {
  id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number | null
}

type VariantOption = {
  id: string
  variant_type_id: string
  value: string
  is_active: boolean
  sort_order: number | null
}

export default async function VariantDefinitionsPage() {
  const supabase = await createClient()

  const [variantTypesResponse, variantOptionsResponse] = await Promise.all([
    supabase
      .from('variant_types')
      .select('id, code, name, description, is_active, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('variant_options')
      .select('id, variant_type_id, value, is_active, sort_order')
      .order('variant_type_id', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('value', { ascending: true }),
  ])

  const variantTypes = (variantTypesResponse.data ?? []) as VariantType[]
  const variantOptions = (variantOptionsResponse.data ?? []) as VariantOption[]
  const optionMap = variantOptions.reduce<Record<string, VariantOption[]>>((acc, option) => {
    if (!acc[option.variant_type_id]) {
      acc[option.variant_type_id] = []
    }
    acc[option.variant_type_id].push(option)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">Ürünler & Stok</p>
          <h1 className="text-2xl font-semibold text-white">Varyant Tanımları</h1>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-sm text-gray-200 hover:bg-gray-700/50"
        >
          Ürün Listesine Dön
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Nasıl Çalışır?</h2>
        <p className="text-sm text-gray-400">
          Varyant tipleri (ör. Renk, Beden, Materyal) tüm ürünlerde tekrar kullanılabilir. Burada tipleri ve seçeneklerini
          tanımlayın, ardından ürün detay sayfasında bu tipleri seçip SKU kombinasyonlarını oluşturun.
        </p>
        <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1">
          <li>Önce genel varyant tiplerini oluşturun.</li>
          <li>Her tip için kullanılacak seçenekleri ekleyin.</li>
          <li>Ürün detayında tipleri seçip kombinasyon üreticisiyle SKU&apos;ları oluşturun.</li>
        </ol>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Yeni Varyant Tipi</h2>
        <form action={createVariantType} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="variant-name">
              Tip Adı *
            </label>
            <input
              id="variant-name"
              name="name"
              required
              placeholder="Örn. Renk"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="variant-code">
              Kod (Opsiyonel)
            </label>
            <input
              id="variant-code"
              name="code"
              placeholder="örn. renk"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="variant-description">
              Açıklama
            </label>
            <input
              id="variant-description"
              name="description"
              placeholder="Panelde görünecek kısa açıklama"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition"
            >
              Tipi Oluştur
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {variantTypes.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-sm text-gray-400">
            Henüz tanımlı varyant tipi yok. Yukarıdaki formu kullanarak ilk tipinizi oluşturun.
          </div>
        ) : (
          variantTypes.map((type) => {
            const options = optionMap[type.id] || []
            return (
              <div key={type.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{type.name}</p>
                    <p className="text-sm text-gray-400">Kod: {type.code}</p>
                    {type.description && (
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    )}
                  </div>
                  <form action={toggleVariantTypeActive}>
                    <input type="hidden" name="variant_type_id" value={type.id} />
                    <input type="hidden" name="is_active" value={type.is_active ? 'true' : 'false'} />
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                        type.is_active
                          ? 'text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10'
                          : 'text-red-300 border-red-500/40 hover:bg-red-500/10'
                      }`}
                    >
                      {type.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-200">Seçenekler ({options.length})</h3>
                  {options.length === 0 ? (
                    <p className="text-sm text-gray-500">Bu tip için henüz seçenek eklenmedi.</p>
                  ) : (
                    <div className="space-y-2">
                      {options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
                          <div>
                            <p className="text-sm text-white">{option.value}</p>
                            <p className="text-xs text-gray-500">Sıra: {option.sort_order ?? 0}</p>
                          </div>
                          <form action={toggleVariantOptionActive}>
                            <input type="hidden" name="variant_option_id" value={option.id} />
                            <input type="hidden" name="is_active" value={option.is_active ? 'true' : 'false'} />
                            <button
                              type="submit"
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                option.is_active
                                  ? 'text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10'
                                  : 'text-red-300 border-red-500/40 hover:bg-red-500/10'
                              }`}
                            >
                              {option.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}

                  <form action={createVariantOption} className="flex flex-wrap items-center gap-3 border border-dashed border-gray-700 rounded-2xl p-4">
                    <input type="hidden" name="variant_type_id" value={type.id} />
                    <input
                      name="value"
                      placeholder={`${type.name} için yeni seçenek`}
                      className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition"
                    >
                      + Seçenek Ekle
                    </button>
                  </form>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
