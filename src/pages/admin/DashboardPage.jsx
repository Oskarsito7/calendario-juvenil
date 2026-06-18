import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { eventService, dashboardService } from '../../services/eventService.js'
import { formatDate, formatDateTime } from '../../utils/dateUtils.js'
import { GROUPS, MONTHS } from '../../utils/constants.js'
import { cn } from '../../utils/colors.js'
import toast from 'react-hot-toast'
import {
  CalendarPlus, FileText, Image, UploadCloud, TrendingUp,
  CheckCircle, Clock, XCircle, AlertCircle, ChevronRight,
  BarChart3, Sparkles, Camera, CalendarDays, ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const { isAdmin, isDirector } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [missingPhotos, setMissingPhotos] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const [statsData, upcomingData, missingData, monthly] = await Promise.all([
        dashboardService.getStats(currentMonth, currentYear),
        eventService.getUpcoming(5),
        eventService.getMissingPhotos(),
        dashboardService.getMonthlyActivities(currentYear),
      ])
      setStats(statsData)
      setUpcoming(upcomingData)
      setMissingPhotos(missingData)
      setMonthlyData(monthly)
    } catch (err) {
      toast.error('Error cargando dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total actividades', value: stats?.total || 0, icon: BarChart3, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Realizadas', value: stats?.realizados || 0, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'Programadas', value: stats?.programados || 0, icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' },
    { label: 'Canceladas', value: stats?.cancelados || 0, icon: XCircle, gradient: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' },
  ]

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center space-y-3">
        <Loading size="lg" />
        <p className="text-sm text-slate-400">Cargando dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-1">
            <Sparkles size={14} />
            <span>Panel de administración</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">{MONTHS[currentMonth - 1]} {currentYear}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/eventos/nuevo')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
        >
          <CalendarPlus size={16} className="mr-2" /> Crear evento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                <stat.icon size={22} className={stat.text} />
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', stat.gradient)}
                style={{ width: `${Math.min((stat.value / Math.max(stats?.total || 1, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Group Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="text-base font-semibold text-slate-800">Actividades por grupo</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GROUPS.map(group => {
            const count = stats?.byGroup?.[group.name] || 0
            const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0
            return (
              <div
                key={group.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                  style={{ backgroundColor: group.color }}
                >
                  {group.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{group.name}</p>
                  <p className="text-xs text-slate-500">{count} actividades · {pct}%</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-6 shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-2 text-white mb-4">
          <TrendingUp size={18} className="text-blue-300" />
          <h3 className="text-base font-semibold">Accesos rápidos</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: CalendarPlus, label: 'Crear evento', color: 'bg-blue-500', path: '/admin/eventos/nuevo' },
            { icon: FileText, label: 'Reporte', color: 'bg-emerald-500', path: '/admin/reportes' },
            { icon: Camera, label: 'Subir fotos', color: 'bg-pink-500', path: '/admin/galeria' },
            { icon: UploadCloud, label: 'Importar', color: 'bg-amber-500', path: '/admin/importar' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all group"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg', action.color)}>
                <action.icon size={18} />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
              <ArrowRight size={14} className="text-white/50 group-hover:text-white/80 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-blue-500" />
              <h3 className="text-base font-semibold text-slate-800">Próximos eventos</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{upcoming.length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 && (
              <div className="text-center py-8">
                <CalendarDays size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No hay eventos programados</p>
              </div>
            )}
            {upcoming.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/admin/eventos/${event.id}/editar`)}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                  style={{ backgroundColor: event.groups?.[0]?.color || '#94a3b8' }}
                >
                  {new Date(event.start_date).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(event.start_date)} · {event.location}
                  </p>
                </div>
                <Badge variant="primary" className="text-[10px]">Programado</Badge>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Missing Photos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-amber-500" />
              <h3 className="text-base font-semibold text-slate-800">Pendientes de documentar</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{missingPhotos.length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {missingPhotos.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-emerald-200 mx-auto mb-2" />
                <p className="text-sm text-emerald-600 font-medium">¡Todo documentado!</p>
                <p className="text-xs text-slate-400 mt-1">Todos los eventos tienen fotos</p>
              </div>
            )}
            {missingPhotos.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/admin/eventos/${event.id}/editar`)}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{event.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(event.start_date)}</p>
                </div>
                <Badge variant="warning" className="text-[10px]">Sin fotos</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="text-base font-semibold text-slate-800">Actividades realizadas</h3>
          <span className="text-sm text-slate-400">{currentYear}</span>
        </div>
        <div className="h-56 flex items-end gap-2 px-2">
          {monthlyData.map((count, i) => {
            const max = Math.max(...monthlyData, 1)
            const height = max > 0 ? (count / max) * 100 : 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full max-w-[56px] flex items-end justify-center h-44">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-500 shadow-sm group-hover:shadow-md"
                    style={{ height: `${height}%`, minHeight: count > 0 ? 4 : 0 }}
                  />
                  {count > 0 && (
                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {count}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-medium uppercase">
                  {MONTHS[i].slice(0, 3)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
