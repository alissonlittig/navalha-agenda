import { serviceById } from './catalog'
import { addDays } from './time'
import type { Booking } from './types'

const price = (b: Booking) => serviceById(b.serviceId).price
/** Revenue counts completed visits only; confirmed-but-future is "forecast". */
export const revenue = (bs: Booking[]) => bs.filter((b) => b.status === 'done').reduce((s, b) => s + price(b), 0)
export const forecast = (bs: Booking[]) => bs.filter((b) => b.status === 'confirmed').reduce((s, b) => s + price(b), 0)

export function dailyRevenue(bs: Booking[], today: string, days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - days + 1)
    return { date, value: revenue(bs.filter((b) => b.date === date)) }
  })
}

export const range = (bs: Booking[], from: string, to: string) => bs.filter((b) => b.date >= from && b.date <= to)

export function topServices(bs: Booking[]) {
  const m = new Map<string, { count: number; total: number }>()
  for (const b of bs.filter((x) => x.status === 'done')) {
    const e = m.get(b.serviceId) ?? { count: 0, total: 0 }
    e.count++
    e.total += price(b)
    m.set(b.serviceId, e)
  }
  return [...m].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.total - a.total)
}

export const ticket = (bs: Booking[]) => {
  const d = bs.filter((b) => b.status === 'done')
  return d.length ? revenue(d) / d.length : 0
}
