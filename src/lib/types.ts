export interface Service {
  id: string
  name: string
  desc: string
  minutes: number
  price: number
}
export interface Pro {
  id: string
  name: string
  role: string
  initials: string
  serviceIds: string[]
  /** 0 = Sunday … 6 = Saturday */
  days: number[]
  start: number
  end: number
}
export type Status = 'confirmed' | 'done' | 'cancelled'
export interface Booking {
  id: string
  date: string
  start: number
  serviceId: string
  proId: string
  client: string
  status: Status
}
