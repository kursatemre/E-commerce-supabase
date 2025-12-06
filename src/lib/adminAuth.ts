const ADMIN_COOKIE_NAME = 'admin_session'
const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin321'
const DEFAULT_SESSION_TOKEN = 'change-this-admin-session-token'

export function getAdminConfig() {
  return {
    username: process.env.ADMIN_PANEL_USERNAME || DEFAULT_USERNAME,
    password: process.env.ADMIN_PANEL_PASSWORD || DEFAULT_PASSWORD,
    sessionToken: process.env.ADMIN_SESSION_TOKEN || DEFAULT_SESSION_TOKEN,
  }
}

export function isAdminCredentialValid(username?: string | null, password?: string | null) {
  const { username: expectedUsername, password: expectedPassword } = getAdminConfig()
  return username === expectedUsername && password === expectedPassword
}

export function isAdminSessionValid(token?: string | null) {
  if (!token) return false
  const { sessionToken } = getAdminConfig()
  return token === sessionToken
}

export { ADMIN_COOKIE_NAME }
