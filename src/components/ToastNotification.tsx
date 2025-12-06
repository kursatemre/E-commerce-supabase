'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function ToastNotification() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success) {
      setMessage(success)
      setType('success')
      setShow(true)

      // Remove query param
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      router.replace(url.pathname)

      setTimeout(() => setShow(false), 5000)
    } else if (error) {
      setMessage(error)
      setType('error')
      setShow(true)

      // Remove query param
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      router.replace(url.pathname)

      setTimeout(() => setShow(false), 5000)
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`
        ${type === 'success' ? 'bg-green-800/90 border-green-600' : 'bg-red-800/90 border-red-600'}
        backdrop-blur-sm border-2 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-3 min-w-[300px] max-w-md
      `}>
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}
        `}>
          {type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Message */}
        <div className="flex-1 pt-0.5">
          <p className="font-semibold text-sm mb-0.5">
            {type === 'success' ? 'Başarılı!' : 'Hata!'}
          </p>
          <p className="text-sm text-gray-200">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="flex-shrink-0 text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
