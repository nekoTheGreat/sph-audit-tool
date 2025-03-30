<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { clear: clearSession } = useUserSession();

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Logout',
    async onSelect(e) {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' });
        await clearSession();
        await navigateTo("/auth/login");
      } catch(e) {
        alert(e.data?.message ?? e.toString())
      }
    }
  }
])
</script>

<template>
  <UNavigationMenu :items="items" class="w-full justify-end" />
</template>