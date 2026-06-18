import { useState, useEffect, useCallback } from 'react'
import { useCalendar } from '../../../stores/calendarStore.jsx'
import { eventService, groupService } from '../../../services/eventService.js'
import toast from 'react-hot-toast'

export function useCalendarEvents() {
  const { selectedGroups } = useCalendar()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventService.getAll()
      // Filter by selected groups
      const filtered = data.filter(ev => {
        const eventGroups = ev.groups || []
        if (eventGroups.length === 0) return true
        return eventGroups.some(g => selectedGroups.includes(g.id))
      })
      setEvents(filtered)
    } catch (err) {
      setError(err)
      toast.error('Error cargando eventos')
    } finally {
      setLoading(false)
    }
  }, [selectedGroups])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Format for FullCalendar
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

  return { events: calendarEvents, rawEvents: events, loading, error, refetch: fetchEvents }
}
