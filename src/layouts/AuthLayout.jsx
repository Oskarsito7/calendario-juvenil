import { Outlet } from 'react-router-dom'
import { CalendarDays, Heart } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
            <CalendarDays className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Calendario Juvenil</h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Gestiona las actividades del ministerio de jóvenes con un sistema moderno y fácil de usar.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Heart size={14} className="text-red-400" />
            <span>Hecho con amor para los jóvenes</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
              <CalendarDays className="text-white" size={28} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Calendario Juvenil</h1>
            <p className="text-sm text-slate-500 mt-1">Ministerio de Jóvenes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-7 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
