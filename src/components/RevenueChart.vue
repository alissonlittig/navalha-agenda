<script setup lang="ts">
import { computed } from 'vue'
import { brl, parseISO } from '@/lib/time'

const props = defineProps<{ points: { date: string; value: number }[]; today: string }>()
const W = 640
const H = 220
const PAD = { t: 16, b: 28, l: 8, r: 8 }
const max = computed(() => Math.max(1, ...props.points.map((p) => p.value)))
const step = computed(() => (W - PAD.l - PAD.r) / props.points.length)
const bars = computed(() =>
  props.points.map((p, i) => {
    const h = ((H - PAD.t - PAD.b) * p.value) / max.value
    return { ...p, x: PAD.l + i * step.value + step.value * 0.18, w: step.value * 0.64, y: H - PAD.b - h, h, day: parseISO(p.date).getDate(), cur: p.date === props.today }
  }),
)
const summary = computed(() => `Faturamento diário dos últimos ${props.points.length} dias. Maior dia: ${brl(max.value)}.`)
</script>

<template>
  <figure class="chart">
    <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="summary" preserveAspectRatio="none">
      <line :x1="PAD.l" :x2="W - PAD.r" :y1="H - PAD.b" :y2="H - PAD.b" class="chart__axis" />
      <g v-for="b in bars" :key="b.date">
        <rect :x="b.x" :y="b.y" :width="b.w" :height="Math.max(b.h, 0)" rx="3" :class="['chart__bar', { cur: b.cur }]"><title>{{ b.date.split('-').reverse().join('/') }}: {{ brl(b.value) }}</title></rect>
        <text :x="b.x + b.w / 2" :y="H - 8" text-anchor="middle" class="chart__lbl">{{ b.day }}</text>
      </g>
    </svg>
  </figure>
</template>
