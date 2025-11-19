<script setup>
import DuplicateCompetenciesModal from '~/components/DuplicateCompetencies.Modal.vue'
import AddCompetencies from '~/components/AddCompetencies.vue'

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

function showDuplicateModal() {
  addDuplicateModal.open({ title: 'Specific' })
}

function showCompetenciesModal() {
  addCompetenciesModal.open({ context: 'Specific' })
}

</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-sub-actions>
            <UButton icon="lucide:copy" color="neutral" variant="outline" label="Duplicate" @click="showDuplicateModal()" />
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
    </NuxtLayout>
</template>