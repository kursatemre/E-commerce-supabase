'use client'

import { useState } from 'react'

interface DeleteButtonProps {
  id: string
  action: (formData: FormData) => Promise<void>
  confirmMessage: string
  additionalFields?: Record<string, string>
}

export function DeleteButton({ id, action, confirmMessage, additionalFields }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(confirmMessage)) return

    setIsDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', id)
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }
      await action(formData)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Silme işlemi sırasında bir hata oluştu.')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400 hover:text-red-300 text-sm font-medium transition inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-600/10 border border-transparent hover:border-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {isDeleting ? 'Siliniyor...' : 'Sil'}
    </button>
  )
}
