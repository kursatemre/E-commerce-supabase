'use client'

import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const syncServerSession = async (event: string, session: Session | null) => {
    try {
      await fetch('/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ event, session }),
      })
    } catch (error) {
      console.warn('Sunucu oturumu eşitlenemedi', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

  if (error) throw error

  await syncServerSession('SIGNED_IN', data.session ?? null)

      // Check user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const redirectParam = searchParams.get('redirectedFrom') || undefined
      const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : undefined
      const targetPath = profile?.role === 'admin'
        ? safeRedirect ?? '/admin'
        : safeRedirect && !safeRedirect.startsWith('/admin')
          ? safeRedirect
          : '/shop'

      router.replace(targetPath)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light px-4 py-8">
      <div className="bg-surface-white p-8 rounded-2xl border border-gray-200 shadow-button w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-h1 text-brand-dark mb-2">
            Hoş Geldiniz
          </h1>
          <p className="text-sm text-brand-dark/60">
            Hesabınıza giriş yapın
          </p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-button mb-6 text-sm border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-2">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-brand-dark mb-2">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cta w-full disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-brand-dark/60">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-action font-semibold hover:text-action-hover transition-colors">
              Kayıt Ol
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link href="/shop" className="text-sm text-brand-dark/60 hover:text-brand-dark transition-colors">
            ← Alışverişe Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
