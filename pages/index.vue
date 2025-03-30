<script setup lang="ts">

const { user } = useUserSession();
</script>

<template>
  <div class="@container/main mt-5">
    Welcome, {{ user.name }}
  </div>
</template>