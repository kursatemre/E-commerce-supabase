'use client'

import { useEffect, useMemo, useState, type ComponentPropsWithoutRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import {
  bulkUpdateProductVariants,
  createVariantOption,
  generateProductVariantSkus,
  updateProductVariantSelections,
} from '@/actions/variant-system'
import type { VariantActionState } from '@/actions/variant-system'

interface VariantTypeDTO {
  id: string
  code: string
  name: string
  sort_order?: number
  is_active: boolean
}

interface VariantOptionDTO {
  id: string
  variant_type_id: string
  value: string
  sort_order?: number
  is_active: boolean
}

interface SelectedTypeDTO {
  variant_type_id: string
  sort_order?: number
}

interface ProductVariantOptionRelation {
  optionId: string
  optionValue: string
  typeName: string
}

interface ExistingVariantDTO {
  id: string
  name: string | null
  sku: string | null
  price: number | null
  stock: number | null
  is_active: boolean
  optionRelations: ProductVariantOptionRelation[]
}

interface ProductVariantManagerProps {
  productId: string
  variantTypes: VariantTypeDTO[]
  variantOptions: VariantOptionDTO[]
  selectedTypes: SelectedTypeDTO[]
  selectedOptionIds: string[]
  existingVariants: ExistingVariantDTO[]
}

type TypeState = Record<string, { enabled: boolean; optionIds: Set<string> }>

type VariantDraft = {
  id: string
  sku: string
  price: string
  stock: string
  isActive: boolean
}

const actionInitialState: VariantActionState = {
  status: 'idle',
  message: null,
}

function FormSubmitButton({
  children,
  pendingLabel,
  className = '',
  disabled,
  ...props
}: ComponentPropsWithoutRef<'button'> & { pendingLabel?: string }) {
  const { pending } = useFormStatus()
  const isDisabled = disabled || pending

  return (
    <button
      type="submit"
      {...props}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`.trim()}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-spin text-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span>{pendingLabel ?? 'İşleniyor...'}</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}

function ActionFeedback({ state }: { state: VariantActionState }) {
  if (!state?.message || state.status === 'idle') {
    return null
  }

  const color = state.status === 'success' ? 'text-emerald-400' : 'text-red-400'
  return (
    <p className={`text-xs font-medium ${color}`} aria-live="polite">
      {state.message}
    </p>
  )
}

export function ProductVariantManager({
  productId,
  variantTypes,
  variantOptions,
  selectedTypes,
  selectedOptionIds,
  existingVariants,
}: ProductVariantManagerProps) {
  const [selectionState, selectionAction] = useFormState(
    updateProductVariantSelections,
    actionInitialState
  )
  const [generationState, generationAction] = useFormState(
    generateProductVariantSkus,
    actionInitialState
  )
  const [bulkState, bulkAction] = useFormState(bulkUpdateProductVariants, actionInitialState)

  const optionByType = useMemo(() => {
    const map: Record<string, VariantOptionDTO[]> = {}
    for (const option of variantOptions.filter((option) => option.is_active)) {
      if (!map[option.variant_type_id]) {
        map[option.variant_type_id] = []
      }
      map[option.variant_type_id].push(option)
    }
    return map
  }, [variantOptions])

  const initialTypeState: TypeState = useMemo(() => {
    const selectedTypeIds = new Set(selectedTypes.map((type) => type.variant_type_id))
    const optionLookup = new Map(
      variantOptions.map((option) => [option.id, option.variant_type_id])
    )

    const optionSelectionsByType = new Map<string, Set<string>>()
    for (const optionId of selectedOptionIds) {
      const typeId = optionLookup.get(optionId)
      if (!typeId) continue
      if (!optionSelectionsByType.has(typeId)) {
        optionSelectionsByType.set(typeId, new Set())
      }
      optionSelectionsByType.get(typeId)?.add(optionId)
    }

    const state: TypeState = {}
    for (const type of variantTypes) {
      state[type.id] = {
        enabled: selectedTypeIds.has(type.id),
        optionIds: optionSelectionsByType.get(type.id) || new Set<string>(),
      }
    }
    return state
  }, [variantOptions, selectedOptionIds, selectedTypes, variantTypes])

  const selectionSignature = useMemo(
    () => JSON.stringify({ selectedTypes, selectedOptionIds }),
    [selectedOptionIds, selectedTypes]
  )

  const [typeSelections, setTypeSelections] = useState<TypeState>(initialTypeState)
  useEffect(() => {
    setTypeSelections(initialTypeState)
  }, [selectionSignature])

  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>(() =>
    existingVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku || '',
      price: variant.price !== null ? String(variant.price) : '',
      stock: variant.stock !== null ? String(variant.stock) : '',
      isActive: variant.is_active,
    }))
  )

  const variantSignature = useMemo(
    () =>
      JSON.stringify(
        existingVariants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          is_active: variant.is_active,
        }))
      ),
    [existingVariants]
  )

  useEffect(() => {
    setVariantDrafts(
      existingVariants.map((variant) => ({
        id: variant.id,
        sku: variant.sku || '',
        price: variant.price !== null ? String(variant.price) : '',
        stock: variant.stock !== null ? String(variant.stock) : '',
        isActive: variant.is_active,
      }))
    )
  }, [variantSignature])

  const selectionPayload = useMemo(() => {
    const enabledTypes = variantTypes
      .filter((type) => typeSelections[type.id]?.enabled)
      .map((type, index) => ({
        typeId: type.id,
        sortOrder: index,
        optionIds: Array.from(typeSelections[type.id]?.optionIds ?? []),
      }))

    return JSON.stringify({ types: enabledTypes })
  }, [typeSelections, variantTypes])

  const variantUpdatePayload = useMemo(() => {
    const formatted = variantDrafts.map((draft) => ({
      id: draft.id,
      sku: draft.sku.trim() || null,
      price: draft.price.trim() ? Number(draft.price) : undefined,
      stock: draft.stock.trim() ? Number(draft.stock) : undefined,
      isActive: draft.isActive,
    }))

    return JSON.stringify({ productId, variants: formatted })
  }, [productId, variantDrafts])

  const toggleType = (typeId: string) => {
    setTypeSelections((prev) => {
      const current = prev[typeId]
      if (!current) return prev
      const nextState = { ...prev }
      nextState[typeId] = {
        enabled: !current.enabled,
        optionIds: !current.enabled ? current.optionIds : new Set<string>(),
      }
      return nextState
    })
  }

  const toggleOption = (typeId: string, optionId: string) => {
    setTypeSelections((prev) => {
      const current = prev[typeId]
      if (!current) return prev
      const optionIds = new Set(current.optionIds)
      if (optionIds.has(optionId)) {
        optionIds.delete(optionId)
      } else {
        optionIds.add(optionId)
      }
      return {
        ...prev,
        [typeId]: {
          ...current,
          optionIds,
        },
      }
    })
  }

  const updateVariantDraft = (index: number, key: keyof VariantDraft, value: string | boolean) => {
    setVariantDrafts((prev) =>
      prev.map((draft, idx) => {
        if (idx !== index) return draft
        if (key === 'isActive' && typeof value === 'boolean') {
          return { ...draft, isActive: value }
        }
        if (typeof value === 'string') {
          return { ...draft, [key]: value }
        }
        return draft
      })
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">1. Varyant Tipleri ve Seçenekleri</h3>
            <p className="text-sm text-gray-400">Üründe hangi tipleri kullanacağınızı ve seçeneklerini seçin.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <form
              action={selectionAction}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="product_id" value={productId} />
              <input type="hidden" name="variant_selection_payload" value={selectionPayload} readOnly />
              <FormSubmitButton
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition"
                pendingLabel="Kaydediliyor..."
              >
                Seçimleri Kaydet
              </FormSubmitButton>
            </form>
            <ActionFeedback state={selectionState} />
          </div>
        </div>

        <div className="space-y-6">
          {variantTypes.length === 0 && (
            <p className="text-sm text-gray-500">
              Henüz tanımlı varyant tipi yok. Supabase üzerinden `variant_types` tablosuna kayıt ekleyebilirsiniz.
            </p>
          )}

          {variantTypes.map((type) => {
            const isEnabled = typeSelections[type.id]?.enabled
            const options = optionByType[type.id] || []
            return (
              <div key={type.id} className="border border-gray-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{type.name}</p>
                    <p className="text-xs text-gray-500">Kod: {type.code}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800"
                      checked={isEnabled}
                      onChange={() => toggleType(type.id)}
                    />
                    Bu üründe kullan
                  </label>
                </div>

                {options.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                          isEnabled
                            ? 'border-gray-700 text-gray-100'
                            : 'border-gray-800 text-gray-500 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800"
                          checked={typeSelections[type.id]?.optionIds.has(option.id) ?? false}
                          disabled={!isEnabled}
                          onChange={() => toggleOption(type.id, option.id)}
                        />
                        {option.value}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Bu tip için henüz seçenek tanımlanmadı.</p>
                )}

                <form
                  action={createVariantOption}
                  className="flex flex-wrap items-center gap-2 border border-dashed border-gray-700 rounded-xl p-3"
                >
                  <input type="hidden" name="variant_type_id" value={type.id} />
                  <input type="hidden" name="product_id" value={productId} />
                  <input
                    name="value"
                    placeholder={`${type.name} için yeni seçenek`}
                    className="flex-1 min-w-[200px] px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FormSubmitButton
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-800 text-gray-100 hover:bg-gray-700"
                    pendingLabel="Ekleniyor..."
                  >
                    Seçenek Ekle
                  </FormSubmitButton>
                </form>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">2. Kombinasyonları Oluştur</h3>
            <p className="text-sm text-gray-400">Seçili tip/seçeneklerden otomatik SKU üretin.</p>
          </div>
          <div className="flex flex-col gap-1">
            <form className="flex flex-wrap items-end gap-3" action={generationAction}>
              <input type="hidden" name="product_id" value={productId} />
              <div>
                <label className="block text-xs text-gray-400 mb-1">Varsayılan Fiyat</label>
                <input
                  name="default_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Örn. 999"
                  className="w-28 px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Varsayılan Stok</label>
                <input
                  name="default_stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-24 px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <FormSubmitButton
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition"
                pendingLabel="Oluşturuluyor..."
              >
                Kombinasyonları Oluştur
              </FormSubmitButton>
            </form>
            <ActionFeedback state={generationState} />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Bu işlem, seçili varyant tiplerinin tüm kombinasyonlarını oluşturur ve var olan SKU setlerini tekrar etmez.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">3. SKU Fiyat & Stok</h3>
            <p className="text-sm text-gray-400">Oluşturulan varyantların detaylarını güncelleyin.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <form action={bulkAction}>
              <input type="hidden" name="variant_update_payload" value={variantUpdatePayload} readOnly />
              <FormSubmitButton
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition"
                pendingLabel="Kaydediliyor..."
              >
                SKU Ayarlarını Kaydet
              </FormSubmitButton>
            </form>
            <ActionFeedback state={bulkState} />
          </div>
        </div>

        {existingVariants.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz oluşturulmuş SKU bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {existingVariants.map((variant, index) => (
              <div key={variant.id} className="border border-gray-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{variant.name || 'SKU'}</p>
                    <p className="text-xs text-gray-400">
                      {variant.optionRelations.length
                        ? variant.optionRelations.map((relation) => `${relation.typeName}: ${relation.optionValue}`).join(' • ')
                        : 'Seçenek bilgisi bulunamadı'}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800"
                      checked={variantDrafts[index]?.isActive ?? true}
                      onChange={(event) => updateVariantDraft(index, 'isActive', event.target.checked)}
                    />
                    Aktif
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">SKU Kodu</label>
                    <input
                      value={variantDrafts[index]?.sku ?? ''}
                      onChange={(event) => updateVariantDraft(index, 'sku', event.target.value)}
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fiyat (TL)</label>
                    <input
                      value={variantDrafts[index]?.price ?? ''}
                      onChange={(event) => updateVariantDraft(index, 'price', event.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Stok</label>
                    <input
                      value={variantDrafts[index]?.stock ?? ''}
                      onChange={(event) => updateVariantDraft(index, 'stock', event.target.value)}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Veri Özeti</label>
                    <div className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-900 text-xs text-gray-400">
                      ID: {variant.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
