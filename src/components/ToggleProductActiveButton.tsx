'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ToggleProductActiveButtonProps {
  productId: string
  isActive: boolean
  action: (formData: FormData) => Promise<void>
}

export function ToggleProductActiveButton({ productId, isActive, action }: ToggleProductActiveButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('id', productId)
      formData.append('isActive', isActive.toString())
      await action(formData)
      // Force a hard refresh instead of soft refresh
      window.location.reload()
    } catch (error) {
      console.error('Toggle error:', error)
      alert('İşlem sırasında bir hata oluştu.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`text-sm font-medium transition inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-600/10 border-transparent hover:border-orange-600/30'
          : 'text-green-400 hover:text-green-300 hover:bg-green-600/10 border-transparent hover:border-green-600/30'
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isActive ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
      {isLoading ? 'İşleniyor...' : (isActive ? 'Pasif Yap' : 'Aktif Yap')}
    </button>
  )
}
