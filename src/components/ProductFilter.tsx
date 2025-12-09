'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page

    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ürün ara..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Ara
      </button>
      {search && (
        <button
          type="button"
          onClick={() => {
            setSearch('')
            router.push('/')
          }}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Temizle
        </button>
      )}
    </form>
  )
}
