import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { useCalendar } from '../../stores/calendarStore.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useCalendarEvents } from '../../modules/calendar/hooks/useCalendarEvents.js'
import CalendarView from '../../modules/calendar/components/CalendarView.jsx'
import EventModal from '../../modules/calendar/components/EventModal.jsx'
import GroupFilters from '../../modules/calendar/components/GroupFilters.jsx'
import EventLegend from '../../modules/calendar/components/EventLegend.jsx'
import { Plus, CalendarDays, Sparkles } from 'lucide-react'

export default function CalendarPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { selectedGroups } = useCalendar()
  const { events, loading, error, refetch } = useCalendarEvents()
  const [selectedEvent, setSelectedEvent] = useState(null)

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center space-y-3">
        <Loading size="lg" />
        <p className="text-sm text-slate-400">Cargando calendario...</p>
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
            <span>Vista administrativa</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Calendario</h1>
          <p className="text-sm text-slate-500">Gestiona las actividades del ministerio</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              onClick={() => navigate('/admin/eventos/nuevo')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
            >
              <Plus size={16} className="mr-2" /> Crear evento
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Filtrar por grupo</h3>
            <p className="text-xs text-slate-500">Selecciona los grupos que quieres ver en el calendario</p>
          </div>
          <GroupFilters />
        </div>
        <div className="h-px bg-slate-100" />
        <EventLegend />
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <CalendarView
            events={events}
            onEventClick={(event) => setSelectedEvent(event.extendedProps.rawEvent)}
          />
        </div>
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}
