import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button.jsx'
import { Input, TextArea } from '../../../components/ui/Input.jsx'
import { Select } from '../../../components/ui/Select.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { EVENT_TYPES, EVENT_STATUS, GROUPS } from '../../../utils/constants.js'
import { toISOString, extractDate, extractTime } from '../../../utils/dateUtils.js'
import { Camera, X } from 'lucide-react'

export default function EventForm({ initialData, groups, onSubmit, onCancel, isLoading, isEditing }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    bible_verse: '',
    event_type: 'clase_sabatina',
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '11:00',
    location: '',
    status: 'programado',
    is_historical: false,
    internal_notes: '',
    attendees_count: 0,
    series_name: '',
    cover_image_url: '',
    ...initialData,
  })
  const [selectedGroups, setSelectedGroups] = useState(
    initialData?.groups?.map(g => g.id) || []
  )
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(initialData?.cover_image_url || '')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        start_date: initialData.start_date ? extractDate(initialData.start_date) : '',
        end_date: initialData.end_date ? extractDate(initialData.end_date) : '',
        start_time: initialData.start_date ? extractTime(initialData.start_date) : '09:00',
        end_time: initialData.end_date ? extractTime(initialData.end_date) : '11:00',
      })
      setSelectedGroups(initialData.groups?.map(g => g.id) || [])
      setCoverPreview(initialData.cover_image_url || '')
    }
  }, [initialData])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const toggleGroup = (id) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, cover: 'Máximo 5MB' }))
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, cover: 'Solo JPG, PNG, WebP' }))
      return
    }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, cover: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título es obligatorio'
    if (!form.start_date) errs.start_date = 'La fecha de inicio es obligatoria'
    if (!form.end_date) errs.end_date = 'La fecha de fin es obligatoria'
    if (form.end_date && form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
      errs.end_date = 'La fecha de fin debe ser posterior o igual'
    }
    if (selectedGroups.length === 0) errs.groups = 'Selecciona al menos un grupo'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const startDate = toISOString(form.start_date, form.start_time)
    const endDate = toISOString(form.end_date, form.end_time)

    // Excluir start_time y end_time del payload — la tabla no tiene estas columnas
    const { start_time, end_time, ...restForm } = form

    const payload = {
      ...restForm,
      start_date: startDate,
      end_date: endDate,
      attendees_count: form.status === 'realizado' ? parseInt(form.attendees_count || 0) : null,
    }

    onSubmit(payload, selectedGroups, coverFile)
  }

  const isBibleVerseVisible = ['clase_sabatina', 'escuela_juvenil'].includes(form.event_type)
  const isAttendeesVisible = form.status === 'realizado'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Título *"
          value={form.title}
          onChange={e => handleChange('title', e.target.value)}
          error={errors.title}
          className="md:col-span-2"
        />

        <TextArea
          label="Descripción / Tema"
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          rows={3}
          className="md:col-span-2"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Grupos *</label>
          <div className="flex flex-wrap gap-2">
            {groups.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGroup(g.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
                style={{
                  backgroundColor: selectedGroups.includes(g.id) ? g.color + '15' : '#fff',
                  borderColor: selectedGroups.includes(g.id) ? g.color : '#e2e8f0',
                  color: selectedGroups.includes(g.id) ? g.color : '#64748b',
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                {g.name}
                {selectedGroups.includes(g.id) && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
          {errors.groups && <p className="mt-1 text-xs text-red-600">{errors.groups}</p>}
        </div>

        <Select
          label="Tipo de actividad"
          value={form.event_type}
          onChange={e => handleChange('event_type', e.target.value)}
          options={EVENT_TYPES.map(t => ({ value: t.value, label: t.label }))}
        />

        <Select
          label="Estado"
          value={form.status}
          onChange={e => handleChange('status', e.target.value)}
          options={EVENT_STATUS.map(s => ({ value: s.value, label: s.label }))}
        />

        <Input
          label="Fecha de inicio *"
          type="date"
          value={form.start_date}
          onChange={e => handleChange('start_date', e.target.value)}
          error={errors.start_date}
        />
        <Input
          label="Hora de inicio"
          type="time"
          value={form.start_time}
          onChange={e => handleChange('start_time', e.target.value)}
        />

        <Input
          label="Fecha de fin *"
          type="date"
          value={form.end_date}
          onChange={e => handleChange('end_date', e.target.value)}
          error={errors.end_date}
        />
        <Input
          label="Hora de fin"
          type="time"
          value={form.end_time}
          onChange={e => handleChange('end_time', e.target.value)}
        />

        <Input
          label="Lugar / Dirección"
          value={form.location}
          onChange={e => handleChange('location', e.target.value)}
          className="md:col-span-2"
        />

        {isBibleVerseVisible && (
          <Input
            label="Versículo bíblico"
            value={form.bible_verse}
            onChange={e => handleChange('bible_verse', e.target.value)}
            className="md:col-span-2"
          />
        )}

        <Input
          label="Serie temática"
          value={form.series_name}
          onChange={e => handleChange('series_name', e.target.value)}
          placeholder="Ej: Fe y propósito"
          className="md:col-span-2"
        />

        {isAttendeesVisible && (
          <Input
            label="Número de asistentes"
            type="number"
            value={form.attendees_count}
            onChange={e => handleChange('attendees_count', e.target.value)}
          />
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Imagen de portada</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
              <Camera size={16} />
              {coverPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
            </label>
            {coverPreview && (
              <div className="relative">
                <img src={coverPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview('') }}
                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
          {errors.cover && <p className="mt-1 text-xs text-red-600">{errors.cover}</p>}
        </div>

        <TextArea
          label="Notas internas (solo directores)"
          value={form.internal_notes}
          onChange={e => handleChange('internal_notes', e.target.value)}
          rows={2}
          className="md:col-span-2"
        />

        <div className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            id="is_historical"
            checked={form.is_historical}
            onChange={e => handleChange('is_historical', e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_historical" className="text-sm text-slate-700">Marcar como evento histórico</label>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear evento'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
