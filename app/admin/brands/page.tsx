import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/DeleteButton'
import { createBrand, deleteBrand, toggleBrandActive } from '@/actions/brands'

export default async function BrandsPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Markalar</h1>
      </div>

      {/* Create Form */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Yeni Marka Ekle</h2>
        <form action={createBrand} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Marka Adı
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Apple, Samsung, vs..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Marka açıklaması..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
          >
            Marka Ekle
          </button>
        </form>
      </div>

      {/* Brands List */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Marka
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {brands?.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{brand.name}</div>
                    {brand.description && (
                      <div className="text-sm text-gray-400 mt-1">{brand.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400 font-mono">{brand.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={toggleBrandActive}>
                      <input type="hidden" name="id" value={brand.id} />
                      <input type="hidden" name="isActive" value={brand.is_active.toString()} />
                      <button
                        type="submit"
                        className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full transition ${
                          brand.is_active
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/50'
                            : 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${brand.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {brand.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(brand.created_at).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteButton
                      id={brand.id}
                      action={deleteBrand}
                      confirmMessage="Bu markayı silmek istediğinizden emin misiniz?"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!brands || brands.length === 0) && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-gray-500 text-sm">Henüz marka eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  )
}
