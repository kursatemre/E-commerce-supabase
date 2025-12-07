import { cookies } from 'next/headers'

const GUEST_COOKIE_NAME = 'guest_id'
const MAX_AGE = 60 * 60 * 24 * 180 // 180 days

export async function ensureGuestId() {
  const cookieStore = await cookies()
  const existing = cookieStore.get(GUEST_COOKIE_NAME)?.value
  if (existing) return existing

  const newId = crypto.randomUUID()
  cookieStore.set(GUEST_COOKIE_NAME, newId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
  })
  return newId
}

export async function getGuestId() {
  const cookieStore = await cookies()
  return cookieStore.get(GUEST_COOKIE_NAME)?.value ?? null
}
