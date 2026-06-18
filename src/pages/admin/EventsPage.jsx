import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { eventService } from '../../services/eventService.js'
import { formatDate, formatDateTime } from '../../utils/dateUtils.js'
import { GROUPS } from '../../utils/constants.js'
import toast from 'react-hot-toast'
import {
  Plus, Search, Filter, Trash2, Edit, Camera, History,
  CalendarDays, MapPin, ChevronRight, X, SlidersHorizontal,
  Calendar, CheckCircle2, Clock, XCircle
} from 'lucide-react'

export default function EventsPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', group_id: '', event_type: '', search: '' })
  const [deleteEvent, setDeleteEvent] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [filters])

  async function loadEvents() {
    try {
      setLoading(true)
      const data = await eventService.getAll(filters)
      setEvents(data)
    } catch (err) {
      toast.error('Error cargando eventos')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteEvent) return
    try {
      await eventService.delete(deleteEvent.id)
      toast.success('Evento eliminado')
      loadEvents()
    } catch (err) {
      toast.error('Error eliminando evento')
    } finally {
      setDeleteEvent(null)
    }
  }

  const filteredEvents = events.filter(ev => {
    if (!filters.search) return true
    const search = filters.search.toLowerCase()
    return ev.title?.toLowerCase().includes(search) ||
           ev.description?.toLowerCase().includes(search) ||
           ev.location?.toLowerCase().includes(search)
  })

  const statusConfig = {
    programado: { icon: Clock, color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Programado' },
    realizado: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Realizado' },
    cancelado: { icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelado' },
  }

  const typeLabels = {
    salida: 'Salida', clase_sabatina: 'Clase sabatina', escuela_juvenil: 'Escuela juvenil',
    grupo_pequeno: 'Grupo pequeño', reunion: 'Reunión', otro: 'Otro',
  }

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center space-y-3">
        <Loading size="lg" />
        <p className="text-sm text-slate-400">Cargando eventos...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-1">
            <CalendarDays size={14} />
            <span>Gestión de actividades</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <p className="text-sm text-slate-500">{filteredEvents.length} actividades registradas</p>
        </div>
        <Button
          onClick={() => navigate('/admin/eventos/nuevo')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} className="mr-2" /> Nuevo evento
        </Button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {(filters.status || filters.group_id || filters.event_type) && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">Todos los estados</option>
                <option value="programado">Programado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <select
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                value={filters.group_id}
                onChange={e => setFilters(f => ({ ...f, group_id: e.target.value }))}
              >
                <option value="">Todos los grupos</option>
                {GROUPS.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {(filters.status || filters.group_id || filters.event_type) && (
              <button
                onClick={() => setFilters({ status: '', group_id: '', event_type: '', search: filters.search })}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Events Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
            <CalendarDays size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No se encontraron eventos</p>
            <p className="text-sm text-slate-400 mt-1">Intenta con otros filtros o crea un nuevo evento</p>
          </div>
        )}

        {filteredEvents.map(event => {
          const status = statusConfig[event.status] || statusConfig.programado
          const StatusIcon = status.icon
          const groups = event.groups || []
          const firstGroup = groups[0]

          return (
            <div
              key={event.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Date column */}
                <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 sm:w-16 shrink-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: firstGroup?.color || '#94a3b8' }}
                  >
                    <span className="text-[10px] font-medium uppercase leading-none opacity-80">
                      {formatDate(event.start_date, 'MMM')}
                    </span>
                    <span className="text-lg leading-none">
                      {new Date(event.start_date).getDate()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3
                      className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/eventos/${event.id}/editar`)}
                    >
                      {event.title}
                    </h3>
                    {event.is_historical && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <History size={10} /> Histórico
                      </span>
                    )}
                    {event.cover_image_url && (
                      <Camera size={14} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} />
                      {formatDate(event.start_date, 'EEEE, d MMM yyyy')}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {event.location}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Group badges */}
                    {groups.map(g => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: g.color + '15',
                          color: g.color,
                          border: `1px solid ${g.color}25`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                        {g.name}
                      </span>
                    ))}

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>

                    {/* Type */}
                    <span className="text-xs text-slate-400 capitalize">
                      {typeLabels[event.event_type] || event.event_type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:flex-col sm:justify-center shrink-0">
                  <button
                    onClick={() => navigate(`/admin/eventos/${event.id}/editar`)}
                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteEvent(event)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteEvent}
        onClose={() => setDeleteEvent(null)}
        title="Eliminar evento"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-700">
                ¿Estás seguro de eliminar <strong className="text-slate-900">{deleteEvent?.title}</strong>?
              </p>
              <p className="text-xs text-slate-500 mt-1">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteEvent(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
