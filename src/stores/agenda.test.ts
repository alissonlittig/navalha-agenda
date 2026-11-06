import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAgenda } from './agenda'
import { pros, serviceById } from '@/lib/catalog'
import { availableSlots } from '@/lib/slots'
import { addDays } from '@/lib/time'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('agenda store', () => {
  it('a booked slot disappears from availability and can be cancelled back', () => {
    const s = useAgenda()
    const svc = serviceById('corte')
    const date = [2, 3, 4, 5, 6].map((n) => addDays(s.today, n)).find((d) => pros.some((p) => availableSlots(p, svc, d, s.all).length))!
    const pro = pros.find((p) => availableSlots(p, svc, date, s.all).length)!
    const start = availableSlots(pro, svc, date, s.all)[0]
    const b = s.book({ date, start, serviceId: svc.id, proId: pro.id, client: 'Teste' })
    expect(s.find(b.id)?.status).toBe('confirmed')
    expect(availableSlots(pro, svc, date, s.all)).not.toContain(start)
    s.setStatus(b.id, 'cancelled')
    expect(availableSlots(pro, svc, date, s.all)).toContain(start)
  })

  it('persists user bookings and reset clears them', () => {
    const s = useAgenda()
    s.book({ date: s.today, start: 18 * 60, serviceId: 'barba', proId: 'rafael', client: 'A' })
    return Promise.resolve().then(() => {
      expect(JSON.parse(localStorage.getItem('navalha-agenda:v1')!).user).toHaveLength(1)
      s.reset()
      expect(s.all.some((b) => b.client === 'A')).toBe(false)
    })
  })
})
