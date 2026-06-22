import { eventService } from '../services/eventService.js'
import { formatDate } from './dateUtils.js'
import { MONTHS, GROUPS } from './constants.js'
import { getMonthRange } from './dateUtils.js'

/**
 * Genera y descarga un calendario HTML mensual con los eventos del ministerio.
 * Puede usarse tanto desde el panel admin como desde el calendario público.
 */
export async function downloadCalendarPdf(year, month) {
  const { start, end } = getMonthRange(year, month)
  const events = await eventService.getAll({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  })

  const title = `Calendario ${MONTHS[month - 1]} ${year}`
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  let html = `
    <html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      @page { margin: 15mm; size: A4 landscape; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1e293b; background: #fff; }
      .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #378ADD; padding-bottom: 15px; }
      .header h1 { color: #1e293b; margin: 0; font-size: 22px; }
      .header h2 { color: #64748b; margin: 5px 0 0; font-size: 16px; font-weight: 500; }
      .logo { font-size: 28px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th { background: #f1f5f9; padding: 8px; text-align: center; font-size: 11px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0; text-transform: uppercase; }
      td { width: 14.28%; height: 90px; vertical-align: top; padding: 6px; border: 1px solid #e2e8f0; font-size: 10px; overflow: hidden; }
      .day-num { font-weight: 700; color: #334155; margin-bottom: 4px; font-size: 12px; }
      .day-today { background: #eff6ff; }
      .day-today .day-num { color: #2563eb; }
      .event { padding: 2px 5px; border-radius: 4px; margin-bottom: 2px; font-size: 9px; color: white; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
      .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; }
      .legend { display: flex; gap: 16px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
      .legend-item { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 500; color: #475569; }
      .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
      .weekend { background: #f8fafc; }
    </style></head><body>
    <div class="header">
      <div class="logo">✝️</div>
      <h1>Calendario Juvenil Bethel</h1>
      <h2>${MONTHS[month - 1]} ${year}</h2>
    </div>
    <table>
      <tr><th>Dom</th><th>Lun</th><th>Mar</th><th>Mié</th><th>Jue</th><th>Vie</th><th>Sáb</th></tr>
      <tr>
  `

  let day = 1
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  for (let i = 0; i < 42; i++) {
    if (i < firstDay || day > daysInMonth) {
      html += '<td></td>'
    } else {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = dateStr === todayStr
      const isWeekend = (i % 7 === 0) || ((i + 1) % 7 === 0)
      const dayEvents = events.filter(e => {
        if (!e.start_date) return false
        const d = new Date(e.start_date)
        const evYear = d.getFullYear()
        const evMonth = String(d.getMonth() + 1).padStart(2, '0')
        const evDay = String(d.getDate()).padStart(2, '0')
        return `${evYear}-${evMonth}-${evDay}` === dateStr
      })

      html += `<td class="${isToday ? 'day-today' : ''} ${isWeekend ? 'weekend' : ''}"><div class="day-num">${day}</div>`
      dayEvents.forEach(ev => {
        const color = ev.groups?.[0]?.color || '#94a3b8'
        html += `<div class="event" style="background:${color}">${ev.title}</div>`
      })
      html += '</td>'
      day++
    }
    if ((i + 1) % 7 === 0 && i < 41) html += '</tr><tr>'
  }

  html += `</tr></table>
    <div class="legend">
      ${GROUPS.map(g => `<div class="legend-item"><span class="legend-dot" style="background:${g.color}"></span>${g.name}</div>`).join('')}
    </div>
    <div class="footer">Calendario Juvenil Bethel · Ministerio de Jóvenes · Generado ${formatDate(new Date())}</div>
    </body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `calendario-${MONTHS[month - 1].toLowerCase()}-${year}.html`
  a.click()
  URL.revokeObjectURL(url)
}
