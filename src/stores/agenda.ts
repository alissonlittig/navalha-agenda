import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { seedBookings } from '@/lib/seed'
import { toISO } from '@/lib/time'
import type { Booking, Status } from '@/lib/types'

const KEY = 'navalha-agenda:v1'

interface Saved {
  user: Booking[]
  overrides: Record<string, Status>
}

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '')
    if (raw && Array.isArray(raw.user) && raw.overrides) return raw
  } catch {
    /* first visit or corrupted storage: start clean */
  }
  return { user: [], overrides: {} }
}

export const useAgenda = defineStore('agenda', () => {
  const clock = new Date()
  const today = toISO(clock)
  const nowMin = clock.getHours() * 60 + clock.getMinutes()
  const saved = load()
  const user = ref<Booking[]>(saved.user)
  const overrides = ref<Record<string, Status>>(saved.overrides)
  const seed = seedBookings(today, nowMin)

  const all = computed<Booking[]>(() => [
    ...seed.map((b) => ({ ...b, status: overrides.value[b.id] ?? b.status })),
    ...user.value.map((b) => ({ ...b, status: overrides.value[b.id] ?? b.status })),
  ])

  watch([user, overrides], () => localStorage.setItem(KEY, JSON.stringify({ user: user.value, overrides: overrides.value })), { deep: true })

  function book(b: Omit<Booking, 'id' | 'status'>): Booking {
    const created: Booking = { ...b, id: `u-${Date.now().toString(36)}`, status: 'confirmed' }
    user.value.push(created)
    return created
  }
  const setStatus = (id: string, status: Status) => (overrides.value = { ...overrides.value, [id]: status })
  const find = (id: string) => all.value.find((b) => b.id === id)
  function reset() {
    user.value = []
    overrides.value = {}
  }

  return { today, nowMin, all, book, setStatus, find, reset }
})
