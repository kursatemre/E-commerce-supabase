'use client'

interface DeleteButtonProps {
  id: string
  action: (formData: FormData) => Promise<void>
  confirmMessage: string
  additionalFields?: Record<string, string>
}

export function DeleteButton({ id, action, confirmMessage, additionalFields }: DeleteButtonProps) {
  const handleDelete = () => {
    if (confirm(confirmMessage)) {
      const formData = new FormData()
      formData.append('id', id)
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }
      action(formData)
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 text-sm font-medium transition inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-600/10 border border-transparent hover:border-red-600/30"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Sil
    </button>
  )
}
