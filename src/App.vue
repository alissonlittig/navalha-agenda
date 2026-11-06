<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <a class="skip" href="#main">Pular para o conteúdo</a>
  <header class="top">
    <div class="wrap top__in">
      <RouterLink to="/" class="brand" aria-label="Navalha &amp; Co. — início">
        <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true"><path d="M18 50V14l28 36V14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" /></svg>
        <span>Navalha <em>&amp;</em> Co.</span>
      </RouterLink>
      <nav aria-label="Principal">
        <RouterLink to="/" exact-active-class="on">Agendar</RouterLink>
        <RouterLink to="/painel" active-class="on" exact-active-class="on">Painel do dono</RouterLink>
      </nav>
    </div>
  </header>
  <main id="main"><RouterView /></main>
  <footer class="foot">
    <div class="wrap">
      <p>Projeto de demonstração · dados e marca fictícios · nenhum agendamento é real.</p>
      <p>Vue 3 · TypeScript · Pinia · Vue Router · Vitest</p>
    </div>
  </footer>
</template>
