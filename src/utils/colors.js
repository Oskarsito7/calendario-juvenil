export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const GROUP_COLORS = {
  'Escuela Juvenil': '#378ADD',
  'Clase de Jóvenes': '#639922',
  'Grupo Pequeño': '#7F77DD',
  'Grupo Chevron': '#BA7517',
}

export const GROUP_BG_COLORS = {
  'Escuela Juvenil': 'bg-[#378ADD]',
  'Clase de Jóvenes': 'bg-[#639922]',
  'Grupo Pequeño': 'bg-[#7F77DD]',
  'Grupo Chevron': 'bg-[#BA7517]',
}

export const GROUP_TEXT_COLORS = {
  'Escuela Juvenil': 'text-[#378ADD]',
  'Clase de Jóvenes': 'text-[#639922]',
  'Grupo Pequeño': 'text-[#7F77DD]',
  'Grupo Chevron': 'text-[#BA7517]',
}
