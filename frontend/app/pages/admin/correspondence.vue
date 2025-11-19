<script setup>
const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

import { h, resolveComponent, ref } from 'vue'

pageIcon.value = "lucide:mail"
pageTitle.value = "Correspondence"
pageSubtitle.value = "Send the assessment email and track its activity"


const showTable = ref(true);
const UBadge = resolveComponent("UBadge");

const itemsSchools = ref(['All', 'School of Information Technology', 'School of Business', 'School of Management'])
const selectedSchool = ref('');

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

const itemssemesters = ref(['1', '2', '3'])
const selectedSemester = ref('');

const itemsStatus = ref(['All', 'Sent', 'Pending', 'Failed'])
const selectedStatus = ref('');

const email_subject = ref('');
const email_body = ref('');

const data = [
    { id: 1, major: 'Software Engineering', status: 'Sent' },
    { id: 2, major: 'Computer Engineering', status: 'Pending' },
    { id: 3, major: 'Digital and Communication Engineering', status: 'Failed' },
    { id: 4, major: 'Digital Technology for Business Innovation', status: 'Sent' },
    { id: 5, major: 'Multimedia Technology and Animation', status: 'Pending' },
    { id: 6, major: 'Computer Science and Innovation', status: 'Pending' }
]

const columns = [
  {
    accessor: 'major',
    header: 'Major',
    cell: ({ row }) => row.major || '—'
  },
  {
    accessor: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = {
        Sent: 'success',
        Pending: 'warning',
        Failed: 'danger'
      }[row.status]
      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => row.status)
    }
  }
]



const tableItems = [{
    label: 'Email Sending',
    slot: 'email'
}, {
    label: 'Email Templates',
    slot: 'templates'
}]


</script>

<template>
    <NuxtLayout name="admin">
        <UCard>
            <UTabs :items="tableItems" color="error" class="w-full">
                <template #email>
                    <div class="grid grid-cols-5 gap-4">
                        <UFormField label="School" required>
                            <USelectMenu placeholder="Select School" :items="itemsSchools" v-model="selectedSchool"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Academic Year" required>
                            <USelectMenu placeholder="Select Academic Year" :items="itemsyear" v-model="selectedYear"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Semester" required>
                            <USelect placeholder="Select Semester" :items="itemssemesters" v-model="selectedSemester"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Status" required>
                            <USelect placeholder="Select Status" :items="itemsStatus" v-model="selectedStatus"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Search" class="w-full">
                            <UButton block label="Filter" color="error" variant="solid" />
                        </UFormField>
                    </div>
                </template>

                <template #templates>
                    <div class="space-y-2">
                        <UFormField label="Subject" required>
                            <UInput v-model="email_subject" placeholder="Typing the subject here" class="w-full" />
                        </UFormField>
                        <UFormField label="Body" required>
                            <UTextarea v-model="email_body" placeholder="Typing the email body here" rows="10"
                                class="w-full" />
                        </UFormField>
                    </div>
                </template>
            </UTabs>
        </UCard>

        <UTable v-show="showTable" :data="data" :columns="columns"
            class="flex-1 rounded-2xl border-2 border-gray-300 mt-5 "
            :ui="{ 'thead': 'bg-gray-50 text-xl font-bold' }" />
    </NuxtLayout>
</template>