<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { LoginFormDataSchema } from "~/common/schemas";

const state = reactive({
  email: '',
  password: ''
});
const { loggedIn, user, fetch: refreshSession } = useUserSession();

async function onSubmit(event: FormSubmitEvent<LoginFormDataSchema>) {
  try {
    await $fetch("/api/auth/login", { method: 'POST', body: event.data});
    await refreshSession();
    await navigateTo("/");
  } catch (e) {
    alert(e.data?.message ?? e.message);
  }
}
</script>

<template>
  <UForm :schema="LoginFormDataSchema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput class="w-full" v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput class="w-full" v-model="state.password" type="password" />
    </UFormField>

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>