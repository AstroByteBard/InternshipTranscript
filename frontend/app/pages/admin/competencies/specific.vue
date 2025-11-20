<script setup>
import DuplicateCompetenciesModal from '~/components/competenciesModal/DuplicateModal.vue'
import AddCompetencies from '~/components/competenciesModal/AddModal.vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:school"
pageTitle.value = "Specific Competencies"
pageSubtitle.value = "Overview of student evaluations and system activity"

const overlay = useOverlay()
const addDuplicateModal = overlay.create(DuplicateCompetenciesModal)
const addCompetenciesModal = overlay.create(AddCompetencies)

const itemsSchools = ref(['All', 'School of Information Technology', 'School of Business', 'School of Management'])
const selectedSchool = ref('');

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

const itemsMajors = ref(['Computer Science', 'Information Systems', 'Business Administration', 'Marketing', 'Accounting', 'Management'])
const selectedMajor = ref('');

const competenciesData = ref([
    {
        id: 1,
        label: 'Programming and Coding',
        description: 'Proficiency in writing, testing, and debugging code using various programming languages'
    },
    {
        id: 2,
        label: 'Database Management',
        description: 'Ability to design, implement, and maintain database systems'
    },
    {
        id: 3,
        label: 'Version Control Systems',
        description: 'Experience with Git and collaborative development workflows'
    },
    {
        id: 4,
        label: 'Software Testing and Quality Assurance',
        description: 'Understanding of testing methodologies and quality assurance practices'
    },
    {
        id: 5,
        label: 'Cloud Computing and DevOps',
        description: 'Knowledge of cloud platforms and deployment automation tools'
    }
])

const showData = ref(false)

function showDuplicateModal() {
    addDuplicateModal.open({ title: 'Specific' })
    showData.value = true
}

function showCompetenciesModal() {
    addCompetenciesModal.open({ context: 'Specific' })
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


        <UCard>
            <div class="grid grid-cols-4 gap-4">
                <UFormField class="w-full" label="Academic Year" required>
                    <USelectMenu placeholder="Select Academic Year" :items="itemsyear" v-model="selectedYear"
                        class="w-full" color="error" />
                </UFormField>
                <UFormField class="w-full" label="School" required>
                    <USelectMenu placeholder="Select School" :items="itemsSchools" v-model="selectedSchool"
                        class="w-full" color="error" />
                </UFormField>
                <UFormField class="w-full" label="Majors" required>
                    <USelectMenu placeholder="Select Majors" :items="itemsMajors" v-model="selectedMajor" class="w-full"
                        color="error" />
                </UFormField>
                <UFormField class="w-full" label="Action">
                    <UButton block label="Apply" color="error" variant="solid" />
                </UFormField>
            </div>
        </UCard>

        <div class="space-y-6 mt-6" v-if="showData">
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