import { cookies } from 'next/headers'

const GUEST_COOKIE_NAME = 'guest_id'

/**
 * Gets the guest ID from cookies.
 * The guest_id cookie is automatically created by middleware if it doesn't exist.
 * This function only reads the cookie, it never sets it.
 */
export async function ensureGuestId() {
  const cookieStore = await cookies()
  const existing = cookieStore.get(GUEST_COOKIE_NAME)?.value

  // Guest ID should be set by middleware
  // If it's not present, return a temporary ID
  return existing ?? 'temp-' + crypto.randomUUID()
}

/**
 * Gets the guest ID from cookies, or null if not present.
 */
export async function getGuestId() {
  const cookieStore = await cookies()
  return cookieStore.get(GUEST_COOKIE_NAME)?.value ?? null
}
