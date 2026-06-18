import { useRoutes, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

import AdminLayout from '../layouts/AdminLayout.jsx'
import PublicLayout from '../layouts/PublicLayout.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'

import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'

import PublicCalendarPage from '../pages/public/PublicCalendarPage.jsx'
import EventDetailPage from '../pages/public/EventDetailPage.jsx'

import DashboardPage from '../pages/admin/DashboardPage.jsx'
import CalendarPage from '../pages/admin/CalendarPage.jsx'
import EventsPage from '../pages/admin/EventsPage.jsx'
import EventCreatePage from '../pages/admin/EventCreatePage.jsx'
import EventEditPage from '../pages/admin/EventEditPage.jsx'
import ReportsPage from '../pages/admin/ReportsPage.jsx'
import GalleryPage from '../pages/admin/GalleryPage.jsx'
import HistoricalImportPage from '../pages/admin/HistoricalImportPage.jsx'
import UsersPage from '../pages/admin/UsersPage.jsx'

function RequireAdmin({ children }) {
  const { user, isLoading, isAdmin } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function AppRouter() {
  return useRoutes([
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        { index: true, element: <PublicCalendarPage /> },
        { path: 'evento/:id', element: <EventDetailPage /> },
      ],
    },
    {
      path: '/login',
      element: <AuthLayout />,
      children: [{ index: true, element: <LoginPage /> }],
    },
    {
      path: '/registro',
      element: <AuthLayout />,
      children: [{ index: true, element: <RegisterPage /> }],
    },
    {
      path: '/admin',
      element: <RequireAdmin><AdminLayout /></RequireAdmin>,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'calendario', element: <CalendarPage /> },
        { path: 'eventos', element: <EventsPage /> },
        { path: 'eventos/nuevo', element: <EventCreatePage /> },
        { path: 'eventos/:id/editar', element: <EventEditPage /> },
        { path: 'reportes', element: <ReportsPage /> },
        { path: 'galeria', element: <GalleryPage /> },
        { path: 'importar', element: <HistoricalImportPage /> },
        { path: 'usuarios', element: <UsersPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ])
}
