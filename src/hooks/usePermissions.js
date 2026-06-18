import { useState, useEffect } from 'react'
import { useAuth } from '../modules/auth/context/AuthContext.jsx'

export function usePermissions() {
  const { profile, isAdmin, isDirector } = useAuth()

  const canEditEvents = isAdmin
  const canDeleteEvents = isDirector
  const canManageUsers = isDirector
  const canAccessAdmin = isAdmin
  const canUploadPhotos = isAdmin
  const canGenerateReports = isAdmin
  const canImportHistorical = isAdmin

  return {
    canEditEvents,
    canDeleteEvents,
    canManageUsers,
    canAccessAdmin,
    canUploadPhotos,
    canGenerateReports,
    canImportHistorical,
    role: profile?.role,
  }
}

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
