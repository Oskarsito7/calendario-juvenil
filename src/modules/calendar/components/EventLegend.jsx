import { GROUPS } from '../../../utils/constants.js'

export default function EventLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grupos</span>
      <div className="flex flex-wrap items-center gap-3">
        {GROUPS.map(group => (
          <div key={group.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shadow-sm"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-xs font-medium text-slate-600">{group.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-1">
          <span className="w-3 h-3 rounded-sm border border-dashed border-slate-400 opacity-50 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">Histórico</span>
        </div>
      </div>
    </div>
  )
}
