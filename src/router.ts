import { createRouter, createWebHashHistory } from 'vue-router'
import BookView from './views/BookView.vue'
import ConfirmedView from './views/ConfirmedView.vue'
import DashboardView from './views/DashboardView.vue'

// Hash history: works on GitHub Pages without a 404 fallback.
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'book', component: BookView, meta: { title: 'Agendar' } },
    { path: '/confirmado/:id', name: 'done', component: ConfirmedView, meta: { title: 'Agendamento confirmado' } },
    { path: '/painel', name: 'dashboard', component: DashboardView, meta: { title: 'Painel do dono' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? 'Agenda')} · Navalha & Co.`
})
