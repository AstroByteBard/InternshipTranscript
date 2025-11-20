<script setup>
import DuplicateCompetenciesModal from '~/components/competenciesModal/DuplicateModal.vue'
import AddCompetencies from '~/components/competenciesModal/AddModal.vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:earth"
pageTitle.value = "General Competencies"
pageSubtitle.value = "Overview of student skill assessment decided by the university"

const overlay = useOverlay()
const addDuplicateModal = overlay.create(DuplicateCompetenciesModal)
const addCompetenciesModal = overlay.create(AddCompetencies)


const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

const competenciesData = ref([
    {
        id: 1,
        label: 'Communication Skills',
        description: 'Ability to effectively convey information and ideas through various mediums'
    },
    {
        id: 2,
        label: 'Problem Solving',
        description: 'Capacity to identify issues and develop practical solutions'
    },
    {
        id: 3,
        label: 'Teamwork and Collaboration',
        description: 'Working effectively with others to achieve common goals'
    },
    {
        id: 4,
        label: 'Critical Thinking',
        description: 'Analyzing information objectively and making reasoned judgments'
    },
    {
        id: 5,
        label: 'Adaptability and Flexibility',
        description: 'Adjusting to new conditions and handling change effectively'
    }
])

const showData = ref(false)

function showDuplicateModal() {
    addDuplicateModal.open({ title: 'General' })
    showData.value = true
}

function showCompetenciesModal() {
    addCompetenciesModal.open({ context: 'General' })
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

        <div class="space-y-6 mt-4" v-if="showData">
            <UCard v-for="items in competenciesData" :key="items.label">
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