'use client'

import { useEffect, useMemo, useState } from 'react'
import { AddToCartButton } from '@/components/AddToCartButton'

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
})

export interface VariantTypeOption {
  id: string
  value: string
}

export interface VariantTypeDefinition {
  id: string
  name: string
  sortOrder: number
  options: VariantTypeOption[]
}

export interface VariantOptionRelation {
  typeId: string
  optionId: string
  optionValue: string
}

export interface ProductVariantSku {
  id: string
  name: string | null
  price: number | null
  stock: number | null
  isActive: boolean
  optionRelations: VariantOptionRelation[]
}

interface ProductVariantSelectorProps {
  productId: string
  variantTypes: VariantTypeDefinition[]
  variants: ProductVariantSku[]
  fallbackStock: number
  basePrice: number
}

type SelectionState = Record<string, string | null>

const buildInitialSelection = (types: VariantTypeDefinition[]): SelectionState => {
  return types.reduce<SelectionState>((acc, type) => {
    acc[type.id] = null
    return acc
  }, {})
}

type VariantWithMap = ProductVariantSku & {
  optionMap: Record<string, string>
}

export function ProductVariantSelector({
  productId,
  variantTypes,
  variants,
  fallbackStock,
  basePrice,
}: ProductVariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<SelectionState>(() =>
    buildInitialSelection(variantTypes)
  )

  const selectionResetKey = useMemo(
    () => variantTypes.map((type) => `${type.id}:${type.options.length}`).join('|'),
    [variantTypes]
  )

  useEffect(() => {
    setSelectedOptions(buildInitialSelection(variantTypes))
  }, [selectionResetKey, variantTypes])

  const activeVariants: VariantWithMap[] = useMemo(() => {
    return variants
      .filter((variant) => variant.isActive && variant.optionRelations.length > 0)
      .map((variant) => {
        const optionMap = variant.optionRelations.reduce<Record<string, string>>((acc, relation) => {
          if (relation.typeId) {
            acc[relation.typeId] = relation.optionId
          }
          return acc
        }, {})
        return { ...variant, optionMap }
      })
  }, [variants])

  const allTypesSelected = useMemo(
    () => variantTypes.every((type) => selectedOptions[type.id]),
    [variantTypes, selectedOptions]
  )

  const matchedVariant = useMemo(() => {
    if (!allTypesSelected) return null
    return (
      activeVariants.find((variant) =>
        variantTypes.every((type) => variant.optionMap[type.id] === selectedOptions[type.id])
      ) || null
    )
  }, [activeVariants, allTypesSelected, selectedOptions, variantTypes])

  const displayPrice = matchedVariant?.price ?? basePrice
  const displayStock = matchedVariant?.stock ?? fallbackStock

  const nextIncompleteType = variantTypes.find((type) => !selectedOptions[type.id]) || null

  const handleSelectOption = (typeId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const next = { ...prev }
      const typeIndex = variantTypes.findIndex((type) => type.id === typeId)
      const alreadySelected = prev[typeId] === optionId
      next[typeId] = alreadySelected ? null : optionId
      for (let i = typeIndex + 1; i < variantTypes.length; i++) {
        next[variantTypes[i].id] = null
      }
      return next
    })
  }

  const isOptionCompatible = (typeId: string, optionId: string) => {
    return activeVariants.some((variant) => {
      if (variant.optionMap[typeId] !== optionId) {
        return false
      }
      return variantTypes.every((type) => {
        const selected = type.id === typeId ? optionId : selectedOptions[type.id]
        if (!selected) return true
        return variant.optionMap[type.id] === selected
      })
    })
  }

  const isTypeLocked = (typeIndex: number) => {
    if (typeIndex === 0) return false
    return variantTypes.slice(0, typeIndex).some((type) => !selectedOptions[type.id])
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Fiyat</p>
        <p className="text-3xl font-bold text-gray-900">{currency.format(displayPrice)}</p>
      </div>

      {variantTypes.map((type, index) => {
        const locked = isTypeLocked(index)
        return (
          <div key={type.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">{index + 1}. {type.name}</h4>
              {locked && (
                <span className="text-xs text-gray-400">Önce önceki seçenekleri seçin</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {type.options.map((option) => {
                const isSelected = selectedOptions[type.id] === option.id
                const isCompatible = isOptionCompatible(type.id, option.id)
                const disabled = locked || !isCompatible
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(type.id, option.id)}
                    disabled={disabled}
                    className={`px-4 py-2 rounded-2xl text-sm border transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/10 text-blue-100'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-500'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {option.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="space-y-2 text-sm text-gray-500">
        {matchedVariant ? (
          <div className="flex flex-wrap items-center gap-3 text-gray-700">
            <span className="text-gray-500">Seçim:</span>
            {variantTypes.map((type) => {
              const selectedId = selectedOptions[type.id]
              const optionLabel = type.options.find((opt) => opt.id === selectedId)?.value
              return (
                <span key={type.id} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                  {type.name}: {optionLabel}
                </span>
              )
            })}
          </div>
        ) : nextIncompleteType ? (
          <p className="text-yellow-600">Lütfen {nextIncompleteType.name} seçin.</p>
        ) : (
          <p>Varyant seçeneklerini seçin.</p>
        )}
        <p>
          Stok: <span className="text-gray-900 font-semibold">{displayStock}</span>
        </p>
      </div>

      <AddToCartButton
        productId={productId}
        variantId={matchedVariant?.id}
        stock={displayStock}
        disabled={!matchedVariant}
      />
    </div>
  )
}
