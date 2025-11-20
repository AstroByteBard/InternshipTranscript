<script setup>
import { ref } from 'vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:file-edit"
pageTitle.value = "Document"
pageSubtitle.value = "Create template for documents and manage document"


const showModal = ref(false)
const newDocumentName = ref("")

</script>

<template>
  <NuxtLayout name="admin">
 
    <template #navbar-actions>
      <UButton 
        icon="lucide:plus"
        color="error"
        variant="solid"
        label="Add"
        @click="showModal = true"
      />
    </template>

    <div class="p-8 relative min-h-[270px]">

      <div 
        v-if="showModal"
        class="absolute inset-0 flex justify-center mt-10 z-50"
      >
        <UCard class="relative w-[700px]">
          <template #header>
            <h2 class="text-lg font-semibold">Add Documents Template</h2>
          </template>
          <div>
            <label class="text-sm font-medium">
              Documents Name <span class="text-red-500">*</span>
            </label>

            <UInput
              v-model="newDocumentName"
              placeholder="Internship Transcript"
              class="mt-1 w-full"
            />
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="gray" @click="showModal = false">Cancel</UButton>
              <UButton color="error" @click="showModal = false">Add</UButton>
            </div>
          </template>

        </UCard>
      </div>
    </div>

  </NuxtLayout>
</template>
