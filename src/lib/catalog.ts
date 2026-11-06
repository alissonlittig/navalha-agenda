import type { Pro, Service } from './types'

export const services: Service[] = [
  { id: 'corte', name: 'Corte clássico', desc: 'Tesoura e máquina, acabamento na navalha.', minutes: 45, price: 70 },
  { id: 'barba', name: 'Barba na toalha quente', desc: 'Toalha quente, óleo e navalha.', minutes: 30, price: 55 },
  { id: 'combo', name: 'Corte + barba', desc: 'O ritual completo, em uma cadeira só.', minutes: 75, price: 115 },
  { id: 'pigmento', name: 'Pigmentação de barba', desc: 'Cobre falhas e realça o desenho.', minutes: 40, price: 60 },
  { id: 'sobrancelha', name: 'Sobrancelha', desc: 'Limpeza e alinhamento na navalha.', minutes: 15, price: 25 },
  { id: 'hidratacao', name: 'Hidratação capilar', desc: 'Máscara nutritiva com massagem.', minutes: 30, price: 50 },
]

export const LUNCH = { start: 12 * 60, end: 13 * 60 }
export const SLOT_STEP = 15

export const pros: Pro[] = [
  { id: 'rafael', name: 'Rafael Mendes', role: 'Barbeiro sênior', initials: 'RM', serviceIds: ['corte', 'barba', 'combo', 'pigmento', 'sobrancelha'], days: [2, 3, 4, 5, 6], start: 9 * 60, end: 19 * 60 },
  { id: 'thiago', name: 'Thiago Alves', role: 'Barbeiro', initials: 'TA', serviceIds: ['corte', 'barba', 'combo', 'sobrancelha'], days: [2, 4, 5, 6], start: 10 * 60, end: 19 * 60 },
  { id: 'bianca', name: 'Bianca Rocha', role: 'Cabeleireira', initials: 'BR', serviceIds: ['corte', 'hidratacao', 'sobrancelha', 'pigmento'], days: [3, 4, 5, 6], start: 9 * 60, end: 18 * 60 },
]

export const serviceById = (id: string) => services.find((s) => s.id === id)!
export const proById = (id: string) => pros.find((p) => p.id === id)!
