<script setup>
import DuplicateCompetenciesModal from '~/components/DuplicateCompetencies.Modal.vue'
import AddCompetencies from '~/components/AddCompetencies.vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:messages-square"
pageTitle.value = "Suggestions Competencies"
pageSubtitle.value = "Overview of student evaluations and system activity"

const overlay = useOverlay()
const addDuplicateModal = overlay.create(DuplicateCompetenciesModal)
const addCompetenciesModal = overlay.create(AddCompetencies)

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

function showDuplicateModal() {
    addDuplicateModal.open({ title: 'Suggestions' })
}

function showCompetenciesModal() {
    addCompetenciesModal.open({ context: 'Suggestions' })
}
</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-sub-actions>
            <UButton icon="lucide:copy" color="neutral" variant="outline" label="Duplicate"
                @click="showDuplicateModal()" />
        </template>

        <template #navbar-actions>
            <UButton icon="lucide:plus" color="error" variant="solid" label="Add" @click="showCompetenciesModal()" />
        </template>

        <div class="flex justify-end gap-5">
            <USelect v-model="selectedYear" size="xl" :items="itemsyear" class="w-30" color="error" />
        </div>

    </NuxtLayout>
</template>