import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '../../components/ui/Table.jsx'
import { eventService, groupService } from '../../services/eventService.js'
import { toISOString } from '../../utils/dateUtils.js'
import { EVENT_TYPES } from '../../utils/constants.js'
import toast from 'react-hot-toast'
import { UploadCloud, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function HistoricalImportPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [activeTab, setActiveTab] = useState('manual') // 'manual' | 'csv'
  const [csvData, setCsvData] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState(null)

  // Manual form state
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    event_type: 'clase_sabatina',
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '11:00',
    location: '',
    group_ids: [],
    attendees_count: 0,
    bible_verse: '',
  })

  useEffect(() => {
    loadGroups()
  }, [])

  async function loadGroups() {
    try {
      const data = await groupService.getAll()
      setGroups(data)
    } catch (err) {
      toast.error('Error cargando grupos')
    }
  }

  const toggleGroup = (id) => {
    setManualForm(prev => ({
      ...prev,
      group_ids: prev.group_ids.includes(id)
        ? prev.group_ids.filter(g => g !== id)
        : [...prev.group_ids, id]
    }))
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualForm.title || !manualForm.start_date || manualForm.group_ids.length === 0) {
      toast.error('Completa los campos obligatorios')
      return
    }

    try {
      const { start_time, end_time, group_ids, ...restForm } = manualForm
      const payload = {
        ...restForm,
        start_date: toISOString(manualForm.start_date, manualForm.start_time),
        end_date: toISOString(manualForm.end_date || manualForm.start_date, manualForm.end_time),
        status: 'realizado',
        is_historical: true,
        attendees_count: parseInt(manualForm.attendees_count || 0) || null,
      }
      await eventService.create(payload, group_ids)
      toast.success('Evento histórico registrado')
      setManualForm({
        title: '', description: '', event_type: 'clase_sabatina',
        start_date: '', end_date: '', start_time: '09:00', end_time: '11:00',
        location: '', group_ids: [], attendees_count: 0, bible_verse: '',
      })
    } catch (err) {
      toast.error(err.message || 'Error guardando evento')
    }
  }

  function handleCsvUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const lines = text.split(/\r?\n/).filter(Boolean)
      if (lines.length < 2) {
        toast.error('El archivo CSV está vacío o no tiene datos')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const expected = ['fecha', 'título', 'descripción', 'grupo', 'tipo_actividad', 'lugar']
      const missing = expected.filter(h => !headers.includes(h))
      if (missing.length > 0) {
        toast.error(`Columnas faltantes: ${missing.join(', ')}`)
        return
      }

      const parsed = lines.slice(1).map((line, i) => {
        const cols = line.split(',').map(c => c.trim())
        const row = {}
        headers.forEach((h, idx) => {
          row[h] = cols[idx] || ''
        })
        return { id: i, ...row, valid: !!row.fecha && !!row.título }
      })

      setCsvData(parsed)
      toast.success(`${parsed.length} registros detectados`)
    }
    reader.readAsText(file)
  }

  async function handleImportCsv() {
    const validRows = csvData.filter(r => r.valid)
    if (validRows.length === 0) {
      toast.error('No hay registros válidos para importar')
      return
    }

    setImporting(true)
    const results = { total: validRows.length, success: 0, errors: [], items: [] }

    for (const row of validRows) {
      try {
        const groupId = groups.find(g =>
          g.name.toLowerCase().includes(row.grupo.toLowerCase()) ||
          row.grupo.toLowerCase().includes(g.name.toLowerCase())
        )?.id

        const eventType = EVENT_TYPES.find(t =>
          t.label.toLowerCase().includes(row.tipo_actividad.toLowerCase()) ||
          row.tipo_actividad.toLowerCase().includes(t.label.toLowerCase())
        )?.value || 'otro'

        const payload = {
          title: row.título,
          description: row.descripción,
          event_type: eventType,
          start_date: toISOString(row.fecha, '09:00'),
          end_date: toISOString(row.fecha, '11:00'),
          location: row.lugar,
          status: 'realizado',
          is_historical: true,
        }

        await eventService.create(payload, groupId ? [groupId] : [])
        results.success++
        results.items.push({ row: row.título, status: 'success' })
      } catch (err) {
        results.errors.push({ row: row.título, error: err.message })
        results.items.push({ row: row.título, status: 'error' })
      }
    }

    setResults(results)
    setImporting(false)
    toast.success(`Importación completada: ${results.success} de ${results.total}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Importar Historial</h1>
        <p className="text-sm text-slate-500">Registra actividades que ocurrieron antes del sistema</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'manual' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={16} className="inline mr-1.5" /> Ingreso Manual
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'csv' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UploadCloud size={16} className="inline mr-1.5" /> Importar CSV
        </button>
      </div>

      {activeTab === 'manual' && (
        <Card>
          <CardHeader title="Registro de evento histórico" />
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Título *"
                value={manualForm.title}
                onChange={e => setManualForm(p => ({ ...p, title: e.target.value }))}
                className="md:col-span-2"
              />
              <Input
                label="Descripción / Tema"
                value={manualForm.description}
                onChange={e => setManualForm(p => ({ ...p, description: e.target.value }))}
                className="md:col-span-2"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Grupos *</label>
                <div className="flex flex-wrap gap-2">
                  {groups.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
                      style={{
                        backgroundColor: manualForm.group_ids.includes(g.id) ? g.color + '15' : '#fff',
                        borderColor: manualForm.group_ids.includes(g.id) ? g.color : '#e2e8f0',
                        color: manualForm.group_ids.includes(g.id) ? g.color : '#64748b',
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Tipo de actividad"
                value={manualForm.event_type}
                onChange={e => setManualForm(p => ({ ...p, event_type: e.target.value }))}
                options={EVENT_TYPES.map(t => ({ value: t.value, label: t.label }))}
              />
              <Input
                label="Fecha *"
                type="date"
                value={manualForm.start_date}
                onChange={e => setManualForm(p => ({ ...p, start_date: e.target.value }))}
              />
              <Input
                label="Hora inicio"
                type="time"
                value={manualForm.start_time}
                onChange={e => setManualForm(p => ({ ...p, start_time: e.target.value }))}
              />
              <Input
                label="Lugar"
                value={manualForm.location}
                onChange={e => setManualForm(p => ({ ...p, location: e.target.value }))}
              />
              <Input
                label="Versículo bíblico"
                value={manualForm.bible_verse}
                onChange={e => setManualForm(p => ({ ...p, bible_verse: e.target.value }))}
              />
              <Input
                label="Asistentes"
                type="number"
                value={manualForm.attendees_count}
                onChange={e => setManualForm(p => ({ ...p, attendees_count: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Guardar evento histórico</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/eventos')}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'csv' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Importar desde CSV" subtitle="Formato: fecha, título, descripción, grupo, tipo_actividad, lugar" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                <UploadCloud size={16} />
                Seleccionar archivo CSV
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvUpload} />
              </label>
              {csvFile && <span className="text-sm text-slate-600">{csvFile.name}</span>}
            </div>

            {csvData.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">{csvData.length} registros detectados</p>
                  <Button onClick={handleImportCsv} disabled={importing}>
                    {importing ? 'Importando...' : <><CheckCircle size={16} className="mr-2" /> Importar</>}
                  </Button>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Título</th>
                        <th className="px-3 py-2">Grupo</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {csvData.map((row, i) => (
                        <tr key={i} className={row.valid ? '' : 'bg-red-50'}>
                          <td className="px-3 py-2">{row.fecha}</td>
                          <td className="px-3 py-2">{row.título}</td>
                          <td className="px-3 py-2">{row.grupo}</td>
                          <td className="px-3 py-2">{row.tipo_actividad}</td>
                          <td className="px-3 py-2">
                            {row.valid ? (
                              <span className="inline-flex items-center text-green-600 text-xs">
                                <CheckCircle size={12} className="mr-1" /> Válido
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600 text-xs">
                                <XCircle size={12} className="mr-1" /> Inválido
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Results */}
          {results && (
            <Card>
              <CardHeader
                title="Resumen de importación"
                subtitle={`${results.success} de ${results.total} importados correctamente`}
              />
              {results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">Errores ({results.errors.length})</span>
                  </div>
                  <ul className="space-y-1">
                    {results.errors.map((err, i) => (
                      <li key={i} className="text-xs text-red-600">{err.row}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                    <tr><th className="px-3 py-2">Registro</th><th className="px-3 py-2">Estado</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {results.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.row}</td>
                        <td className="px-3 py-2">
                          {item.status === 'success' ? (
                            <span className="inline-flex items-center text-green-600 text-xs"><CheckCircle size={12} className="mr-1" /> Importado</span>
                          ) : (
                            <span className="inline-flex items-center text-red-600 text-xs"><XCircle size={12} className="mr-1" /> Error</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
