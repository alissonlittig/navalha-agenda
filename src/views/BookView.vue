<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAgenda } from '@/stores/agenda'
import { pros, proById, serviceById, services } from '@/lib/catalog'
import { availableSlots } from '@/lib/slots'
import { addDays, brl, longDate, minToHHMM, parseISO, weekdayShort } from '@/lib/time'

const store = useAgenda()
const router = useRouter()

const step = ref(1)
const serviceId = ref<string | null>(null)
const proId = ref<string>('any')
const date = ref<string | null>(null)
const slot = ref<{ start: number; proId: string } | null>(null)
const name = ref('')
const phone = ref('')
const touched = ref(false)

const service = computed(() => (serviceId.value ? serviceById(serviceId.value) : null))
const candidates = computed(() => pros.filter((p) => service.value && p.serviceIds.includes(service.value.id)))
const days = computed(() => Array.from({ length: 14 }, (_, i) => addDays(store.today, i)))

function slotsFor(d: string) {
  const svc = service.value
  if (!svc) return []
  const pool = proId.value === 'any' ? candidates.value : candidates.value.filter((p) => p.id === proId.value)
  const now = d === store.today ? store.nowMin : null
  const merged = new Map<number, string>()
  for (const p of pool)
    for (const t of availableSlots(p, svc, d, store.all, now)) if (!merged.has(t)) merged.set(t, p.id)
  return [...merged].map(([start, pid]) => ({ start, proId: pid })).sort((a, b) => a.start - b.start)
}

const dayInfo = computed(() => days.value.map((d) => ({ d, n: slotsFor(d).length })))
const slots = computed(() => (date.value ? slotsFor(date.value) : []))
const morning = computed(() => slots.value.filter((s) => s.start < 12 * 60))
const afternoon = computed(() => slots.value.filter((s) => s.start >= 12 * 60))

function pickService(id: string) {
  serviceId.value = id
  if (proId.value !== 'any' && !proById(proId.value).serviceIds.includes(id)) proId.value = 'any'
  slot.value = null
  step.value = 2
}
watch([serviceId, proId], () => {
  slot.value = null
  const first = dayInfo.value.find((x) => x.n > 0)
  if (!date.value || !dayInfo.value.find((x) => x.d === date.value && x.n > 0)) date.value = first?.d ?? null
}, { immediate: true })
watch(date, () => (slot.value = null))

const phoneDigits = computed(() => phone.value.replace(/\D/g, ''))
const errors = computed(() => ({
  name: name.value.trim().length < 2 ? 'Informe seu nome.' : '',
  phone: phoneDigits.value.length < 10 || phoneDigits.value.length > 11 ? 'Informe um telefone com DDD.' : '',
}))

function confirm() {
  touched.value = true
  if (errors.value.name || errors.value.phone || !service.value || !date.value || !slot.value) return
  const b = store.book({ date: date.value, start: slot.value.start, serviceId: service.value.id, proId: slot.value.proId, client: name.value.trim() })
  router.push({ name: 'done', params: { id: b.id } })
}

const dayNum = (d: string) => parseISO(d).getDate()
const proName = computed(() => (slot.value ? proById(slot.value.proId).name : proId.value === 'any' ? 'Sem preferência' : proById(proId.value).name))
const steps = ['Serviço', 'Profissional e horário', 'Seus dados']
</script>

<template>
  <section class="hero">
    <div class="wrap">
      <p class="eyebrow">Barbearia · Curitiba</p>
      <h1>Cabelo e barba <em>no ponto.</em><br />Horário marcado em um minuto.</h1>
      <p class="lead">Escolha o serviço, o profissional e o horário livre. Sem ligação, sem fila de espera.</p>
    </div>
  </section>

  <div class="wrap book">
    <div class="book__main">
      <ol class="steps" aria-label="Etapas do agendamento">
        <li v-for="(s, i) in steps" :key="s" :class="{ on: step === i + 1, done: step > i + 1 }" :aria-current="step === i + 1 ? 'step' : undefined">
          <button type="button" :disabled="i + 1 > step" @click="step = i + 1">
            <span class="steps__n" aria-hidden="true">{{ i + 1 }}</span>{{ s }}
          </button>
        </li>
      </ol>

      <section v-if="step === 1" aria-labelledby="h-serv" class="panel">
        <h2 id="h-serv">O que vamos fazer hoje?</h2>
        <ul class="svc">
          <li v-for="s in services" :key="s.id">
            <button type="button" class="svc__btn" :aria-pressed="serviceId === s.id" @click="pickService(s.id)">
              <span class="svc__txt"><strong>{{ s.name }}</strong><small>{{ s.desc }}</small></span>
              <span class="svc__meta"><b>{{ brl(s.price) }}</b><small>{{ s.minutes }} min</small></span>
            </button>
          </li>
        </ul>
      </section>

      <section v-else-if="step === 2 && service" aria-labelledby="h-when" class="panel">
        <h2 id="h-when">Com quem e quando?</h2>

        <fieldset class="field">
          <legend>Profissional</legend>
          <div class="pros">
            <label class="pro" :class="{ on: proId === 'any' }">
              <input v-model="proId" type="radio" name="pro" value="any" />
              <span class="avatar avatar--any" aria-hidden="true">+</span>
              <span><strong>Sem preferência</strong><small>Primeiro horário livre</small></span>
            </label>
            <label v-for="p in candidates" :key="p.id" class="pro" :class="{ on: proId === p.id }">
              <input v-model="proId" type="radio" name="pro" :value="p.id" />
              <span class="avatar" aria-hidden="true">{{ p.initials }}</span>
              <span><strong>{{ p.name }}</strong><small>{{ p.role }}</small></span>
            </label>
          </div>
        </fieldset>

        <fieldset class="field">
          <legend>Dia</legend>
          <div class="days" role="radiogroup" aria-label="Dia">
            <button
              v-for="x in dayInfo" :key="x.d" type="button" role="radio" class="day"
              :aria-checked="date === x.d" :disabled="x.n === 0" :aria-label="longDate(x.d) + (x.n ? '' : ', sem horários')"
              @click="date = x.d"
            >
              <small>{{ weekdayShort(x.d) }}</small><b>{{ dayNum(x.d) }}</b>
            </button>
          </div>
        </fieldset>

        <fieldset class="field">
          <legend>Horário <span v-if="date" class="muted">· {{ longDate(date) }}</span></legend>
          <p v-if="!slots.length" class="muted">Nenhum horário livre neste dia. Escolha outro dia ou profissional.</p>
          <template v-for="g in [{ t: 'Manhã', l: morning }, { t: 'Tarde', l: afternoon }]" :key="g.t">
            <div v-if="g.l.length" class="slotgroup">
              <h3>{{ g.t }}</h3>
              <div class="slots" role="radiogroup" :aria-label="g.t">
                <button
                  v-for="s in g.l" :key="s.start" type="button" role="radio" class="slot"
                  :aria-checked="slot?.start === s.start" @click="slot = s"
                >{{ minToHHMM(s.start) }}</button>
              </div>
            </div>
          </template>
        </fieldset>

        <div class="actions">
          <button type="button" class="btn btn--ghost" @click="step = 1">Voltar</button>
          <button type="button" class="btn" :disabled="!slot" @click="step = 3">Continuar</button>
        </div>
      </section>

      <form v-else-if="step === 3 && service && slot && date" class="panel" novalidate aria-labelledby="h-you" @submit.prevent="confirm">
        <h2 id="h-you">Quase lá. Como te chamamos?</h2>
        <div class="field">
          <label for="f-name">Nome</label>
          <input id="f-name" v-model="name" autocomplete="name" :aria-invalid="touched && !!errors.name" aria-describedby="e-name" />
          <p id="e-name" class="err" role="alert">{{ touched ? errors.name : '' }}</p>
        </div>
        <div class="field">
          <label for="f-phone">WhatsApp</label>
          <input id="f-phone" v-model="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(41) 99999-0000" :aria-invalid="touched && !!errors.phone" aria-describedby="e-phone" />
          <p id="e-phone" class="err" role="alert">{{ touched ? errors.phone : '' }}</p>
        </div>
        <p class="muted small">Demonstração: nada é enviado a lugar nenhum. O agendamento fica salvo só neste navegador.</p>
        <div class="actions">
          <button type="button" class="btn btn--ghost" @click="step = 2">Voltar</button>
          <button type="submit" class="btn">Confirmar agendamento</button>
        </div>
      </form>
    </div>

    <aside class="summary" aria-label="Resumo do agendamento">
      <h2>Seu horário</h2>
      <dl>
        <div><dt>Serviço</dt><dd>{{ service?.name ?? '—' }}</dd></div>
        <div><dt>Profissional</dt><dd>{{ service ? proName : '—' }}</dd></div>
        <div><dt>Data</dt><dd>{{ slot && date ? longDate(date) : '—' }}</dd></div>
        <div><dt>Horário</dt><dd>{{ slot ? minToHHMM(slot.start) : '—' }}</dd></div>
        <div v-if="service"><dt>Duração</dt><dd>{{ service.minutes }} min</dd></div>
      </dl>
      <p class="total"><span>Total</span><b>{{ service ? brl(service.price) : '—' }}</b></p>
      <p class="small muted">Pagamento na barbearia. Cancelamento grátis até 2 h antes.</p>
    </aside>
  </div>
</template>
