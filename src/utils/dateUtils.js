import { format, parseISO, isSameDay, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date, fmt = 'dd/MM/yyyy') {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: es })
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMMM 'a las' HH:mm", { locale: es })
}

export function formatTime(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function getMonthRange(year, month) {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(start)
  return { start, end }
}

export function getWeekRange(date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return { start, end }
}

export function isSameDate(a, b) {
  return isSameDay(
    typeof a === 'string' ? parseISO(a) : a,
    typeof b === 'string' ? parseISO(b) : b,
  )
}

export function isDateToday(date) {
  return isToday(typeof date === 'string' ? parseISO(date) : date)
}

export function toISOString(date, time = '00:00') {
  if (!date) return null
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const d = new Date(year, month - 1, day, hour, minute, 0, 0)
  return d.toISOString()
}

export function extractDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function extractTime(isoString) {
  if (!isoString) return '00:00'
  const d = new Date(isoString)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
