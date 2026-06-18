import { createContext, useContext, useState } from 'react'

const CalendarContext = createContext(null)

export function CalendarProvider({ children }) {
  const [selectedGroups, setSelectedGroups] = useState([1, 2, 3, 4])
  const [viewMode, setViewMode] = useState('dayGridMonth')
  const [currentDate, setCurrentDate] = useState(new Date())

  const toggleGroup = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const selectAllGroups = () => setSelectedGroups([1, 2, 3, 4])
  const clearGroups = () => setSelectedGroups([])

  return (
    <CalendarContext.Provider value={{
      selectedGroups, toggleGroup, selectAllGroups, clearGroups,
      viewMode, setViewMode,
      currentDate, setCurrentDate,
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) throw new Error('useCalendar must be used within CalendarProvider')
  return context
}
