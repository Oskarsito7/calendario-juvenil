import { cn } from '../../utils/colors.js'

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className={cn('w-full text-sm text-left', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }) {
  return (
    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
      <tr>{children}</tr>
    </thead>
  )
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>
}

export function TableRow({ children, className }) {
  return <tr className={cn('hover:bg-slate-50 transition-colors', className)}>{children}</tr>
}

export function TableCell({ children, className }) {
  return <td className={cn('px-4 py-3 text-slate-700', className)}>{children}</td>
}

export function TableHeaderCell({ children, className }) {
  return <th className={cn('px-4 py-3', className)}>{children}</th>
}
