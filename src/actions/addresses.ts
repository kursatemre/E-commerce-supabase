'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type AddressPayload = {
  label: string | null
  recipient_name: string | null
  phone: string | null
  address_line: string | null
  district: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  is_default: boolean
}

const toOptionalText = (value: FormDataEntryValue | null, fallback: string | null = null) => {
  if (!value) return fallback
  const normalized = String(value).trim()
  return normalized.length ? normalized : fallback
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

async function clearDefaultAddresses(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', userId)
}

function buildPayload(formData: FormData): AddressPayload {
  return {
    label: toOptionalText(formData.get('label'), 'Adres'),
    recipient_name: toOptionalText(formData.get('recipient_name')),
    phone: toOptionalText(formData.get('phone')),
    address_line: toOptionalText(formData.get('address_line')),
    district: toOptionalText(formData.get('district')),
    city: toOptionalText(formData.get('city')),
    postal_code: toOptionalText(formData.get('postal_code')),
    country: toOptionalText(formData.get('country'), 'Türkiye'),
    is_default: formData.get('is_default') === 'on',
  }
}

export async function createAddress(formData: FormData) {
  const { supabase, user } = await ensureUser()
  const payload = buildPayload(formData)

  if (!payload.recipient_name || !payload.address_line || !payload.city) {
    throw new Error('Adres oluşturmak için zorunlu alanlar boş bırakılamaz')
  }

  if (payload.is_default) {
    await clearDefaultAddresses(supabase, user.id)
  }

  const { error } = await supabase.from('customer_addresses').insert({
    user_id: user.id,
    ...payload,
  })

  if (error) {
    console.error('Create address error', error)
    throw new Error('Adres eklenemedi')
  }

  revalidatePath('/shop/account/addresses')
}

export async function updateAddress(formData: FormData) {
  const { supabase, user } = await ensureUser()
  const addressId = toOptionalText(formData.get('address_id'))
  const payload = buildPayload(formData)

  if (!addressId) {
    throw new Error('Güncellenecek adres bulunamadı')
  }

  if (!payload.recipient_name || !payload.address_line || !payload.city) {
    throw new Error('Adres güncellemek için zorunlu alanlar boş bırakılamaz')
  }

  if (payload.is_default) {
    await clearDefaultAddresses(supabase, user.id)
  }

  const { error } = await supabase
    .from('customer_addresses')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Update address error', error)
    throw new Error('Adres güncellenemedi')
  }

  revalidatePath('/shop/account/addresses')
}

export async function deleteAddress(formData: FormData) {
  const { supabase, user } = await ensureUser()
  const addressId = toOptionalText(formData.get('address_id'))

  if (!addressId) {
    throw new Error('Silinecek adres bulunamadı')
  }

  const { error } = await supabase
    .from('customer_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete address error', error)
    throw new Error('Adres silinemedi')
  }

  revalidatePath('/shop/account/addresses')
}

export async function setDefaultAddress(formData: FormData) {
  const { supabase, user } = await ensureUser()
  const addressId = toOptionalText(formData.get('address_id'))

  if (!addressId) {
    throw new Error('Varsayılan yapılacak adres bulunamadı')
  }

  await clearDefaultAddresses(supabase, user.id)

  const { error } = await supabase
    .from('customer_addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Set default address error', error)
    throw new Error('Varsayılan adres güncellenemedi')
  }

  revalidatePath('/shop/account/addresses')
}
