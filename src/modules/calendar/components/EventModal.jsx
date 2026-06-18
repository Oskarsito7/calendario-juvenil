import { useNavigate } from 'react-router-dom'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { formatDate, formatDateTime, formatTime } from '../../../utils/dateUtils.js'
import { MapPin, Clock, BookOpen, Users, Camera, Pencil, Trash2, History, X, Calendar } from 'lucide-react'

export default function EventModal({ event, isOpen, onClose, onDelete }) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  if (!event) return null

  const groups = event.groups || []
  const statusVariant =
    event.status === 'realizado' ? 'success' :
    event.status === 'cancelado' ? 'danger' : 'primary'

  const statusLabel =
    event.status === 'realizado' ? 'Realizado' :
    event.status === 'cancelado' ? 'Cancelado' : 'Programado'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} maxWidth="lg">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Cover image */}
        {event.cover_image_url ? (
          <div className="relative -mx-6 -mt-4 mb-5 h-48 rounded-t-xl overflow-hidden">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {groups.map(g => (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    style={{ backgroundColor: g.color + 'cc' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {g.name}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{event.title}</h2>
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {groups.map(g => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: g.color + '18', color: g.color, border: `1px solid ${g.color}30` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name}
                </span>
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{event.title}</h2>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            event.status === 'realizado' ? 'bg-green-100 text-green-700' :
            event.status === 'cancelado' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {statusLabel}
          </span>
          {event.is_historical && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              <History size={11} /> Histórico
            </span>
          )}
          <span className="text-xs font-medium text-slate-500 capitalize px-1">
            {event.event_type?.replace(/_/g, ' ')}
          </span>
          {event.series_name && (
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Serie: {event.series_name}
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{formatDateTime(event.start_date)}</p>
            </div>
          </div>
          {event.location && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lugar</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{event.location}</p>
              </div>
            </div>
          )}
          {event.bible_verse && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Versículo</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{event.bible_verse}</p>
              </div>
            </div>
          )}
          {event.attendees_count > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Users size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asistentes</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{event.attendees_count} personas</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción</p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        )}

        {/* Internal notes for admin */}
        {event.internal_notes && isAdmin && (
          <div className="mb-5">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Notas internas</p>
              <p className="text-sm text-amber-800">{event.internal_notes}</p>
            </div>
          </div>
        )}

        {/* Gallery link */}
        {event.status === 'realizado' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-5">
            <Camera size={16} className="text-blue-600 shrink-0" />
            <span className="text-sm text-blue-700 font-medium">Hay fotos de esta actividad disponibles</span>
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => {
                onClose()
                navigate(`/admin/eventos/${event.id}/editar`)
              }}
            >
              <Pencil size={16} className="mr-2" /> Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onClose()
                onDelete?.(event)
              }}
            >
              <Trash2 size={16} className="mr-2" /> Eliminar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
