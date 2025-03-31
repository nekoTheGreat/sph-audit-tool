<script setup lang="ts">
import TopNav from "~/components/Nav/TopNav.vue";
import {z} from "zod";
import type {FormSubmitEvent} from "@nuxt/ui";

const state = reactive({
  url: '',
})
const schema = z.object({
  url: z.string().url()
})
async function onSubmit(event: FormSubmitEvent<any>) {
  try {

  } catch (e) {

  }
}
</script>

<template>
  <TopNav></TopNav>
  <div class="@container/main mt-5 p-5">
    <div class="max-w-md mx-auto p-5 shadow">
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="URL" name="url">
          <UInput class="w-full" v-model="state.url" type="text" />
        </UFormField>
        <UButton type="submit">
          Submit
        </UButton>
      </UForm>
    </div>
  </div>
</template>