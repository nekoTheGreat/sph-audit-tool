<script setup lang="ts">
import TopNav from "~/components/Nav/TopNav.vue";
import {z} from "zod";
import type {FormSubmitEvent} from "@nuxt/ui";
import type {FieldAudit, ParserResult} from "~/audit-tool/types";

const state = reactive({
  url: '',
})
const schema = z.object({
  url: z.string(),
})
const result = ref<ParserResult[]>([]);
const loading = ref(false);
async function onSubmit(event: FormSubmitEvent<any>) {
  try {
    loading.value = true;
    result.value = await $fetch<ParserResult[]>("/api/crawl",{ method: 'POST', body: event.data });
  } catch (e) {
    alert(e);
  } finally {
    loading.value = false;
  }
}

const parseAuditErrors = (audit: FieldAudit) : string[] => {
  const messages = [] as string[];

  let keyLabel = audit.name;
  switch(audit.name) {
    case 'meta_description':
      keyLabel = 'meta description';
      break;
    case 'image_alt':
      keyLabel = 'image alt attribute';
      break;
    case 'image_link':
      keyLabel = 'image source attribute';
      break;
    case 'page_url':
      keyLabel = 'page url';
      break;
  }
  keyLabel = keyLabel.charAt(0).toUpperCase() + keyLabel.slice(1);

  for(const error of audit.errors) {
    let message = "";
    switch(error.key) {
      case 'duplicate':
        message = `${keyLabel} has a duplicate or duplicates across pages`;
        break;
      case 'required':
        message = `${keyLabel} is missing`;
        break;
      case 'broken_link':
        message = `broken image link found`;
        break;
      case 'keyword_not_found':
        message = 'no keyword found in the url';
      break;
      default:
        message = error.key;
    }
    messages.push(message);
  }
  return messages;
}
</script>

<template>
  <TopNav></TopNav>
  <div class="@container/main mt-5 p-5">
    <div class="max-w-lg mx-auto p-5 shadow">
      <UForm :schema="schema" :state="state" class="space-y-4 mb-5" @submit="onSubmit">
        <UFormField label="URL" name="url">
          <UInput class="w-full" v-model="state.url" type="text" />
        </UFormField>
        <UButton type="submit" :disabled="loading">
          Submit
        </UButton>
        <UProgress v-if="loading" :model-value="null" />
      </UForm>
      <template v-if="result && result.length > 0">
        <div class="text-lg font-bold">Site Links:</div>
        <hr  class="mb-2"/>
        <div v-for="row in result" class="mb-3">
          <div class="font-bold">{{ row.url }}</div>
          <div class="px-5">
            <ul v-for="fieldAudit in row.audits">
              <li v-for="message in parseAuditErrors(fieldAudit)">{{ message }}</li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>