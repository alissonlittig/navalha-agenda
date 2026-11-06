<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAgenda } from '@/stores/agenda'
import { proById, serviceById } from '@/lib/catalog'
import { brl, longDate, minToHHMM, pad } from '@/lib/time'

const store = useAgenda()
const b = computed(() => store.find(String(useRoute().params.id)))
const svc = computed(() => (b.value ? serviceById(b.value.serviceId) : null))

/** Minimal .ics so the visit lands in the client's calendar. Floating local time, no timezone. */
function ics() {
  if (!b.value || !svc.value) return
  const stamp = (m: number) => `${b.value!.date.replaceAll('-', '')}T${pad(Math.floor(m / 60))}${pad(m % 60)}00`
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Navalha & Co.//demo//PT', 'BEGIN:VEVENT',
    `UID:${b.value.id}@navalha-demo`, `DTSTAMP:${stamp(0)}`,
    `DTSTART:${stamp(b.value.start)}`, `DTEND:${stamp(b.value.start + svc.value.minutes)}`,
    `SUMMARY:${svc.value.name} — Navalha & Co.`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
  a.download = 'navalha-agendamento.ics'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div class="wrap narrow">
    <article v-if="b && svc" class="ticket">
      <svg class="ticket__ok" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5" /><path d="m14 25 7 7 14-16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <p class="eyebrow">Agendamento confirmado</p>
      <h1>Te esperamos, {{ b.client.split(' ')[0] }}.</h1>
      <dl class="ticket__dl">
        <div><dt>Quando</dt><dd>{{ longDate(b.date) }}, {{ minToHHMM(b.start) }}</dd></div>
        <div><dt>Serviço</dt><dd>{{ svc.name }} · {{ svc.minutes }} min</dd></div>
        <div><dt>Profissional</dt><dd>{{ proById(b.proId).name }}</dd></div>
        <div><dt>Valor</dt><dd>{{ brl(svc.price) }} · pague na barbearia</dd></div>
      </dl>
      <p class="muted small">Rua das Camélias, 128 — Centro, Curitiba (endereço fictício).</p>
      <div class="actions">
        <button type="button" class="btn btn--ghost" @click="ics">Adicionar ao calendário</button>
        <RouterLink class="btn" to="/painel">Ver no painel do dono</RouterLink>
      </div>
    </article>
    <article v-else class="ticket">
      <h1>Agendamento não encontrado</h1>
      <p class="muted">Ele pode ter sido apagado ao reiniciar a demonstração.</p>
      <div class="actions"><RouterLink class="btn" to="/">Agendar um horário</RouterLink></div>
    </article>
  </div>
</template>
