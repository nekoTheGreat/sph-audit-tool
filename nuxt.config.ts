// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: process.env.NODE_ENV == 'development' },
  modules: ['@nuxt/ui', 'nuxt-auth-utils', 'nuxt-build-cache'],
  css: ['./assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    auth: {
      user: process.env.ADMIN_USERS,
      pass: process.env.ADMIN_PASS,
    }
  }
})