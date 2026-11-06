import { LUNCH, SLOT_STEP, serviceById } from './catalog'
import type { Booking, Pro, Service } from './types'
import { parseISO } from './time'

export const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd

export const worksOn = (pro: Pro, date: string) => pro.days.includes(parseISO(date).getDay())

/**
 * Free start times (minutes since midnight) for a pro on a date.
 * `nowMin` only applies when the date is today: pass minutes since midnight, or null for a future date.
 */
export function availableSlots(
  pro: Pro,
  service: Service,
  date: string,
  bookings: Booking[],
  nowMin: number | null = null,
): number[] {
  if (!worksOn(pro, date) || !pro.serviceIds.includes(service.id)) return []
  const busy = bookings
    .filter((b) => b.proId === pro.id && b.date === date && b.status !== 'cancelled')
    .map((b) => [b.start, b.start + serviceById(b.serviceId).minutes] as const)
  const out: number[] = []
  for (let t = pro.start; t + service.minutes <= pro.end; t += SLOT_STEP) {
    const end = t + service.minutes
    if (nowMin !== null && t < nowMin + 30) continue // 30 min notice
    if (overlaps(t, end, LUNCH.start, LUNCH.end)) continue
    if (busy.some(([s, e]) => overlaps(t, end, s, e))) continue
    out.push(t)
  }
  return out
}
