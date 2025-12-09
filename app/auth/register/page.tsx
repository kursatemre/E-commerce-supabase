'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [kvkkConsent, setKvkkConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Register user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            kvkk_consent: kvkkConsent,
            kvkk_consent_date: new Date().toISOString(),
          })
          .eq('id', data.user.id)

        if (profileError) throw profileError

        // Redirect to shop
        router.push('/')
        router.refresh()
      }
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
            Hesap Oluştur
          </h1>
          <p className="text-sm text-brand-dark/60">
            Yeni hesabınızı oluşturun
          </p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-button mb-6 text-sm border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-brand-dark mb-2">
                Ad
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="input-field"
                placeholder="Adınız"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-brand-dark mb-2">
                Soyad
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="input-field"
                placeholder="Soyadınız"
              />
            </div>
          </div>

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
            <label htmlFor="phone" className="block text-sm font-semibold text-brand-dark mb-2">
              Telefon
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input-field"
              placeholder="05XX XXX XX XX"
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
              minLength={6}
              className="input-field"
              placeholder="En az 6 karakter"
            />
            <p className="text-xs text-brand-dark/40 mt-1">
              Şifreniz en az 6 karakter olmalıdır
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kvkkConsent}
                onChange={(e) => setKvkkConsent(e.target.checked)}
                required
                className="mt-1 w-4 h-4 text-action border-gray-300 rounded focus:ring-action focus:ring-2"
              />
              <span className="text-sm text-brand-dark/80">
                <a href="/kvkk" target="_blank" className="text-action font-semibold hover:text-action-hover underline">
                  KVKK Aydınlatma Metni
                </a>
                &apos;ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !kvkkConsent}
            className="btn-cta w-full disabled:opacity-50 mt-6"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-brand-dark/60">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-action font-semibold hover:text-action-hover transition-colors">
              Giriş Yap
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
