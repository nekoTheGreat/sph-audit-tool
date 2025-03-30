<script setup lang="ts">
import TopNav from "~/components/Nav/TopNav.vue";
const { user } = useUserSession();
</script>

<template>
  <TopNav></TopNav>
  <div class="@container/main mt-5 p-5">
    Welcome, {{ user.name }}
  </div>
</template>