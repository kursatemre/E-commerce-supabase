'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const slugify = (value: string) =>
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

const isFile = (entry: FormDataEntryValue): entry is File =>
  typeof entry === 'object' && entry !== null && 'arrayBuffer' in entry

type VariantPayloadRaw = {
  name?: string
  color?: string
  size?: string
  sku?: string
  price?: string | number | null
  stock?: string | number | null
  isActive?: boolean | string
}

const toNullableString = (value: unknown) =>
  typeof value === 'string' ? (value.trim() || null) : null

const toBoolean = (value: unknown, fallback = true) => {
  if (value === 'false' || value === false) return false
  if (value === 'true' || value === true) return true
  return fallback
}

const toPriceFromUnknown = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const numeric = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(numeric) ? parseFloat(numeric.toFixed(2)) : null
}

const toStockFromUnknown = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 0
  const numeric = typeof value === 'number' ? value : parseInt(String(value), 10)
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0
}


async function uploadProductImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  files: File[]
) {
  if (!files.length) return 0

  const { count } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  let uploaded = 0
  let baseOrder = count || 0

  for (const file of files) {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Geçersiz dosya türü')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır')
      }

      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `products/${productId}/${productId}-${Date.now()}-${uploaded}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicData.publicUrl,
          alt: file.name,
          sort_order: ++baseOrder,
        })

      if (insertError) throw insertError
      uploaded += 1
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  return uploaded
}
export async function createProduct(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const discountPriceRaw = formData.get('discount_price') as string
  const discountPrice = discountPriceRaw && discountPriceRaw.trim() !== '' ? parseFloat(discountPriceRaw) : null
  const stock = parseInt(formData.get('stock') as string)
  const categoryId = formData.get('category_id') as string
  const brandId = formData.get('brand_id') as string
  const sku = formData.get('sku') as string
  const imageEntries = formData.getAll('images')
  const imageFiles = imageEntries.filter((entry): entry is File => isFile(entry) && entry.size > 0)
  const variantPayloadRaw = formData.get('variant_payload') as string | null
  const slug = slugify(name)
  let variantInputs: VariantPayloadRaw[] = []

  if (variantPayloadRaw) {
    try {
      const parsed = JSON.parse(variantPayloadRaw)
      if (Array.isArray(parsed)) {
        variantInputs = parsed
      }
    } catch (variantParseError) {
      console.error('Variant payload parse error:', variantParseError)
    }
  }

  const { data, error } = await supabase.from('products').insert({
    name,
    slug,
    description,
    price,
    discount_price: discountPrice,
    stock,
    category_id: categoryId || null,
    brand_id: brandId || null,
    sku: sku || null,
    is_active: true,
  }).select().single()

  if (error) {
    console.error('Error creating product:', error)
    revalidatePath('/admin/products')
    redirect(`/admin/products?error=${encodeURIComponent('Ürün eklenirken bir hata oluştu')}`)
  }

  const uploadedCount = data ? await uploadProductImages(supabase, data.id, imageFiles) : 0

  if (data && variantInputs.length > 0) {
    const variantRows = variantInputs
      .map((variant) => ({
        name: toNullableString(variant.name),
        color: toNullableString(variant.color),
        size: toNullableString(variant.size),
        sku: toNullableString(variant.sku),
        price: toPriceFromUnknown(variant.price),
        stock: toStockFromUnknown(variant.stock),
        is_active: toBoolean(variant.isActive, true),
      }))
      .filter((variant) => variant.name || variant.color || variant.size || variant.sku)

    if (variantRows.length > 0) {
      const payload = variantRows.map((variant) => ({
        ...variant,
        product_id: data.id,
      }))

      const { error: variantInsertError } = await supabase
        .from('product_variants')
        .insert(payload)

      if (variantInsertError) {
        console.error('Error inserting variants during createProduct:', variantInsertError)
      }
    }
  }

  revalidatePath('/admin/products')
  // Redirect to product detail page to add images
  const successMessage = uploadedCount > 0
    ? `Ürün ve ${uploadedCount} görsel başarıyla eklendi.`
    : 'Ürün başarıyla eklendi. Dilerseniz görsel ekleyebilirsiniz.'
  redirect(`/admin/products/${data.id}?success=${encodeURIComponent(successMessage)}`)
}

export async function updateProduct(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const discountPriceRaw = formData.get('discount_price') as string
  const discountPrice = discountPriceRaw && discountPriceRaw.trim() !== '' ? parseFloat(discountPriceRaw) : null
  const stock = parseInt(formData.get('stock') as string)
  const categoryId = formData.get('category_id') as string
  const brandId = formData.get('brand_id') as string
  const sku = formData.get('sku') as string
  const isActive = formData.get('is_active') === 'true'
  const seoTitle = ((formData.get('seo_title') as string) || '').trim() || null
  const seoDescription = ((formData.get('seo_description') as string) || '').trim() || null
  const seoKeywords = ((formData.get('seo_keywords') as string) || '').trim() || null
  const seoCanonicalUrl = ((formData.get('seo_canonical_url') as string) || '').trim() || null
  const seoRobots = ((formData.get('seo_robots') as string) || '').trim() || null

  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug: slugify(name),
      description,
      price,
      discount_price: discountPrice,
      stock,
      category_id: categoryId || null,
      brand_id: brandId || null,
      sku: sku || null,
      is_active: isActive,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      seo_canonical_url: seoCanonicalUrl,
      seo_robots: seoRobots,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    redirect(`/admin/products/${id}?error=${encodeURIComponent('Ürün güncellenemedi')}`)
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  redirect(`/admin/products/${id}?success=${encodeURIComponent('Ürün güncellendi')}`)
}

const parsePrice = (value: FormDataEntryValue | null) => {
  if (!value) return null
  const price = parseFloat(value as string)
  return Number.isFinite(price) ? price : null
}

const parseStock = (value: FormDataEntryValue | null, fallback = 0) => {
  if (!value) return fallback
  const stock = parseInt(value as string, 10)
  return Number.isFinite(stock) ? stock : fallback
}

export async function createVariant(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()
  const productId = formData.get('product_id') as string
  const payload = {
    product_id: productId,
    name: (formData.get('name') as string)?.trim() || null,
    color: (formData.get('color') as string)?.trim() || null,
    size: (formData.get('size') as string)?.trim() || null,
    sku: (formData.get('sku') as string)?.trim() || null,
    price: parsePrice(formData.get('price')),
    stock: parseStock(formData.get('stock'), 0),
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase.from('product_variants').insert(payload)

  if (error) {
    console.error('Error creating variant:', error)
    redirect(`/admin/products/${productId}?error=Varyant eklenemedi`)
  }

  revalidatePath(`/admin/products/${productId}`)
  redirect(`/admin/products/${productId}?success=${encodeURIComponent('Varyant oluşturuldu')}`)
}

export async function updateVariant(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()
  const variantId = formData.get('id') as string
  const productId = formData.get('product_id') as string

  const { error } = await supabase
    .from('product_variants')
    .update({
      name: (formData.get('name') as string)?.trim() || null,
      color: (formData.get('color') as string)?.trim() || null,
      size: (formData.get('size') as string)?.trim() || null,
      sku: (formData.get('sku') as string)?.trim() || null,
      price: parsePrice(formData.get('price')),
      stock: parseStock(formData.get('stock'), 0),
      is_active: formData.get('is_active') === 'true',
    })
    .eq('id', variantId)

  if (error) {
    console.error('Error updating variant:', error)
    redirect(`/admin/products/${productId}?error=Varyant güncellenemedi`)
  }

  revalidatePath(`/admin/products/${productId}`)
  redirect(`/admin/products/${productId}?success=${encodeURIComponent('Varyant güncellendi')}`)
}

export async function deleteVariant(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()
  const variantId = formData.get('id') as string
  const productId = formData.get('product_id') as string

  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId)

  if (error) {
    console.error('Error deleting variant:', error)
    redirect(`/admin/products/${productId}?error=Varyant silinemedi`)
  }

  revalidatePath(`/admin/products/${productId}`)
  redirect(`/admin/products/${productId}?success=${encodeURIComponent('Varyant silindi')}`)
}
export async function deleteProduct(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
  }

  revalidatePath('/admin/products')
}

export async function toggleProductActive(formData: FormData) {
  // Use admin client for admin operations (bypasses RLS)
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  const isActive = formData.get('isActive') === 'true'

  const { error } = await supabase
    .from('products')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) {
    console.error('Error toggling product:', error)
  }

  revalidatePath('/admin/products')
}
