import { createApp } from 'vue'
import gsap from 'gsap'
import App from './App.vue'
import router from './router'
import './style.css'

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(50)
}

createApp(App).use(router).mount('#app')