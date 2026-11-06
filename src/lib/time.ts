export const pad = (n: number) => String(n).padStart(2, '0')

/** Local date -> "YYYY-MM-DD" (never UTC, so day boundaries match the user's clock). */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const minToHHMM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const weekdayShort = (iso: string) =>
  parseISO(iso).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

export const longDate = (iso: string) =>
  parseISO(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
