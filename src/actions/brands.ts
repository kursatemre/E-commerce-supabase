'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBrand(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const slug = name.toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const { error } = await supabase.from('brands').insert({
    name,
    slug,
    description,
    is_active: true,
  })

  if (error) {
    console.error('Error creating brand:', error)
  }

  revalidatePath('/admin/brands')
}

export async function deleteBrand(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting brand:', error)
  }

  revalidatePath('/admin/brands')
}

export async function toggleBrandActive(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const isActive = formData.get('isActive') === 'true'

  const { error } = await supabase
    .from('brands')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) {
    console.error('Error toggling brand:', error)
  }

  revalidatePath('/admin/brands')
}
