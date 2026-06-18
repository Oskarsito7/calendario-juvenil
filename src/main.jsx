import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './modules/auth/context/AuthContext.jsx'
import { CalendarProvider } from './stores/calendarStore.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <App />
          <Toaster position="top-right" />
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
