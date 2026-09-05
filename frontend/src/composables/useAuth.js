// Estado de autenticação compartilhado, sem dependência de Pinia/Vuex.
// Um único estado reativo em módulo é suficiente para o escopo atual do front.

import { computed, reactive } from 'vue'
import { authApi } from '../lib/api'

const state = reactive({
  user: null,
  loading: true,
  initialized: false,
})

async function fetchCurrentUser() {
  state.loading = true
  try {
    const data = await authApi.me()
    state.user = data.user ?? data
  } catch {
    state.user = null
  } finally {
    state.loading = false
    state.initialized = true
  }
}

async function login(payload) {
  const data = await authApi.login(payload)
  state.user = data.user ?? data
  return state.user
}

async function register(payload) {
  const data = await authApi.register(payload)
  state.user = data.user ?? data
  return state.user
}

async function logout() {
  await authApi.logout()
  state.user = null
}

export function useAuth() {
  return {
    user: computed(() => state.user),
    isAuthenticated: computed(() => Boolean(state.user)),
    isAdmin: computed(() => state.user?.role === 'admin'),
    loading: computed(() => state.loading),
    initialized: computed(() => state.initialized),
    fetchCurrentUser,
    login,
    register,
    logout,
  }
}