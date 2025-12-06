'use client'

import { useState } from 'react'

interface VariantInput {
  name: string
  color: string
  size: string
  sku: string
  price: string
  stock: string
  isActive: boolean
}

const emptyVariant = (): VariantInput => ({
  name: '',
  color: '',
  size: '',
  sku: '',
  price: '',
  stock: '0',
  isActive: true,
})

export function CreateProductVariants() {
  const [variants, setVariants] = useState<VariantInput[]>([])

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()])
  }

  const updateVariant = (index: number, field: keyof VariantInput, value: string | boolean) => {
    setVariants((prev) =>
      prev.map((variant, idx) =>
        idx === index ? { ...variant, [field]: value } : variant
      )
    )
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index))
  }

  const serialized = JSON.stringify(
    variants.map((variant) => ({
      ...variant,
      stock: variant.stock || '0',
    }))
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Varyantlar (Opsiyonel)</h3>
          <p className="text-sm text-gray-400">Ürün eklerken varyantları da oluşturabilirsiniz.</p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition"
        >
          + Varyant Ekle
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-gray-500">
          Henüz varyant eklenmedi. Yukarıdaki butonla renk/beden gibi seçenekler oluşturabilirsiniz.
        </p>
      )}

      <input type="hidden" name="variant_payload" value={serialized} readOnly />

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index} className="border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Varyant #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Kaldır
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Ad / Açıklama</label>
                <input
                  value={variant.name}
                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  placeholder="Örn. Mavi - L"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Renk</label>
                <input
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  placeholder="Örn. Mavi"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Beden</label>
                <input
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  placeholder="Örn. L"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Varyant SKU</label>
                <input
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  placeholder="Örn. IP15P-MAVI-L"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fiyat (TL)</label>
                <input
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ürün fiyatından farklıysa"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Stok</label>
                <input
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Durum</label>
              <select
                value={variant.isActive ? 'true' : 'false'}
                onChange={(e) => updateVariant(index, 'isActive', e.target.value === 'true')}
                className="px-3 py-2 bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
