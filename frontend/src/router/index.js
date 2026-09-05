import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      {
        path: 'catalogo',
        name: 'catalog',
        component: () => import('../views/CatalogView.vue'),
      },
      {
        path: 'catalogo/:category',
        name: 'catalog-category',
        component: () => import('../views/CatalogView.vue'),
        props: true,
      },
      {
        path: 'produto/:slug',
        name: 'product',
        component: () => import('../views/ProductView.vue'),
        props: true,
      },
      { path: 'carrinho', name: 'cart', component: () => import('../views/CartView.vue') },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('../views/CheckoutView.vue'),
        meta: { requiresAuth: true },
      },
      { path: 'entrar', name: 'login', component: () => import('../views/LoginView.vue') },
      { path: 'cadastro', name: 'register', component: () => import('../views/RegisterView.vue') },
      {
        path: 'conta',
        name: 'account',
        component: () => import('../views/AccountView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: { name: 'admin-products' } },
      {
        path: 'produtos',
        name: 'admin-products',
        component: () => import('../views/admin/ProductsView.vue'),
      },
      {
        path: 'produtos/novo',
        name: 'admin-product-new',
        component: () => import('../views/admin/ProductFormView.vue'),
      },
      {
        path: 'produtos/:id/editar',
        name: 'admin-product-edit',
        component: () => import('../views/admin/ProductFormView.vue'),
        props: true,
      },
      {
        path: 'pedidos',
        name: 'admin-orders',
        component: () => import('../views/admin/OrdersView.vue'),
      },
      {
        path: 'pedidos/:reference',
        name: 'admin-order-detail',
        component: () => import('../views/admin/OrderDetailView.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const { isAuthenticated, isAdmin, initialized, fetchCurrentUser } = useAuth()

  if (!initialized.value) {
    await fetchCurrentUser()
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: 'home' }
  }

  return true
})

export default router