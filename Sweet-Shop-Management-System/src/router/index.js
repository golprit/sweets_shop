import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import SweetsView from '../views/SweetsView.vue'
import AdminSweetsView from '../views/AdminSweetsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/sweets',
      name: 'sweets',
      component: SweetsView,
    },
    {
      path: '/admin/sweets',
      name: 'admin-sweets',
      component: AdminSweetsView,
      meta: { requiresAdmin: true },
    },
  ],
})

// Navigation guard to protect admin routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    if (!currentUser.userType || currentUser.userType !== 'admin') {
      alert('Access denied. Admin privileges required.')
      next('/')
      return
    }
  }
  next()
})

export default router
