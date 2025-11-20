<script setup>
import { getPaginationRowModel } from '@tanstack/vue-table'
import AddAdministratorModal from '~/components/adminstratorModal/AddUserModal.vue'
import ImportAdministratorModal from '~/components/adminstratorModal/ImportUserFileModal.vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:user"
pageTitle.value = "Users"
pageSubtitle.value = "Access the student list of each faculty and update related documents"

const overlay = useOverlay()
const addImportModal = overlay.create(ImportAdministratorModal)
const addManualModal = overlay.create(AddAdministratorModal)

const UBadge = resolveComponent("UBadge");
const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent("UButton");
const table = useTemplateRef('table')
const pagination = ref({
    pageIndex: 0,
    pageSize: 7
})

const itemsSchools = ref(['School of Information Technology', 'School of Business', 'School of Management'])
const selectedSchool = ref('');

const itemsMajors = ref(['Computer Science', 'Information Systems', 'Business Administration', 'Marketing', 'Accounting', 'Management'])
const selectedMajor = ref('');

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

const itemssemesters = ref(['1', '2', '3'])
const selectedSemester = ref('');

const itemsRoles = ref(['Admin', 'Students']);
const selectedRole = ref('Admin');

const itemsDepartments = ref(['Division of Placement and Co-Operative Education'])
const selectedDepartment = ref('');

const showManualModal = () => {
    addManualModal.open({ context: selectedRole })
}

const showImportModal = () => {
    addImportModal.open()
}

const adminData = ref([
    { id: 1, name: 'Kittiya Sirikan', email: 'kittiya.tak@mfu.ac.th', department: 'Division of Placement and Co-Operative Education' }
])

const adminTableColumns = [
    {
        header: 'ID',
        accessorKey: 'id',
        cell: ({ row }) => {
            return row.original.id || '—'
        }
    },
    {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, {
                    src: `https://i.pravatar.cc/150?u=${row.original.id}`,
                    size: 'lg'
                }),
                h('div', [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.name)
                ])
            ])
        }
    },
    {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => {
            return row.original.email || '—'
        }
    },
    {
        header: 'Department',
        accessorKey: 'Department',
        cell: ({ row }) => {
            return row.original.department || '—'
        }
    },
    {
        id: 'action'
    }
]

const studentData = ref([
    {
        id: 1,
        name: 'Lindsay Walton',
        school: 'School of Information Technology',
        major: 'Computer Science',
        studentID: '660610123',
        email: 'lindsay.walton@example.com',
        adviser: 'sarah.johnson@example.com',
        status: 'Incompleted'
    },
    {
        id: 2,
        name: 'Courtney Henry',
        school: 'School of Information Technology',
        major: 'Software Engineering',
        studentID: '660610124',
        email: 'courtney.henry@example.com',
        adviser: 'michael.chen@example.com',
        status: 'Completed'
    },
    {
        id: 3,
        name: 'Tom Cook',
        school: 'School of Business',
        major: 'Business Administration',
        studentID: '660610125',
        email: 'tom.cook@example.com',
        adviser: 'emily.davis@example.com',
        status: 'Completed'
    },
    {
        id: 4,
        name: 'Whitney Francis',
        school: 'School of Engineering',
        major: 'Mechanical Engineering',
        studentID: '660610126',
        email: 'whitney.francis@example.com',
        adviser: 'robert.wilson@example.com',
        status: 'Completed'
    },
    {
        id: 5,
        name: 'Leonard Krasner',
        school: 'School of Information Technology',
        major: 'Data Science',
        studentID: '660610127',
        email: 'leonard.krasner@example.com',
        adviser: 'amanda.lee@example.com',
        status: 'Incompleted'
    },
    {
        id: 6,
        name: 'Floyd Miles',
        school: 'School of Arts',
        major: 'Graphic Design',
        studentID: '660610128',
        email: 'floyd.miles@example.com',
        adviser: 'jessica.white@example.com',
        status: 'Error'
    },
    {
        id: 7,
        name: 'Emily Johnson',
        school: 'School of Science',
        major: 'Biology',
        studentID: '660610129',
        email: 'emily.johnson@example.com',
        adviser: 'david.martinez@example.com',
        status: 'Completed'
    },
    {
        id: 8,
        name: 'Michael Davis',
        school: 'School of Information Technology',
        major: 'Cybersecurity',
        studentID: '660610130',
        email: 'michael.davis@example.com',
        adviser: 'sarah.johnson@example.com',
        status: 'Incompleted'
    },
    {
        id: 9,
        name: 'Sarah Martinez',
        school: 'School of Business',
        major: 'Marketing',
        studentID: '660610131',
        email: 'sarah.martinez@example.com',
        adviser: 'jennifer.brown@example.com',
        status: 'Completed'
    },
    {
        id: 10,
        name: 'James Wilson',
        school: 'School of Engineering',
        major: 'Electrical Engineering',
        studentID: '660610132',
        email: 'james.wilson@example.com',
        adviser: 'christopher.taylor@example.com',
        status: 'Error'
    },
    {
        id: 11,
        name: 'Jessica Brown',
        school: 'School of Information Technology',
        major: 'Information Systems',
        studentID: '660610133',
        email: 'jessica.brown@example.com',
        adviser: 'michael.chen@example.com',
        status: 'Completed'
    },
    {
        id: 12,
        name: 'David Garcia',
        school: 'School of Science',
        major: 'Chemistry',
        studentID: '660610134',
        email: 'david.garcia@example.com',
        adviser: 'patricia.anderson@example.com',
        status: 'Incompleted'
    },
    {
        id: 13,
        name: 'Ashley Anderson',
        school: 'School of Arts',
        major: 'Digital Media',
        studentID: '660610135',
        email: 'ashley.anderson@example.com',
        adviser: 'jessica.white@example.com',
        status: 'Completed'
    },
    {
        id: 14,
        name: 'Christopher Lee',
        school: 'School of Business',
        major: 'Accounting',
        studentID: '660610136',
        email: 'christopher.lee@example.com',
        adviser: 'daniel.moore@example.com',
        status: 'Completed'
    },
    {
        id: 15,
        name: 'Amanda Taylor',
        school: 'School of Engineering',
        major: 'Civil Engineering',
        studentID: '660610137',
        email: 'amanda.taylor@example.com',
        adviser: 'robert.wilson@example.com',
        status: 'Incompleted'
    },
    {
        id: 16,
        name: 'Daniel Thomas',
        school: 'School of Information Technology',
        major: 'Computer Science',
        studentID: '660610138',
        email: 'daniel.thomas@example.com',
        adviser: 'sarah.johnson@example.com',
        status: 'Error'
    },
    {
        id: 17,
        name: 'Jennifer Moore',
        school: 'School of Science',
        major: 'Physics',
        studentID: '660610139',
        email: 'jennifer.moore@example.com',
        adviser: 'matthew.jackson@example.com',
        status: 'Completed'
    },
    {
        id: 18,
        name: 'Matthew Jackson',
        school: 'School of Business',
        major: 'Finance',
        studentID: '660610140',
        email: 'matthew.jackson@example.com',
        adviser: 'emily.davis@example.com',
        status: 'Incompleted'
    },
    {
        id: 19,
        name: 'Melissa White',
        school: 'School of Arts',
        major: 'Fine Arts',
        studentID: '660610141',
        email: 'melissa.white@example.com',
        adviser: 'jessica.white@example.com',
        status: 'Completed'
    },
    {
        id: 20,
        name: 'Joshua Harris',
        school: 'School of Information Technology',
        major: 'Software Engineering',
        studentID: '660610142',
        email: 'joshua.harris@example.com',
        adviser: 'michael.chen@example.com',
        status: 'Completed'
    }
])

const studentTableColumns = [
    { header: 'ID', accessorKey: 'id', cell: ({ row }) => { return row.original.id || '—' } },
    {
        accessor: 'name',
        header: 'Student',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UAvatar, {
                    src: `https://i.pravatar.cc/150?u=${row.original.id}`,
                    size: 'lg'
                }),
                h('div', [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                    h('p', { class: '' }, row.original.studentID)
                ])
            ])
        }
    },
    { header: 'Email', accessorKey: 'email', cell: ({ row }) => { return row.original.email || '—' } },
    { header: 'Major', accessorKey: 'major', cell: ({ row }) => { return row.original.major || '—' } },
    { header: 'Adviser', accessorKey: 'adviser' },
]

</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-sub-actions v-if="selectedRole != 'Admin'">
            <UButton icon="lucide:file-down" color="neutral" variant="outline" label="Import Users"
                @click="showImportModal()" />
        </template>

        <template #navbar-actions>
            <UButton icon="lucide:plus" color="error" variant="solid" label="Add User" @click="showManualModal()" />
        </template>

        <div class="flex justify-end gap-5">
            <USelect v-model="selectedRole" size="xl" :items="itemsRoles" class="w-30" color="error" />
        </div>

        <div class="w-full space-y-4" v-if="selectedRole == 'Admin'">
            <div class="w-full flex gap-5">
                <UFormField label="Search" required>
                    <UInput placeholder="Search by name or student ID" v-model="searchQuery" class="w-xl"
                        color="error" />
                </UFormField>
                <UFormField label="Department" class="w-full">
                    <USelectMenu placeholder="Select Department" :items="itemsDepartments" v-model="selectedDepartment"
                        class="w-56" color="error" />
                </UFormField>

            </div>
            <UTable ref="table" v-model:pagination="pagination" :data="adminData" :columns="adminTableColumns" sticky
                :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
                class="flex-1 rounded-2xl border-2 border-gray-300 mt-5 "
                :ui="{ 'thead': 'bg-gray-50 text-xl font-bold' }" />
            <div class="flex justify-between">
                <h1 class="text-gray-600 font-medium ">Total {{ selectedRole }}:
                    {{ table?.tableApi?.getFilteredRowModel().rows.length }}
                </h1>
                <UPagination activeColor="error"
                    :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                    :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                    :total="table?.tableApi?.getFilteredRowModel().rows.length"
                    @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
            </div>
        </div>


        <div class="w-full space-y-4" v-if="selectedRole == 'Students'">
            <div class="grid grid-cols-5 gap-5">
                <UFormField label="Search" required>
                    <UInput placeholder="Search by name or student ID" v-model="searchQuery" class="w-full"
                        color="error" />
                </UFormField>
                <UFormField label="Academic Year" required>
                    <USelect placeholder="Select Academic Year" :items="itemsyear" v-model="selectedYear" class="w-full"
                        color="error" />
                </UFormField>
                <UFormField label="Semester" required>
                    <USelect placeholder="Select Semester" :items="itemssemesters" v-model="selectedSemester"
                        class="w-full" color="error" />
                </UFormField>
                <UFormField label="School" required>
                    <USelectMenu placeholder="Select School" :items="itemsSchools" v-model="selectedSchool"
                        class="w-full" color="error" />
                </UFormField>
                <UFormField label="Major" class="w-full">
                    <USelectMenu placeholder="Select Major" :items="itemsMajors" v-model="selectedMajor" class="w-full"
                        color="error" />
                </UFormField>
            </div>

            <UTable ref="table" v-model:pagination="pagination" :data="studentData" :columns="studentTableColumns"
                sticky :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
                class="flex-1 rounded-2xl border-2 border-gray-300 mt-5 "
                :ui="{ 'thead': 'bg-gray-50 text-xl font-bold' }" />
            <div class="flex justify-between">
                <h1 class="text-gray-600 font-medium ">Total {{ selectedRole }}:
                    {{ table?.tableApi?.getFilteredRowModel().rows.length }}
                </h1>
                <UPagination activeColor="error"
                    :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                    :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                    :total="table?.tableApi?.getFilteredRowModel().rows.length"
                    @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
            </div>
        </div>

    </NuxtLayout>
</template>