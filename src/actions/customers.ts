'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

const MUTABLE_PROFILE_FIELDS = ['sms_consent', 'kvkk_consent'] as const

type MutableField = (typeof MUTABLE_PROFILE_FIELDS)[number]

type BooleanLike = 'true' | 'false'

const toBoolean = (value: FormDataEntryValue | null): boolean => {
  if (value === null) return false
  if (typeof value === 'string') {
    return value === 'true' || value === 'on'
  }
  return Boolean(value)
}

export async function updateCustomerFlag(formData: FormData) {
  const profileId = (formData.get('profile_id') as string | null)?.trim()
  const field = (formData.get('field') as MutableField | null) ?? null
  const valueRaw = formData.get('value') as BooleanLike | FormDataEntryValue | null

  if (!profileId || !field || !MUTABLE_PROFILE_FIELDS.includes(field)) {
    throw new Error('Geçersiz müşteri alanı güncellemesi')
  }

  const value = toBoolean(valueRaw)
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ [field]: value })
    .eq('id', profileId)

  if (error) {
    console.error('Profile flag update error', error)
    throw new Error('Müşteri bilgisi güncellenemedi')
  }

  revalidatePath('/admin/customers')
}
