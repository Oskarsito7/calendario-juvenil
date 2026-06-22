import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { eventService } from '../../services/eventService.js'
import { formatDate, getMonthRange } from '../../utils/dateUtils.js'
import { downloadCalendarPdf } from '../../utils/pdfGenerator.js'
import { MONTHS, GROUPS, EVENT_TYPES } from '../../utils/constants.js'
import toast from 'react-hot-toast'
import { FileText, Download, Calendar } from 'lucide-react'

export default function ReportsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('monthly') // 'monthly' | 'calendar'
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [groupId, setGroupId] = useState('')
  const [eventType, setEventType] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }))
  const yearOptions = Array.from({ length: 11 }, (_, i) => ({ value: 2020 + i, label: String(2020 + i) }))
  const groupOptions = [{ value: '', label: 'Todos los grupos' }, ...GROUPS.map(g => ({ value: g.id, label: g.name }))]
  const typeOptions = [{ value: '', label: 'Todos los tipos' }, ...EVENT_TYPES.map(t => ({ value: t.value, label: t.label }))]

  async function generateReport() {
    try {
      setLoading(true)
      const { start, end } = getMonthRange(year, month)
      const filters = {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      }
      if (groupId) filters.group_id = parseInt(groupId)
      if (eventType) filters.event_type = eventType

      const events = await eventService.getAll(filters)
      setPreviewData({ events, month, year, groupId, eventType })
      setShowPreview(true)
    } catch (err) {
      toast.error('Error generando reporte')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!previewData) return
    const { events, month, year } = previewData
    const title = `Reporte ${MONTHS[month - 1]} ${year}`

    let html = `
      <html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1e293b; border-bottom: 3px solid #378ADD; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .realizado { background: #dcfce7; color: #166534; }
        .programado { background: #dbeafe; color: #1e40af; }
        .cancelado { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; }
      </style></head><body>
      <h1>Calendario Juvenil Bethel - ${title}</h1>
      <p><strong>Total actividades:</strong> ${events.length}</p>
      <p><strong>Realizadas:</strong> ${events.filter(e => e.status === 'realizado').length}</p>
      <p><strong>Programadas:</strong> ${events.filter(e => e.status === 'programado').length}</p>
      <table>
        <tr><th>Fecha</th><th>Título</th><th>Grupos</th><th>Tipo</th><th>Lugar</th><th>Estado</th><th>Asistentes</th></tr>
    `

    events.forEach(ev => {
      const groups = (ev.groups || []).map(g => g.name).join(', ')
      html += `<tr>
        <td>${formatDate(ev.start_date)}</td>
        <td>${ev.title}</td>
        <td>${groups}</td>
        <td>${ev.event_type?.replace('_', ' ')}</td>
        <td>${ev.location || '-'}</td>
        <td><span class="badge ${ev.status}">${ev.status}</span></td>
        <td>${ev.attendees_count || '-'}</td>
      </tr>`
    })

    html += `</table>
      <div class="footer">Generado el ${formatDate(new Date())} · Calendario Juvenil Bethel</div>
      </body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${MONTHS[month - 1].toLowerCase()}-${year}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Reporte descargado')
  }

  async function handleDownloadCalendar() {
    try {
      setLoading(true)
      await downloadCalendarPdf(year, month)
      toast.success('Calendario descargado')
    } catch (err) {
      toast.error('Error descargando calendario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-sm text-slate-500">Genera reportes y calendarios</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'monthly' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={16} className="inline mr-1.5" /> Reporte Mensual
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'calendar' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar size={16} className="inline mr-1.5" /> Calendario PDF
        </button>
      </div>

      <Card>
        <CardHeader title="Configuración" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Mes"
            value={month}
            onChange={e => setMonth(parseInt(e.target.value))}
            options={monthOptions}
          />
          <Select
            label="Año"
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            options={yearOptions}
          />
          {activeTab === 'monthly' && (
            <>
              <Select
                label="Grupo"
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                options={groupOptions}
              />
              <Select
                label="Tipo"
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                options={typeOptions}
              />
            </>
          )}
        </div>
        <div className="mt-4">
          <Button onClick={activeTab === 'monthly' ? generateReport : handleDownloadCalendar} disabled={loading}>
            {loading ? <Loading size="sm" /> : <Download size={16} className="mr-2" />}
            {activeTab === 'monthly' ? 'Generar reporte' : 'Descargar calendario'}
          </Button>
        </div>
      </Card>

      {/* Preview */}
      {showPreview && previewData && (
        <Card>
          <CardHeader
            title={`Vista previa: ${MONTHS[previewData.month - 1]} ${previewData.year}`}
            action={
              <Button variant="secondary" onClick={handleDownload}>
                <Download size={16} className="mr-2" /> Descargar HTML
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Grupos</th>
                  <th className="px-4 py-3 text-left">Lugar</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Asistentes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previewData.events.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{formatDate(ev.start_date)}</td>
                    <td className="px-4 py-3 font-medium">{ev.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(ev.groups || []).map(g => (
                          <span key={g.id} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} title={g.name} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{ev.location || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        ev.status === 'realizado' ? 'bg-green-100 text-green-700' :
                        ev.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{ev.attendees_count || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.events.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">No hay actividades para este período</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
