import { pros, serviceById } from './catalog'
import { addDays, parseISO } from './time'
import { availableSlots } from './slots'
import type { Booking } from './types'

const NAMES = ['Lucas', 'Mateus', 'Gabriel', 'Henrique', 'Felipe', 'Bruno', 'Caio', 'Diego', 'André', 'Otávio', 'Pedro', 'Vitor', 'Renan', 'Murilo', 'Sérgio', 'Jorge', 'Davi', 'Leandro']
const SURN = ['Souza', 'Lima', 'Prado', 'Nogueira', 'Barros', 'Teixeira', 'Moraes', 'Freitas', 'Campos', 'Rezende', 'Duarte', 'Pires']

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic fake history (30 days back) and near future, anchored to `today`. */
export function seedBookings(today: string, nowMin: number): Booking[] {
  const out: Booking[] = []
  for (let off = -30; off <= 7; off++) {
    const date = addDays(today, off)
    const r = rng(Math.round(parseISO(date).getTime() / 86400000))
    for (const pro of pros) {
      const load = off < 0 ? 0.5 : off === 0 ? 0.28 : 0.2
      for (let i = 0; i < 9; i++) {
        if (r() > load) continue
        const svc = serviceById(pro.serviceIds[Math.floor(r() * pro.serviceIds.length)])
        const slots = availableSlots(pro, svc, date, out)
        if (!slots.length) continue
        const start = slots[Math.floor(r() * slots.length)]
        const past = off < 0 || (off === 0 && start + svc.minutes <= nowMin)
        out.push({
          id: `seed-${date}-${pro.id}-${start}`,
          date,
          start,
          serviceId: svc.id,
          proId: pro.id,
          client: `${NAMES[Math.floor(r() * NAMES.length)]} ${SURN[Math.floor(r() * SURN.length)]}`,
          status: past ? (r() < 0.06 ? 'cancelled' : 'done') : 'confirmed',
        })
      }
    }
  }
  return out
}
