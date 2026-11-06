import { describe, expect, it } from 'vitest'
import { availableSlots } from './slots'
import { pros, serviceById } from './catalog'
import { seedBookings } from './seed'
import { dailyRevenue, revenue, ticket } from './stats'
import { addDays, minToHHMM, toISO } from './time'
import type { Booking } from './types'

const rafael = pros[0]
const TUE = '2026-11-10' // Tuesday
const SUN = '2026-11-08'
const bk = (start: number, status: Booking['status'] = 'confirmed'): Booking => ({
  id: `x${start}`, date: TUE, start, serviceId: 'corte', proId: 'rafael', client: 'T', status,
})

describe('availableSlots', () => {
  it('opens at 09:00 and respects the lunch break', () => {
    const s = availableSlots(rafael, serviceById('corte'), TUE, [])
    expect(minToHHMM(s[0])).toBe('09:00')
    expect(s).not.toContain(12 * 60)
    expect(s).not.toContain(11 * 60 + 30) // 45 min would run into lunch
    expect(minToHHMM(s[s.length - 1])).toBe('18:15')
  })
  it('returns nothing on days the pro does not work', () => {
    expect(availableSlots(rafael, serviceById('corte'), SUN, [])).toEqual([])
  })
  it('blocks overlapping bookings but frees cancelled ones', () => {
    const busy = availableSlots(rafael, serviceById('barba'), TUE, [bk(600)])
    expect(busy).not.toContain(600)
    expect(busy).not.toContain(615)
    expect(busy).toContain(600 + 45)
    expect(busy).toContain(570)
    expect(availableSlots(rafael, serviceById('barba'), TUE, [bk(600, 'cancelled')])).toContain(600)
  })
  it('requires 30 min notice today', () => {
    const s = availableSlots(rafael, serviceById('corte'), TUE, [], 10 * 60)
    expect(minToHHMM(s[0])).toBe('10:30')
  })
  it('refuses services the pro does not offer', () => {
    expect(availableSlots(rafael, serviceById('hidratacao'), TUE, [])).toEqual([])
  })
})

describe('seed + stats', () => {
  const today = toISO(new Date(2026, 10, 6))
  const a = seedBookings(today, 600)
  it('is deterministic', () => expect(seedBookings(today, 600)).toEqual(a))
  it('never double-books a professional', () => {
    const live = a.filter((b) => b.status !== 'cancelled')
    for (const x of live)
      for (const y of live) {
        if (x === y || x.proId !== y.proId || x.date !== y.date) continue
        const xe = x.start + serviceById(x.serviceId).minutes
        const ye = y.start + serviceById(y.serviceId).minutes
        expect(x.start < ye && y.start < xe).toBe(false)
      }
  })
  it('sums only completed visits', () => {
    expect(revenue([{ ...bk(600), status: 'done' }, bk(700), bk(800, 'cancelled')])).toBe(70)
    expect(ticket([])).toBe(0)
  })
  it('daily series has one point per day ending today', () => {
    const d = dailyRevenue(a, today, 14)
    expect(d).toHaveLength(14)
    expect(d[13].date).toBe(today)
    expect(d[0].date).toBe(addDays(today, -13))
  })
})
