import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import toast from 'react-hot-toast'
import { LogIn, CalendarDays, ArrowRight, Heart } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('¡Bienvenido!')
      window.location.href = '/admin'
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
          <CalendarDays className="text-white" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Bienvenido de vuelta</h2>
        <p className="text-sm text-slate-500 mt-1">Ingresa a tu cuenta para gestionar el ministerio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="focus-within:ring-2 focus-within:ring-blue-500/20"
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full py-2.5" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Entrando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn size={18} /> Iniciar sesión
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors">
            Regístrate <ArrowRight size={14} />
          </Link>
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Heart size={12} className="text-red-400" />
        <span>Ministerio de Jóvenes</span>
      </div>
    </div>
  )
}
