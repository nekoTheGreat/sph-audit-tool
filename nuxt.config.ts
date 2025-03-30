// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  css: ['./assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    auth: {
      user: process.env.BASIC_AUTH_USER,
      pass: process.env.BASIC_AUTH_PASS,
    }
  }
})