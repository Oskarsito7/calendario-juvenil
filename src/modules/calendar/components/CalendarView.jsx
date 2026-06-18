import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'

export default function CalendarView({ events, onEventClick, onDateSelect, initialView }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const defaultView = initialView || (isMobile ? 'listMonth' : 'dayGridMonth')

  return (
    <div className="fc-theme-standard">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={defaultView}
        locale={esLocale}
        firstDay={0}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: isMobile ? 'listMonth' : 'dayGridMonth,timeGridWeek,listMonth',
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          list: 'Agenda',
        }}
        events={events}
        eventClick={(info) => {
          info.jsEvent.preventDefault()
          onEventClick?.(info.event)
        }}
        dateClick={(info) => onDateSelect?.(info.date)}
        height="auto"
        aspectRatio={isMobile ? 0.8 : 1.6}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        allDayText="Todo el día"
        noEventsText="No hay actividades"
      />
    </div>
  )
}
