import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { eventService } from '../../services/eventService.js'
import { formatDate, formatDateTime } from '../../utils/dateUtils.js'
import toast from 'react-hot-toast'
import {
  User, Mail, Shield, CalendarDays, ArrowRight, LogOut,
  Sparkles, Clock, CheckCircle, Users, BookOpen, MapPin
} from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadUpcomingEvents()
  }, [user])

  async function loadUpcomingEvents() {
    try {
      setLoading(true)
      const events = await eventService.getUpcoming(5)
      setUpcomingEvents(events)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    navigate('/')
  }

  if (!user) return null

  const roleLabels = {
    director: 'Director de Jóvenes',
    subdirector: 'Subdirector de Jóvenes',
    joven: 'Joven del Ministerio',
  }

  const roleColors = {
    director: 'bg-blue-100 text-blue-700',
    subdirector: 'bg-purple-100 text-purple-700',
    joven: 'bg-emerald-100 text-emerald-700',
  }

  const roleIcons = {
    director: Shield,
    subdirector: Shield,
    joven: User,
  }

  const RoleIcon = roleIcons[profile?.role] || User

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Hero del perfil */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl text-3xl font-bold">
            {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile?.full_name || 'Usuario'}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[profile?.role] || 'bg-slate-100 text-slate-700'}`}>
                <RoleIcon size={12} />
                {roleLabels[profile?.role] || profile?.role}
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-sm">
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
              >
                <Shield size={16} className="mr-2" /> Panel admin
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
            >
              <LogOut size={16} className="mr-2" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Próximos eventos */}
      <Card>
        <CardHeader
          title="Próximas actividades"
          subtitle="Eventos programados para ti"
          action={
            <Button variant="ghost" onClick={() => navigate('/')}>
              Ver calendario <ArrowRight size={16} className="ml-1" />
            </Button>
          }
        />
        {loading ? (
          <div className="flex py-8 items-center justify-center">
            <Loading size="md" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No hay eventos programados próximamente</p>
            <Button variant="link" onClick={() => navigate('/')} className="mt-2">
              Explorar calendario
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(ev => {
              const firstGroup = ev.groups?.[0]
              return (
                <Link
                  key={ev.id}
                  to={`/evento/${ev.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                    style={{ backgroundColor: firstGroup?.color || '#94a3b8' }}
                  >
                    {new Date(ev.start_date).getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {ev.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(ev.start_date)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {ev.location}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {(ev.groups || []).map(g => (
                        <span
                          key={g.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            backgroundColor: g.color + '18',
                            color: g.color,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: g.color }} />
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      {/* Info del ministerio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <CalendarDays size={20} className="text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Actividades</p>
          <p className="text-xs text-slate-500 mt-1">Clases, salidas, reuniones</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Comunidad</p>
          <p className="text-xs text-slate-500 mt-1">Conecta con otros jóvenes</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={20} className="text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Crecimiento</p>
          <p className="text-xs text-slate-500 mt-1">Fe y aprendizaje</p>
        </div>
      </div>
    </div>
  )
}
