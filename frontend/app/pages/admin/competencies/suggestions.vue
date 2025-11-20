<script setup>
import DuplicateCompetenciesModal from '~/components/competenciesModal/DuplicateModal.vue'
import AddCompetencies from '~/components/competenciesModal/AddModal.vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:messages-square"
pageTitle.value = "Suggestions Competencies"
pageSubtitle.value = "Overview of student evaluations and system activity"

const overlay = useOverlay()
const addDuplicateModal = overlay.create(DuplicateCompetenciesModal)
const addCompetenciesModal = overlay.create(AddCompetencies)

const SuggestionsData = ref([
    {
        id: 1,
        label: 'Time Management',
        description: 'Ability to effectively manage time and prioritize tasks to meet deadlines'
    },
    {
        id: 2,
        label: 'Emotional Intelligence',
        description: 'Capacity to understand and manage one\'s own emotions, as well as empathize with others'
    },
    {
        id: 3,
        label: 'Leadership Skills',
        description: 'Ability to lead, motivate, and guide a team towards achieving common goals'
    },
    {
        id: 4,
        label: 'Creativity and Innovation',
        description: 'Capability to think outside the box and generate new ideas or solutions'
    },
    {
        id: 5,
        label: 'Interpersonal Skills',
        description: 'Effectiveness in interacting and communicating with others in a positive manner'
    }
])

const showData = ref(false)

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

function showDuplicateModal() {
    addDuplicateModal.open({ title: 'Suggestions' })
    showData.value = true
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

        <div class="space-y-6 mt-6" v-if="showData">
            <UCard v-for="items in SuggestionsData" :key="items.label">
                <div class="w-full flex justify-between">
                    <div class="flex gap-2">
                        <h1> {{ items.id }}</h1>
                        <h1> {{ items.label }} </h1>
                    </div>
                    <UButton icon="lucide:ellipsis-vertical" color="neutral" variant="ghost"
                        @click="openAddRoleModal()" />
                </div>
            </UCard>
        </div>

    </NuxtLayout>
</template>