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

const docs = ref([
  {
    id: 1,
    name: "Internship Transcript",
    createdAt: "11 OCT 2025"
  }
])

</script>

<template>
  <NuxtLayout name="admin">
 
    <!-- Navbar Button -->
    <template #navbar-actions>
      <UButton 
        icon="lucide:plus"
        color="error"
        variant="solid"
        label="Add"
        @click="showModal = true"
      />
    </template>

    <!-- MODAL (Overlay) -->
    <div 
      v-if="showModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <UCard class="w-[700px]">
        <template #header>
          <h2 class="text-lg font-semibold">Add Documents Template</h2>
        </template>

        <div>
          <label class="text-sm font-medium">
            Documents Name <span class="text-red-500">*</span>
          </label>

          <UInput
            v-model="newDocumentName"
            placeholder="Typing document name here"
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

    <!-- CONTENT -->
    <div class="p-8">
      <div
        class="grid gap-8"
        style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
      >
        <UCard
          v-for="doc in docs"
          :key="doc.id"
          class="rounded-xl border hover:shadow-md transition cursor-pointer flex flex-col"
        >
          <div class="w-full h-[160px] rounded-lg bg-gray-100 border"></div>

          <div class="flex justify-between items-end mt-4">
            <div>
              <p class="font-medium text-gray-800">{{ doc.name }}</p>
              <p class="text-xs text-gray-500">
                Create at {{ doc.createdAt }}
              </p>
            </div>

            <UDropdown
              :items="[
                [{ label: 'Edit', icon: 'lucide:edit', click: () => {} }],
                [{ label: 'Delete', icon: 'lucide:trash', click: () => {} }],
              ]"
            >
              <UButton
                icon="lucide:more-vertical"
                variant="ghost"
                color="neutral"
                class="p-1"
              />
            </UDropdown>
          </div>
        </UCard>
      </div>
    </div>

  </NuxtLayout>
</template>
