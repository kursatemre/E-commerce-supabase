'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

const parseJsonPayload = <T>(value: FormDataEntryValue | null): T | null => {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Variant payload parse error:', error)
    return null
  }
}

const toNumberOrNull = (input: unknown) => {
  if (input === null || input === undefined || input === '') return null
  const numeric = typeof input === 'number' ? input : parseFloat(String(input))
  return Number.isFinite(numeric) ? numeric : null
}

const toStockNumber = (input: unknown) => {
  if (input === null || input === undefined || input === '') return 0
  const numeric = typeof input === 'number' ? input : parseInt(String(input), 10)
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0
}

const slugifyCode = (value: string) =>
  value
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export type VariantActionState = {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

const buildErrorState = (error: unknown): VariantActionState => ({
  status: 'error',
  message:
    error instanceof Error
      ? error.message
      : 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
})

const buildSuccessState = (message: string | null): VariantActionState => ({
  status: 'success',
  message,
})

type VariantSelectionPayload = {
  types: Array<{
    typeId: string
    optionIds: string[]
    sortOrder?: number
  }>
}

async function handleUpdateProductVariantSelections(formData: FormData) {
  const productId = formData.get('product_id') as string
  const payload = parseJsonPayload<VariantSelectionPayload>(formData.get('variant_selection_payload'))

  if (!productId || !payload) {
    throw new Error('Eksik ürün veya varyant seçimi gönderildi')
  }

  const supabase = await createClient()

  // Clean previous relations
  await Promise.all([
    supabase.from('product_variant_types').delete().eq('product_id', productId),
    supabase.from('product_variant_options').delete().eq('product_id', productId),
  ])

  if (!payload.types.length) {
    revalidatePath(`/admin/products/${productId}`)
    return
  }

  const typeRows = payload.types.map((type, index) => ({
    product_id: productId,
    variant_type_id: type.typeId,
    sort_order: typeof type.sortOrder === 'number' ? type.sortOrder : index,
  }))

  const optionRows = payload.types.flatMap((type) =>
    (type.optionIds || []).map((optionId) => ({
      product_id: productId,
      variant_option_id: optionId,
    }))
  )

  const [typeInsertResult, optionInsertResult] = await Promise.all([
    typeRows.length
      ? supabase.from('product_variant_types').insert(typeRows)
      : { error: null },
    optionRows.length
      ? supabase.from('product_variant_options').insert(optionRows)
      : { error: null },
  ])

  if (typeInsertResult.error || optionInsertResult.error) {
    console.error('Variant selection update error:', typeInsertResult.error || optionInsertResult.error)
    throw new Error('Varyant tip/opsiyon güncellenemedi')
  }

  revalidatePath(`/admin/products/${productId}`)
}

export async function updateProductVariantSelections(
  _prevState: VariantActionState,
  formData: FormData
): Promise<VariantActionState> {
  try {
    await handleUpdateProductVariantSelections(formData)
    return buildSuccessState('Varyant seçimleri kaydedildi.')
  } catch (error) {
    console.error('Variant selection action error:', error)
    return buildErrorState(error)
  }
}

type VariantCombinationPayload = {
  defaultPrice?: number | null
  defaultStock?: number | null
  combinations: Array<{
    label?: string
    sku?: string
    price?: number | null
    stock?: number | null
    optionIds: string[]
  }>
}

async function handleGenerateProductVariantSkus(formData: FormData) {
  const productId = formData.get('product_id') as string
  const payload = parseJsonPayload<VariantCombinationPayload>(formData.get('variant_combination_payload'))

  if (!productId) {
    throw new Error('Ürün bilgisi gerekli')
  }

  const supabase = await createClient()

  const productResponse = await supabase
    .from('products')
    .select('id, slug, name')
    .eq('id', productId)
    .single()

  if (productResponse.error || !productResponse.data) {
    throw new Error('Ürün bulunamadı')
  }

  const defaultPriceRaw = formData.get('default_price')
  const defaultStockRaw = formData.get('default_stock')

  const formDefaultPrice = defaultPriceRaw !== null ? toNumberOrNull(defaultPriceRaw) : null
  const formDefaultStock = defaultStockRaw !== null ? toStockNumber(defaultStockRaw) : null

  const defaultPrice = formDefaultPrice ?? toNumberOrNull(payload?.defaultPrice)
  const defaultStock = formDefaultStock ?? toStockNumber(payload?.defaultStock)

  let combinationEntries = payload?.combinations
    ?.map((combo) => ({
      ...combo,
      optionIds: Array.isArray(combo.optionIds)
        ? combo.optionIds.filter((id) => typeof id === 'string' && id)
        : [],
    }))
    .filter((combo) => combo.optionIds.length > 0)
    ?? []

  let existingOptionSets = new Set<string>()

  if (!combinationEntries.length) {
    const { data: typeSelections } = await supabase
      .from('product_variant_types')
      .select('variant_type_id, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })

    if (!typeSelections?.length) {
      throw new Error('Bu ürün için tanımlı aktif varyant tipi yok')
    }

    const typeIds = typeSelections.map((row) => row.variant_type_id)

    const [{ data: optionSelections }, { data: typesData }] = await Promise.all([
      supabase
        .from('product_variant_options')
        .select('variant_option_id')
        .eq('product_id', productId),
      supabase
        .from('variant_types')
        .select('id, name, code')
        .in('id', typeIds),
    ])

    const optionIds = optionSelections?.map((row) => row.variant_option_id) ?? []

    if (!optionIds.length) {
      throw new Error('Varyant seçenekleri seçilmemiş')
    }

    const { data: optionData } = await supabase
      .from('variant_options')
      .select('id, value, variant_type_id')
      .in('id', optionIds)

    const groupedOptions = typeSelections.map((type) => ({
      typeId: type.variant_type_id,
      options: (optionData || []).filter((option) => option.variant_type_id === type.variant_type_id),
    }))

    if (groupedOptions.some((group) => !group.options.length)) {
      throw new Error('Bazı varyant tipleri için seçenek seçilmemiş')
    }

    const typeNameMap = new Map<string, string>(
      (typesData || []).map((type) => [type.id, type.name || type.code || 'Tip'])
    )

    const optionCollections = groupedOptions.map((group) => group.options)
    existingOptionSets = await fetchExistingVariantOptionSets(supabase, productId)

    const productSets = optionCollections.reduce<string[][]>((acc, currentOptions) => {
      const result: string[][] = []
      for (const prefix of acc) {
        for (const option of currentOptions) {
          result.push([...prefix, option.id])
        }
      }
      return result
    }, [[]])

    combinationEntries = productSets
      .map((optionIds) => ({
        optionIds,
        label: optionIds
          .map((optionId) => {
            const option = optionData?.find((opt) => opt.id === optionId)
            const typeName = option ? typeNameMap.get(option.variant_type_id) : 'Tip'
            return `${typeName}: ${option?.value ?? ''}`
          })
          .join(' | '),
      }))
      .filter((combo) => {
        const normalized = [...combo.optionIds].sort().join('|')
        return !existingOptionSets.has(normalized)
      })

  }

  const normalizedDedupedEntries: typeof combinationEntries = []
  for (const combo of combinationEntries) {
    const normalized = [...combo.optionIds].sort().join('|')
    if (existingOptionSets.has(normalized)) {
      continue
    }
    existingOptionSets.add(normalized)
    normalizedDedupedEntries.push(combo)
  }

  combinationEntries = normalizedDedupedEntries

  if (!combinationEntries.length) {
    revalidatePath(`/admin/products/${productId}`)
    return { createdCount: 0 }
  }

  const variantRows = combinationEntries.map((combo, index) => ({
    product_id: productId,
    name: combo.label || `SKU ${index + 1}`,
    sku: combo.sku || null,
    price: toNumberOrNull(combo.price) ?? defaultPrice,
    stock: toStockNumber(combo.stock ?? defaultStock),
    is_active: true,
  }))

  const { data: insertedVariants, error: insertError } = await supabase
    .from('product_variants')
    .insert(variantRows)
    .select('id')

  if (insertError || !insertedVariants?.length) {
    console.error('Variant insert error:', insertError)
    throw new Error('Varyantlar oluşturulamadı')
  }

  const pivotRows = insertedVariants.flatMap((variant, variantIndex) => {
    const optionIds = combinationEntries[variantIndex]?.optionIds || []
    return optionIds.map((optionId) => ({
      product_variant_id: variant.id,
      variant_option_id: optionId,
    }))
  })

  if (pivotRows.length) {
    const { error: pivotError } = await supabase
      .from('variant_option_product_variants')
      .insert(pivotRows)

    if (pivotError) {
      console.error('Variant pivot insert error:', pivotError)
      throw new Error('Varyant seçenek bağlantıları oluşturulamadı')
    }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { createdCount: combinationEntries.length }
}

export async function generateProductVariantSkus(
  _prevState: VariantActionState,
  formData: FormData
): Promise<VariantActionState> {
  try {
    const result = await handleGenerateProductVariantSkus(formData)
    if (!result?.createdCount) {
      return buildSuccessState('Ek kombinasyon bulunamadı, tüm varyantlar zaten mevcut.')
    }
    return buildSuccessState(`${result.createdCount} yeni kombinasyon oluşturuldu.`)
  } catch (error) {
    console.error('Variant generation action error:', error)
    return buildErrorState(error)
  }
}

type VariantBulkUpdatePayload = {
  productId: string
  variants: Array<{
    id: string
    sku?: string | null
    price?: number | null
    stock?: number | null
    isActive?: boolean
  }>
}

async function handleBulkUpdateProductVariants(formData: FormData) {
  const payload = parseJsonPayload<VariantBulkUpdatePayload>(formData.get('variant_update_payload'))

  if (!payload || !payload.productId) {
    throw new Error('SKU güncelleme verisi bulunamadı')
  }

  if (!payload.variants?.length) {
    revalidatePath(`/admin/products/${payload.productId}`)
    return { updated: false }
  }

  const supabase = await createClient()

  for (const variant of payload.variants) {
    if (!variant.id) continue
    const updatePayload: Record<string, unknown> = {}

    if (variant.sku !== undefined) {
      updatePayload.sku = variant.sku || null
    }

    if (variant.price !== undefined) {
      updatePayload.price = toNumberOrNull(variant.price)
    }

    if (variant.stock !== undefined) {
      updatePayload.stock = toStockNumber(variant.stock)
    }

    if (typeof variant.isActive === 'boolean') {
      updatePayload.is_active = variant.isActive
    }

    if (!Object.keys(updatePayload).length) {
      continue
    }

    const { error } = await supabase
      .from('product_variants')
      .update(updatePayload)
      .eq('id', variant.id)

    if (error) {
      console.error('Variant bulk update error:', error)
      throw new Error('Bazı SKU kayıtları güncellenemedi')
    }
  }

  revalidatePath(`/admin/products/${payload.productId}`)
  return { updated: true }
}

export async function bulkUpdateProductVariants(
  _prevState: VariantActionState,
  formData: FormData
): Promise<VariantActionState> {
  try {
    const result = await handleBulkUpdateProductVariants(formData)
    if (!result?.updated) {
      return buildSuccessState('Güncellenecek SKU bulunamadı.')
    }
    return buildSuccessState('SKU ayarları güncellendi.')
  } catch (error) {
    console.error('Variant bulk update action error:', error)
    return buildErrorState(error)
  }
}

export async function createVariantOption(formData: FormData) {
  const variantTypeId = formData.get('variant_type_id') as string
  const value = (formData.get('value') as string)?.trim()
  const productId = formData.get('product_id') as string | null

  if (!variantTypeId || !value) {
    throw new Error('Varyant tipi ve değer zorunludur')
  }

  const supabase = await createClient()

  const { data: lastOption } = await supabase
    .from('variant_options')
    .select('sort_order')
    .eq('variant_type_id', variantTypeId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (lastOption?.sort_order ?? 0) + 1

  const { error } = await supabase
    .from('variant_options')
    .insert({
      variant_type_id: variantTypeId,
      value,
      sort_order: nextOrder,
      is_active: true,
    })

  if (error) {
    console.error('Variant option create error:', error)
    throw new Error('Varyant seçeneği eklenemedi')
  }

  if (productId) {
    revalidatePath(`/admin/products/${productId}`)
  } else {
    revalidatePath('/admin/products')
  }
}

export async function createVariantType(formData: FormData) {
  const rawName = (formData.get('name') as string)?.trim()
  const rawCode = (formData.get('code') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!rawName) {
    throw new Error('Varyant tipi adı zorunludur')
  }

  const codeSource = rawCode || rawName
  const code = slugifyCode(codeSource)

  if (!code) {
    throw new Error('Geçerli bir varyant kodu belirlenemedi')
  }

  const supabase = await createClient()

  const { data: lastType } = await supabase
    .from('variant_types')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (lastType?.sort_order ?? 0) + 1

  const { error } = await supabase
    .from('variant_types')
    .insert({
      code,
      name: rawName,
      description,
      sort_order: nextOrder,
      is_active: true,
    })

  if (error) {
    console.error('Variant type create error:', error)
    throw new Error('Varyant tipi eklenemedi')
  }

  revalidatePath('/admin/products/variants')
}

export async function toggleVariantTypeActive(formData: FormData) {
  const variantTypeId = formData.get('variant_type_id') as string
  const currentState = formData.get('is_active') as string

  if (!variantTypeId) {
    throw new Error('Varyant tipi bulunamadı')
  }

  const supabase = await createClient()
  const nextState = currentState === 'true' ? false : true

  const { error } = await supabase
    .from('variant_types')
    .update({ is_active: nextState })
    .eq('id', variantTypeId)

  if (error) {
    console.error('Variant type toggle error:', error)
    throw new Error('Varyant tipi güncellenemedi')
  }

  revalidatePath('/admin/products/variants')
}

export async function toggleVariantOptionActive(formData: FormData) {
  const optionId = formData.get('variant_option_id') as string
  const currentState = formData.get('is_active') as string

  if (!optionId) {
    throw new Error('Varyant seçeneği bulunamadı')
  }

  const supabase = await createClient()
  const nextState = currentState === 'true' ? false : true

  const { error } = await supabase
    .from('variant_options')
    .update({ is_active: nextState })
    .eq('id', optionId)

  if (error) {
    console.error('Variant option toggle error:', error)
    throw new Error('Varyant seçeneği güncellenemedi')
  }

  revalidatePath('/admin/products/variants')
}

async function fetchExistingVariantOptionSets(
  supabase: SupabaseServerClient,
  productId: string
) {
  const { data } = await supabase
    .from('variant_option_product_variants')
    .select('product_variant_id, variant_option_id, product_variants!inner ( product_id )')
    .eq('product_variants.product_id', productId)

  const variantOptionMap = new Map<string, Set<string>>()

  for (const row of data || []) {
    const set = variantOptionMap.get(row.product_variant_id) || new Set<string>()
    set.add(row.variant_option_id)
    variantOptionMap.set(row.product_variant_id, set)
  }

  const normalizedSet = new Set<string>()
  variantOptionMap.forEach((set) => {
    const key = [...set].sort().join('|')
    normalizedSet.add(key)
  })
  return normalizedSet
}
