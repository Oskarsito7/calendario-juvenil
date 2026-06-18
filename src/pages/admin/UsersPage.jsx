import { useState, useEffect } from 'react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Loading } from '../../components/ui/Loading.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { supabase } from '../../app/supabase.js'
import toast from 'react-hot-toast'
import { Users, Shield, UserX } from 'lucide-react'

export default function UsersPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      toast.error('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  async function updateRole(userId, newRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      if (error) throw error
      toast.success('Rol actualizado')
      loadProfiles()
    } catch (err) {
      toast.error('Error actualizando rol')
    }
  }

  const filtered = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.role?.toLowerCase().includes(filter.toLowerCase())
  )

  const roleBadge = (role) => {
    if (role === 'director') return <Badge variant="primary">Director</Badge>
    if (role === 'subdirector') return <Badge variant="purple">Subdirector</Badge>
    return <Badge variant="default">Joven</Badge>
  }

  if (loading) return <Loading size="lg" className="flex h-64 items-center justify-center" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">Gestión de roles del ministerio</p>
        </div>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-slate-400" />
          <span className="text-sm text-slate-600">{profiles.length} usuarios</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar usuario..."
        className="w-full sm:w-80 px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Rol actual</th>
                <th className="px-4 py-3">Registrado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(profile => (
                <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {profile.full_name?.[0] || 'U'}
                      </div>
                      <span className="font-medium text-slate-800">{profile.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{roleBadge(profile.role)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(profile.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        className="px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                        value={profile.role}
                        onChange={e => updateRole(profile.id, e.target.value)}
                      >
                        <option value="joven">Joven</option>
                        <option value="subdirector">Subdirector</option>
                        <option value="director">Director</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <UserX size={32} className="mx-auto mb-2 text-slate-300" />
            No se encontraron usuarios
          </div>
        )}
      </div>
    </div>
  )
}
