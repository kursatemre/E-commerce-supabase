'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCategory(formData: FormData) {
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

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
    description,
    is_active: true,
  })

  if (error) {
    console.error('Error creating category:', error)
    revalidatePath('/admin/categories')
    redirect('/admin/categories?error=Kategori eklenirken bir hata oluştu')
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories?success=Kategori başarıyla eklendi')
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    revalidatePath('/admin/categories')
    redirect('/admin/categories?error=Kategori silinirken bir hata oluştu')
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories?success=Kategori başarıyla silindi')
}

export async function toggleCategoryActive(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const isActive = formData.get('isActive') === 'true'

  const { error } = await supabase
    .from('categories')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) {
    console.error('Error toggling category:', error)
  }

  revalidatePath('/admin/categories')
}
