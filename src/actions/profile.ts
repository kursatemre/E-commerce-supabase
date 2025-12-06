'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ProfilePayload = {
  first_name: string | null
  last_name: string | null
  phone: string | null
  kvkk_consent: boolean
}

type PasswordPayload = {
  current_password: string
  new_password: string
}

const toOptional = (value: FormDataEntryValue | null) => {
  if (!value) return null
  const normalized = String(value).trim()
  return normalized.length ? normalized : null
}

async function ensureUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return { supabase, user }
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await ensureUser()
  const payload: ProfilePayload = {
    first_name: toOptional(formData.get('first_name')),
    last_name: toOptional(formData.get('last_name')),
    phone: toOptional(formData.get('phone')),
    kvkk_consent: formData.get('kvkk_consent') === 'on',
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error', error)
    throw new Error('Profil güncellenemedi')
  }

  revalidatePath('/shop/account/profile')
}

export async function updatePassword(formData: FormData) {
  const { supabase } = await ensureUser()
  const currentPassword = String(formData.get('current_password') || '')
  const newPassword = String(formData.get('new_password') || '')

  if (!currentPassword || !newPassword) {
    throw new Error('Şifre alanları boş bırakılamaz')
  }

  if (newPassword.length < 8) {
    throw new Error('Yeni şifre en az 8 karakter olmalıdır')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('Password update error', error)
    throw new Error(error.message || 'Şifre güncellenemedi')
  }

  revalidatePath('/shop/account/profile')
}
