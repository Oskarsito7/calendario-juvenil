import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function GalleryGrid({ images, onImageClick, onImageDelete, canDelete }) {
  if (images.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">No hay fotos aún</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((img, i) => (
        <div
          key={img.id}
          className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer bg-slate-100"
          onClick={() => onImageClick?.(i)}
        >
          <img
            src={img.public_url}
            alt={img.caption || 'Foto'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {canDelete && onImageDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onImageDelete(img.id, img.storage_path)
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X size={14} />
            </button>
          )}
          {img.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-white truncate">{img.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  if (!images || images.length === 0) return null

  const img = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      <button
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={currentIndex === 0}
        className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={currentIndex === images.length - 1}
        className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
      >
        <ChevronRight size={32} />
      </button>

      <div className="max-w-5xl max-h-screen p-8">
        <img
          src={img.public_url}
          alt={img.caption || 'Foto'}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        {img.caption && (
          <p className="text-center text-white mt-4 text-sm">{img.caption}</p>
        )}
        <p className="text-center text-white/60 mt-2 text-xs">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  )
}
