'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Tab = 'details' | 'sizing' | 'shipping'

interface ProductTabsProps {
  description?: string
  features?: string[]
  materials?: string
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Ürün Detayları' },
  { id: 'sizing', label: 'Beden Rehberi' },
  { id: 'shipping', label: 'Kargo & İade' },
]

export function ProductTabs({ description, features, materials }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

  return (
    <div className="mt-12 md:mt-16">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-4 text-sm md:text-base font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'text-brand-dark'
                  : 'text-brand-dark/60 hover:text-brand-dark'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-action" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6 md:py-8">
        {activeTab === 'details' && (
          <div className="space-y-4">
            {description && (
              <div>
                <h3 className="font-heading font-semibold text-brand-dark mb-2">
                  Ürün Açıklaması
                </h3>
                <p className="text-brand-dark/80 text-sm md:text-base leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {materials && (
              <div>
                <h3 className="font-heading font-semibold text-brand-dark mb-2">
                  Malzeme
                </h3>
                <p className="text-brand-dark/80 text-sm md:text-base">
                  {materials}
                </p>
              </div>
            )}

            {features && features.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-brand-dark mb-2">
                  Özellikler
                </h3>
                <ul className="list-disc list-inside space-y-1 text-brand-dark/80 text-sm md:text-base">
                  {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {!description && !materials && (!features || features.length === 0) && (
              <p className="text-brand-dark/60 text-sm italic">
                Bu ürün için detaylı bilgi bulunmamaktadır.
              </p>
            )}
          </div>
        )}

        {activeTab === 'sizing' && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-brand-dark mb-4">
              Beden Tablosu
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-light">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-brand-dark">Beden</th>
                    <th className="px-4 py-2 text-left font-semibold text-brand-dark">Göğüs (cm)</th>
                    <th className="px-4 py-2 text-left font-semibold text-brand-dark">Bel (cm)</th>
                    <th className="px-4 py-2 text-left font-semibold text-brand-dark">Kalça (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { size: 'XS', chest: '80-84', waist: '60-64', hip: '86-90' },
                    { size: 'S', chest: '84-88', waist: '64-68', hip: '90-94' },
                    { size: 'M', chest: '88-92', waist: '68-72', hip: '94-98' },
                    { size: 'L', chest: '92-96', waist: '72-76', hip: '98-102' },
                    { size: 'XL', chest: '96-100', waist: '76-80', hip: '102-106' },
                  ].map((row) => (
                    <tr key={row.size}>
                      <td className="px-4 py-2 font-medium text-brand-dark">{row.size}</td>
                      <td className="px-4 py-2 text-brand-dark/80">{row.chest}</td>
                      <td className="px-4 py-2 text-brand-dark/80">{row.waist}</td>
                      <td className="px-4 py-2 text-brand-dark/80">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-brand-dark/60 mt-4">
              * Bedenler standart ölçülere göre hazırlanmıştır. Ürüne göre değişiklik gösterebilir.
            </p>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-semibold text-brand-dark mb-2 flex items-center gap-2">
                <span className="text-xl">🚚</span>
                Kargo Bilgileri
              </h3>
              <ul className="space-y-2 text-sm md:text-base text-brand-dark/80">
                <li>• Ücretsiz kargo: 500 TL ve üzeri siparişlerde</li>
                <li>• Standart kargo: 2-3 iş günü içinde teslim</li>
                <li>• Hızlı kargo: 1-2 iş günü içinde teslim (+30 TL)</li>
                <li>• Kargo takibi: Sipariş sonrası e-posta ile gönderilir</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-brand-dark mb-2 flex items-center gap-2">
                <span className="text-xl">↩️</span>
                İade ve Değişim
              </h3>
              <ul className="space-y-2 text-sm md:text-base text-brand-dark/80">
                <li>• 14 gün içinde ücretsiz iade ve değişim</li>
                <li>• Ürün kullanılmamış ve etiketli olmalıdır</li>
                <li>• İade kargo ücreti tarafımıza aittir</li>
                <li>• Para iadesi 3-5 iş günü içinde hesabınıza yansır</li>
              </ul>
            </div>

            <div className="p-4 bg-surface-light rounded-2xl">
              <p className="text-sm text-brand-dark/80">
                <strong>Not:</strong> Hijyen kuralları gereği, iç giyim ürünlerinde iade kabul edilmemektedir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
