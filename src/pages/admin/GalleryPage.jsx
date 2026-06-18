import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { eventService, galleryService } from '../../services/eventService.js'
import toast from 'react-hot-toast'
import { ImagePlus, Calendar } from 'lucide-react'
import ImageUploader from '../../modules/gallery/components/ImageUploader.jsx'
import GalleryGrid, { Lightbox } from '../../modules/gallery/components/GalleryGrid.jsx'

export default function GalleryPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [images, setImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      setLoading(true)
      const data = await eventService.getAll({ status: 'realizado' })
      setEvents(data)
    } catch (err) {
      toast.error('Error cargando eventos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectEvent(event) {
    setSelectedEvent(event)
    try {
      const imgs = await galleryService.getByEvent(event.id)
      setImages(imgs)
    } catch (err) {
      toast.error('Error cargando fotos')
      setImages([])
    }
  }

  async function handleUpload(files) {
    if (!selectedEvent) return
    try {
      for (const file of files) {
        await galleryService.upload(selectedEvent.id, file)
      }
      const imgs = await galleryService.getByEvent(selectedEvent.id)
      setImages(imgs)
      toast.success('Fotos subidas')
    } catch (err) {
      toast.error('Error subiendo fotos')
    }
  }

  async function handleDeleteImage(imageId, storagePath) {
    try {
      await galleryService.delete(imageId, storagePath)
      setImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Foto eliminada')
    } catch (err) {
      toast.error('Error eliminando foto')
    }
  }

  if (loading) return <Loading size="lg" className="flex h-64 items-center justify-center" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Galería</h1>
          <p className="text-sm text-slate-500">Subir y gestionar fotos de actividades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase">Eventos realizados</h3>
          {events.length === 0 && (
            <p className="text-sm text-slate-500">No hay eventos realizados</p>
          )}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => handleSelectEvent(ev)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedEvent?.id === ev.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500">{ev.start_date?.slice(0, 10)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <Card>
              <CardHeader
                title={selectedEvent.title}
                subtitle="Sube fotos de la actividad"
                action={
                  <Button variant="secondary" onClick={() => navigate(`/admin/eventos/${selectedEvent.id}/editar`)}>
                    Ver evento
                  </Button>
                }
              />
              <ImageUploader onUpload={handleUpload} />
              <div className="mt-4">
                <GalleryGrid
                  images={images}
                  canDelete={true}
                  onImageClick={(i) => setLightboxIndex(i)}
                  onImageDelete={handleDeleteImage}
                />
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
              <ImagePlus size={48} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Selecciona un evento para gestionar sus fotos</p>
            </div>
          )}
        </div>
      </div>

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
