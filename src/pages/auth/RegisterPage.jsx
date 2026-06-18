import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import toast from 'react-hot-toast'
import { UserPlus, CalendarDays, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      setSuccess(true)
      toast.success('Cuenta creada. Revisa tu correo para confirmar.')
    } catch (err) {
      toast.error(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-green-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">¡Cuenta creada!</h2>
        <p className="text-sm text-slate-500 mb-6">
          Revisa tu correo electrónico y confirma tu cuenta para comenzar.
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
          <ArrowLeft size={16} /> Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
          <CalendarDays className="text-white" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Crear cuenta</h2>
        <p className="text-sm text-slate-500 mt-1">Únete al ministerio de jóvenes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full py-2.5" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={18} /> Crear cuenta
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors">
            Inicia sesión <ArrowLeft size={14} />
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
