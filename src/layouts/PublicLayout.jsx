import { Outlet, Link, useNavigate } from 'react-router-dom'
import { CalendarDays, LogIn, Heart, Camera, Globe, Mail, User, LogOut, ChevronDown, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function PublicLayout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  const isLoggedIn = !!user

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header moderno con fondo oscuro */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
                <CalendarDays className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                  Calendario Juvenil
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider -mt-0.5">
                  Ministerio de Jóvenes Bethel
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => navigate('/')}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                >
                  Calendario
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => navigate('/perfil')}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    Mi perfil
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-3 py-2 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <Shield size={14} className="inline mr-1" />
                    Admin
                  </button>
                )}
              </nav>
              <div className="h-4 w-px bg-slate-200" />
              
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {profile?.full_name || 'Usuario'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
                        <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/perfil'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <User size={14} /> Mi perfil
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Shield size={14} /> Panel admin
                        </button>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut size={14} /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30"
                >
                  <LogIn size={16} />
                  Acceder
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
              >
                Calendario
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => { navigate('/perfil'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  <User size={16} /> Mi perfil
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  <Shield size={16} /> Panel admin
                </button>
              )}
              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                >
                  <LogIn size={16} /> Acceder al sistema
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer elegante */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <CalendarDays className="text-white" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Calendario Juvenil</p>
                <p className="text-xs text-slate-500">Ministerio de Jóvenes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Heart size={16} className="text-red-400" />
              <span className="text-sm">Hecho con amor para los jóvenes</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Camera size={18} />
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Globe size={18} />
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
