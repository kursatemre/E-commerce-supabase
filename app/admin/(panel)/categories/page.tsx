import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/DeleteButton'
import { createCategory, deleteCategory, toggleCategoryActive } from '@/actions/categories'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
      </div>

      {/* Create Form */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Yeni Kategori Ekle</h2>
        <form action={createCategory} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Kategori Adı
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Elektronik"
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
              placeholder="Kategori açıklaması..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
          >
            Kategori Ekle
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Kategori
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
              {categories?.map((category) => (
                <tr key={category.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-400 mt-1">{category.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400 font-mono">{category.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={toggleCategoryActive}>
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="isActive" value={category.is_active.toString()} />
                      <button
                        type="submit"
                        className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full transition ${
                          category.is_active
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/50'
                            : 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${category.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {category.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(category.created_at).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteButton
                      id={category.id}
                      action={deleteCategory}
                      confirmMessage="Bu kategoriyi silmek istediğinizden emin misiniz?"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!categories || categories.length === 0) && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-gray-500 text-sm">Henüz kategori eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  )
}
