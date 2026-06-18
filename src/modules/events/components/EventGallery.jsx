import { useState } from 'react'
import ImageUploader from '../../gallery/components/ImageUploader.jsx'
import GalleryGrid, { Lightbox } from '../../gallery/components/GalleryGrid.jsx'

export default function EventGallery({ images, canEdit, onUpload, onDeleteImage }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  return (
    <div className="space-y-4">
      {canEdit && onUpload && (
        <ImageUploader onUpload={onUpload} />
      )}

      <GalleryGrid
        images={images}
        canDelete={canEdit}
        onImageClick={(i) => setLightboxIndex(i)}
        onImageDelete={onDeleteImage}
      />

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(i) => setLightboxIndex(i)}
        />
      )}
    </div>
  )
}
