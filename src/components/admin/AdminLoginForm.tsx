'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { adminLogin, adminLoginDefaultState } from '@/actions/adminAuth'

interface AdminLoginFormProps {
  redirectTo: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
    >
      {pending ? 'Giriş yapılıyor…' : 'Admin Girişi'}
    </button>
  )
}

export function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const [state, formAction] = useFormState(adminLogin, adminLoginDefaultState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="admin-username">
          Kullanıcı Adı
        </label>
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="admin"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1" htmlFor="admin-password">
          Şifre
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <div className="rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
