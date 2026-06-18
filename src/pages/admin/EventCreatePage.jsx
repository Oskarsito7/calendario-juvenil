import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EventForm from '../../modules/events/components/EventForm.jsx'
import { eventService, groupService } from '../../services/eventService.js'
import { useAuth } from '../../hooks/useAuth.js'
import toast from 'react-hot-toast'

export default function EventCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

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
      setLoading(true)
      let coverUrl = null

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `covers/${Date.now()}.${fileExt}`
        const { supabase } = await import('../../app/supabase.js')
        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(fileName, coverFile)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('event-covers')
          .getPublicUrl(fileName)
        coverUrl = publicUrl
      }

      const eventData = {
        ...formData,
        cover_image_url: coverUrl,
        created_by: user.id,
      }

      await eventService.create(eventData, groupIds)
      toast.success('Evento creado exitosamente')
      navigate('/admin/eventos')
    } catch (err) {
      toast.error(err.message || 'Error creando evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Crear evento</h1>
      <EventForm
        groups={groups}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/eventos')}
        isLoading={loading}
      />
    </div>
  )
}
