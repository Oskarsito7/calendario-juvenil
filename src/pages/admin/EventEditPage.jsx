import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EventForm from '../../modules/events/components/EventForm.jsx'
import EventGallery from '../../modules/events/components/EventGallery.jsx'
import { eventService, groupService, galleryService } from '../../services/eventService.js'
import { useAuth } from '../../hooks/useAuth.js'
import toast from 'react-hot-toast'
import { Loading } from '../../components/ui/Loading.jsx'

export default function EventEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [groups, setGroups] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEvent()
    loadGroups()
  }, [id])

  async function loadEvent() {
    try {
      setLoading(true)
      const [ev, imgs] = await Promise.all([
        eventService.getById(id),
        galleryService.getByEvent(id),
      ])
      setEvent(ev)
      setImages(imgs)
    } catch (err) {
      toast.error('Error cargando evento')
      navigate('/admin/eventos')
    } finally {
      setLoading(false)
    }
  }

  async function loadGroups() {
    try {
      const data = await groupService.getAll()
      setGroups(data)
    } catch (err) {
      toast.error('Error cargando grupos')
    }
  }

  async function handleSubmit(formData, groupIds, coverFile) {
    try {
      setSaving(true)
      let coverUrl = event.cover_image_url

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `covers/${Date.now()}.${fileExt}`
        const { supabase } = await import('../../app/supabase.js')
        
        if (event.cover_image_url) {
          const oldPath = event.cover_image_url.split('/').pop()
          if (oldPath) {
            await supabase.storage.from('event-covers').remove([`covers/${oldPath}`]).catch(() => {})
          }
        }

        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(fileName, coverFile)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('event-covers')
          .getPublicUrl(fileName)
        coverUrl = publicUrl
      }

      const payload = { ...formData, cover_image_url: coverUrl }
      await eventService.update(id, payload, groupIds)
      toast.success('Evento actualizado')
      navigate('/admin/eventos')
    } catch (err) {
      toast.error(err.message || 'Error actualizando evento')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadImages(files) {
    try {
      for (const file of files) {
        await galleryService.upload(id, file)
      }
      const imgs = await galleryService.getByEvent(id)
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
  if (!event) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Editar evento</h1>
      <EventForm
        initialData={event}
        groups={groups}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/eventos')}
        isLoading={saving}
        isEditing
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Galería de fotos</h3>
        <EventGallery
          eventId={id}
          images={images}
          canEdit={true}
          onUpload={handleUploadImages}
          onDeleteImage={handleDeleteImage}
        />
      </div>
    </div>
  )
}
