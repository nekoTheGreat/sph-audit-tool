<script setup lang="ts"></script>

<template>
  <div class="flex flex-col h-full">
    <main style="flex: 1">
      <slot/>
    </main>
    <div class="text-center text-xs" style="height: 10px;">
    </div>
  </div>
</template>