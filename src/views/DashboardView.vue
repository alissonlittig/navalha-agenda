<script setup lang="ts">
import { computed, ref } from 'vue'
import RevenueChart from '@/components/RevenueChart.vue'
import { useAgenda } from '@/stores/agenda'
import { proById, pros, serviceById } from '@/lib/catalog'
import { dailyRevenue, forecast, range, revenue, ticket, topServices } from '@/lib/stats'
import { addDays, brl, longDate, minToHHMM } from '@/lib/time'
import type { Status } from '@/lib/types'

const store = useAgenda()
const day = ref(store.today)
const proFilter = ref('all')

const dayList = computed(() =>
  store.all
    .filter((b) => b.date === day.value && (proFilter.value === 'all' || b.proId === proFilter.value))
    .sort((a, b) => a.start - b.start),
)
const live = computed(() => dayList.value.filter((b) => b.status !== 'cancelled'))
const last7 = computed(() => range(store.all, addDays(store.today, -6), store.today))
const last30 = computed(() => range(store.all, addDays(store.today, -29), store.today))
const chart = computed(() => dailyRevenue(store.all, store.today, 14))
const top = computed(() => topServices(last30.value).slice(0, 5))
const topMax = computed(() => Math.max(1, ...top.value.map((t) => t.total)))
const todayAll = computed(() => store.all.filter((b) => b.date === store.today))

const kpis = computed(() => [
  { label: 'Faturado hoje', value: brl(revenue(todayAll.value)), hint: `${brl(forecast(todayAll.value))} ainda por vir` },
  { label: 'Últimos 7 dias', value: brl(revenue(last7.value)), hint: `${last7.value.filter((b) => b.status === 'done').length} atendimentos` },
  { label: 'Últimos 30 dias', value: brl(revenue(last30.value)), hint: `${last30.value.filter((b) => b.status === 'cancelled').length} cancelamentos` },
  { label: 'Ticket médio', value: brl(ticket(last30.value)), hint: 'por atendimento' },
])

const label: Record<Status, string> = { confirmed: 'Confirmado', done: 'Concluído', cancelled: 'Cancelado' }
const isToday = computed(() => day.value === store.today)
</script>

<template>
  <div class="wrap dash">
    <header class="dash__head">
      <div>
        <p class="eyebrow">Painel do dono</p>
        <h1>Como está o movimento.</h1>
      </div>
      <button type="button" class="btn btn--ghost" @click="store.reset()">Reiniciar demonstração</button>
    </header>

    <section aria-label="Indicadores" class="kpis">
      <article v-for="k in kpis" :key="k.label" class="kpi">
        <p class="kpi__l">{{ k.label }}</p>
        <p class="kpi__v">{{ k.value }}</p>
        <p class="kpi__h">{{ k.hint }}</p>
      </article>
    </section>

    <div class="dash__grid">
      <section class="card agenda" aria-labelledby="h-ag">
        <div class="card__head">
          <h2 id="h-ag">Agenda do dia</h2>
          <div class="daynav">
            <button type="button" class="icon" aria-label="Dia anterior" @click="day = addDays(day, -1)">‹</button>
            <button type="button" class="chip" :disabled="isToday" @click="day = store.today">Hoje</button>
            <button type="button" class="icon" aria-label="Próximo dia" @click="day = addDays(day, 1)">›</button>
          </div>
        </div>
        <p class="agenda__date">{{ longDate(day) }} · {{ live.length }} atendimentos</p>
        <div class="filters" role="group" aria-label="Filtrar por profissional">
          <button type="button" class="chip" :aria-pressed="proFilter === 'all'" @click="proFilter = 'all'">Todos</button>
          <button v-for="p in pros" :key="p.id" type="button" class="chip" :aria-pressed="proFilter === p.id" @click="proFilter = p.id">{{ p.name.split(' ')[0] }}</button>
        </div>
        <p v-if="!dayList.length" class="muted empty">Sem atendimentos neste dia.</p>
        <ul v-else class="appts">
          <li v-for="b in dayList" :key="b.id" :class="['appt', b.status]">
            <time class="appt__t">{{ minToHHMM(b.start) }}<small>{{ minToHHMM(b.start + serviceById(b.serviceId).minutes) }}</small></time>
            <div class="appt__b">
              <strong>{{ b.client }}</strong>
              <span>{{ serviceById(b.serviceId).name }} · {{ proById(b.proId).name.split(' ')[0] }}</span>
            </div>
            <div class="appt__r">
              <b>{{ brl(serviceById(b.serviceId).price) }}</b>
              <span class="tag" :data-s="b.status">{{ label[b.status] }}</span>
            </div>
            <div v-if="b.status === 'confirmed'" class="appt__a">
              <button type="button" class="mini" @click="store.setStatus(b.id, 'done')">Concluir</button>
              <button type="button" class="mini mini--bad" @click="store.setStatus(b.id, 'cancelled')">Cancelar</button>
            </div>
          </li>
        </ul>
      </section>

      <div class="dash__side">
        <section class="card" aria-labelledby="h-ch">
          <h2 id="h-ch">Faturamento · 14 dias</h2>
          <RevenueChart :points="chart" :today="store.today" />
        </section>
        <section class="card" aria-labelledby="h-top">
          <h2 id="h-top">Serviços que mais rendem</h2>
          <ol class="rank">
            <li v-for="t in top" :key="t.id">
              <div class="rank__l"><span>{{ serviceById(t.id).name }}</span><b>{{ brl(t.total) }}</b></div>
              <div class="rank__bar" aria-hidden="true"><i :style="{ width: (t.total / topMax) * 100 + '%' }"></i></div>
              <small>{{ t.count }} atendimentos</small>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
</template>
