import { useCalendar } from '../../../stores/calendarStore.jsx'
import { GROUPS } from '../../../utils/constants.js'
import { Check, Filter } from 'lucide-react'

export default function GroupFilters() {
  const { selectedGroups, toggleGroup, selectAllGroups, clearGroups } = useCalendar()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {GROUPS.map(group => {
        const isActive = selectedGroups.includes(group.id)
        return (
          <button
            key={group.id}
            onClick={() => toggleGroup(group.id)}
            className="relative flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border select-none"
            style={{
              backgroundColor: isActive ? group.color + '18' : '#ffffff',
              borderColor: isActive ? group.color + '50' : '#e2e8f0',
              color: isActive ? group.color : '#94a3b8',
              boxShadow: isActive ? `0 2px 8px ${group.color}25` : '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = group.color + '40'
                e.currentTarget.style.color = group.color + 'cc'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.color = '#94a3b8'
              }
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
              style={{
                backgroundColor: group.color,
                opacity: isActive ? 1 : 0.35,
                transition: 'opacity 0.2s',
              }}
            />
            {isActive && (
              <Check size={12} strokeWidth={3} className="absolute right-1 top-1" style={{ color: group.color }} />
            )}
            <span className="truncate">{group.name}</span>
          </button>
        )
      })}
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={selectAllGroups}
          className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          Todos
        </button>
        <button
          onClick={clearGroups}
          className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          Ninguno
        </button>
      </div>
    </div>
  )
}
