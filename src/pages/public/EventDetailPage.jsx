import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { eventService, galleryService } from '../../services/eventService.js'
import { formatDate, formatDateTime } from '../../utils/dateUtils.js'
import toast from 'react-hot-toast'
import { ArrowLeft, Share2, MapPin, Clock, BookOpen, Users, Camera, History, CalendarDays, Heart, ChevronRight, ExternalLink } from 'lucide-react'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvent()
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
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('¡Enlace copiado al portapapeles!')
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" />
        <p className="text-sm text-slate-400">Cargando actividad...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <CalendarDays className="text-slate-400" size={32} />
      </div>
      <p className="text-slate-500 mb-2">Evento no encontrado</p>
      <Button variant="link" onClick={() => navigate('/')}>
        <ArrowLeft size={16} className="mr-1" /> Volver al calendario
      </Button>
    </div>
  )

  const groups = event.groups || []
  const statusVariant =
    event.status === 'realizado' ? 'success' :
    event.status === 'cancelado' ? 'danger' : 'primary'

  const statusLabel =
    event.status === 'realizado' ? 'Realizado' :
    event.status === 'cancelado' ? 'Cancelado' : 'Programado'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
          <ArrowLeft size={16} />
        </div>
        Volver al calendario
      </button>

      {/* Hero */}
      {event.cover_image_url ? (
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-72 sm:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {groups.map(g => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md"
                  style={{ backgroundColor: g.color + 'cc' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {g.name}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{event.title}</h1>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {groups.map(g => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: g.color + '18', color: g.color, border: `1px solid ${g.color}30` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                {g.name}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{event.title}</h1>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
              event.status === 'realizado' ? 'bg-green-100 text-green-700' :
              event.status === 'cancelado' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {statusLabel}
            </span>
            {event.is_historical && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                <History size={11} /> Histórico
              </span>
            )}
            <span className="text-xs font-medium text-slate-500 capitalize px-1">
              {event.event_type?.replace(/_/g, ' ')}
            </span>
            {event.series_name && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                Serie: {event.series_name}
              </span>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <CalendarDays size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</p>
                <p className="text-sm font-medium text-slate-800 mt-1">{formatDateTime(event.start_date)}</p>
              </div>
            </div>
            {event.location && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lugar</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{event.location}</p>
                </div>
              </div>
            )}
            {event.bible_verse && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Versículo</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{event.bible_verse}</p>
                </div>
              </div>
            )}
            {event.attendees_count > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asistentes</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">{event.attendees_count} personas</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Descripción</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Gallery */}
          {images.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                  <Camera size={18} className="text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Galería de fotos</h3>
                  <p className="text-sm text-slate-500">{images.length} {images.length === 1 ? 'foto' : 'fotos'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-100 shadow-sm hover:shadow-lg transition-all"
                    onClick={() => window.open(img.public_url, '_blank')}
                  >
                    <img
                      src={img.public_url}
                      alt={img.caption || 'Foto'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ExternalLink size={24} className="text-white" />
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-xs text-white truncate">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <Share2 size={16} />
              Compartir evento
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-blue-500" />
              Grupos
            </h3>
            <div className="space-y-3">
              {groups.map(g => (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: g.color }}>
                    {g.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{g.name}</p>
                    <p className="text-xs text-slate-500">Actividad programada</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3 text-blue-300">
              <Heart size={16} className="fill-current" />
              <span className="text-sm font-medium">Ministerio de Jóvenes</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Únete a nuestras actividades y crece en comunidad. Todos los jóvenes son bienvenidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
