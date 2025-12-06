'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ProductImage {
  id: string
  url: string
  alt: string | null
  sort_order: number
}

interface ProductImagesProps {
  productId: string
  images: ProductImage[]
  onImagesChange?: () => void
}

export function ProductImages({ productId, images: initialImages, onImagesChange }: ProductImagesProps) {
  const [images, setImages] = useState(initialImages)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      setDeleting(imageId)

      // Extract file path from URL
      const urlParts = imageUrl.split('/product-images/')
      const filePath = urlParts[1]

      // Delete from storage
      if (filePath) {
        await supabase.storage
          .from('product-images')
          .remove([filePath])
      }

      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      setImages(images.filter(img => img.id !== imageId))

      if (onImagesChange) {
        onImagesChange()
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Görsel silinirken bir hata oluştu')
    } finally {
      setDeleting(null)
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Henüz görsel eklenmemiş</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={image.url}
              alt={image.alt || 'Ürün görseli'}
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={() => handleDelete(image.id, image.url)}
            disabled={deleting === image.id}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            {deleting === image.id ? '...' : '✕'}
          </button>
        </div>
      ))}
    </div>
  )
}
