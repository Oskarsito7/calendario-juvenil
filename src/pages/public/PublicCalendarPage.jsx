import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import CalendarView from '../../modules/calendar/components/CalendarView.jsx'
import EventModal from '../../modules/calendar/components/EventModal.jsx'
import GroupFilters from '../../modules/calendar/components/GroupFilters.jsx'
import EventLegend from '../../modules/calendar/components/EventLegend.jsx'
import { useCalendar } from '../../stores/calendarStore.jsx'
import { eventService } from '../../services/eventService.js'
import { formatDate } from '../../utils/dateUtils.js'
import { MONTHS, GROUPS } from '../../utils/constants.js'
import toast from 'react-hot-toast'
import { Share2, Download, CalendarDays, Sparkles, ChevronRight } from 'lucide-react'

export default function PublicCalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { selectedGroups } = useCalendar()
  const navigate = useNavigate()

  useEffect(() => {
    loadEvents()
  }, [selectedGroups])

  async function loadEvents() {
    try {
      setLoading(true)
      const data = await eventService.getAll()
      const filtered = data.filter(ev => {
        const eventGroups = ev.groups || []
        if (eventGroups.length === 0) return true
        return eventGroups.some(g => selectedGroups.includes(g.id))
      })
      setEvents(filtered)
    } catch (err) {
      toast.error('Error cargando calendario')
    } finally {
      setLoading(false)
    }
  }

  const calendarEvents = events.map(ev => {
    const firstGroup = ev.groups?.[0]
    const color = firstGroup?.color || '#94a3b8'
    return {
      id: ev.id,
      title: ev.title,
      start: ev.start_date,
      end: ev.end_date,
      backgroundColor: color,
      borderColor: color,
      textColor: '#fff',
      classNames: ev.is_historical ? ['historical-event'] : [],
      extendedProps: { rawEvent: ev },
    }
  })

  const upcomingEvents = events
    .filter(e => new Date(e.start_date) >= new Date() && e.status === 'programado')
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('¡Enlace copiado al portapapeles!')
  }

  const handleDownload = () => {
    navigate('/login')
    toast('Inicia sesión para descargar reportes', { icon: 'ℹ️' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-8 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-300 text-sm font-medium">
              <Sparkles size={16} />
              <span>Bienvenidos al ministerio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Calendario de Actividades
            </h1>
            <p className="text-slate-300 text-base max-w-lg">
              Descubre todas las actividades, clases, salidas y reuniones de nuestro ministerio juvenil. ¡Te esperamos!
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Share2 size={16} />
              Compartir
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-medium hover:bg-blue-50 transition-all shadow-lg"
            >
              <Download size={16} />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Próximos eventos strip */}
      {upcomingEvents.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">Próximos eventos</h2>
            <span className="text-sm text-slate-400 ml-2">{upcomingEvents.length} programados</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingEvents.map((ev, i) => {
              const firstGroup = ev.groups?.[0]
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="group cursor-pointer bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 text-sm font-bold shadow-sm"
                      style={{ backgroundColor: firstGroup?.color || '#94a3b8' }}
                    >
                      {new Date(ev.start_date).getDate()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(ev.start_date, 'EEEE, d MMM')}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {(ev.groups || []).slice(0, 2).map(g => (
                          <span
                            key={g.id}
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: g.color }}
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-1">
                          {(ev.groups || []).map(g => g.name).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Controles del calendario */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CalendarDays className="text-blue-500" size={20} />
              {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Selecciona los grupos que quieres ver en el calendario
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GroupFilters />
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <EventLegend />
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center space-y-3">
              <Loading size="lg" />
              <p className="text-sm text-slate-400">Cargando actividades...</p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <CalendarView
              events={calendarEvents}
              onEventClick={(info) => {
                const ev = info.extendedProps?.rawEvent
                if (ev) setSelectedEvent(ev)
              }}
            />
          </div>
        )}
      </div>

      {/* Event modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isAdmin={false}
      />
    </div>
  )
}
