<script setup>
const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:mail"
pageTitle.value = "Correspondence"
pageSubtitle.value = "Send the assessment email and track its activity"

import { getPaginationRowModel } from '@tanstack/vue-table'

const route = useRoute()
const major = route.params.major

const items = ref([
    {
        label: 'correspondence',
        to: '/admin/correspondence'
    }, {
        label: major,
        to: `/admin/correspondence/${major}`,
        class: 'text-red-500'
    }
])

const UBadge = resolveComponent("UBadge");
const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent("UButton");
const table = useTemplateRef('table')
const pagination = ref({
    pageIndex: 0,
    pageSize: 8 
})

// const { data, status } = await useFetch('https://jsonplaceholder.typicode.com/users', {
//     key: 'table-users',
//     transform: (data) => {
//         return (
//             data?.map((user) => ({
//                 ...user,
//                 avatar: { src: `https://i.pravatar.cc/120?img=${user.id}`, alt: `${user.name} avatar` }
//             })) || []
//         )
//     },
//     lazy: true
// })

const data = ref([
    {
        id: 1,
        name: 'Lindsay Walton',
        studentID: '660610123',
        email: 'lindsay.walton@example.com',
        status: 'Incompleted'
    },
    {
        id: 2,
        name: 'Courtney Henry',
        studentID: '660610124',
        email: 'courtney.henry@example.com',
        status: 'Completed'
    },
    {
        id: 3,
        name: 'Tom Cook',
        studentID: '660610125',
        email: 'tom.cook@example.com',
        status: 'Completed'
    },
    {
        id: 4,
        name: 'Whitney Francis',
        studentID: '660610126',
        email: 'whitney.francis@example.com',
        status: 'Completed'
    },
    {
        id: 5,
        name: 'Leonard Krasner',
        studentID: '660610127',
        email: 'leonard.krasner@example.com',
        status: 'Incompleted'
    },
    {
        id: 6,
        name: 'Floyd Miles',
        studentID: '660610128',
        email: 'floyd.miles@example.com',
        status: 'Error'
    },
    {
        id: 7,
        name: 'Emily Johnson',
        studentID: '660610129',
        email: 'emily.johnson@example.com',
        status: 'Completed'
    },
    {
        id: 8,
        name: 'Michael Davis',
        studentID: '660610130',
        email: 'michael.davis@example.com',
        status: 'Incompleted'
    },
    {
        id: 9,
        name: 'Sarah Martinez',
        studentID: '660610131',
        email: 'sarah.martinez@example.com',
        status: 'Completed'
    },
    {
        id: 10,
        name: 'James Wilson',
        studentID: '660610132',
        email: 'james.wilson@example.com',
        status: 'Error'
    },
    {
        id: 11,
        name: 'Jessica Brown',
        studentID: '660610133',
        email: 'jessica.brown@example.com',
        status: 'Completed'
    },
    {
        id: 12,
        name: 'David Garcia',
        studentID: '660610134',
        email: 'david.garcia@example.com',
        status: 'Incompleted'
    },
    {
        id: 13,
        name: 'Ashley Anderson',
        studentID: '660610135',
        email: 'ashley.anderson@example.com',
        status: 'Completed'
    },
    {
        id: 14,
        name: 'Christopher Lee',
        studentID: '660610136',
        email: 'christopher.lee@example.com',
        status: 'Completed'
    },
    {
        id: 15,
        name: 'Amanda Taylor',
        studentID: '660610137',
        email: 'amanda.taylor@example.com',
        status: 'Incompleted'
    },
    {
        id: 16,
        name: 'Daniel Thomas',
        studentID: '660610138',
        email: 'daniel.thomas@example.com',
        status: 'Error'
    },
    {
        id: 17,
        name: 'Jennifer Moore',
        studentID: '660610139',
        email: 'jennifer.moore@example.com',
        status: 'Completed'
    },
    {
        id: 18,
        name: 'Matthew Jackson',
        studentID: '660610140',
        email: 'matthew.jackson@example.com',
        status: 'Incompleted'
    },
    {
        id: 19,
        name: 'Melissa White',
        studentID: '660610141',
        email: 'melissa.white@example.com',
        status: 'Completed'
    },
    {
        id: 20,
        name: 'Joshua Harris',
        studentID: '660610142',
        email: 'joshua.harris@example.com',
        status: 'Completed'
    }
])

const columns = [
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
    }, {
        accessor: 'email',
        header: 'Email Adviser',
        cell: ({ row }) => {
            return row.original.email || '—'
        }
    },
    {
        accessor: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            const color = {
                Completed: 'success',
                Incompleted: 'neutral',
                Error: 'error'
            }[status]
            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => status)
        }
    }, {
        header: 'Resend Email',
        cell: ({ row }) => {
            return h(UButton, { icon: 'lucide:mail', color: 'neutral', variant: 'ghost', onClick: () => { console.log('Send email to', row.original.email) } })
        }
    }
]

</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-actions>
            <UButton icon="lucide:mail" color="error" variant="solid" label="Resend Email" @click="showModal = true" />
        </template>
        <UBreadcrumb :items="items" />
        <div class="w-full space-y-4 pb-4">
            <UTable ref="table" v-model:pagination="pagination" :data="data" :columns="columns" sticky
                :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" class="flex-1 rounded-2xl border-2 border-gray-300 mt-5 "
                :ui="{ 'thead': 'bg-gray-50 text-xl font-bold' }" />
            <div class="flex justify-between" >
                <h1 class="text-gray-600 font-medium ">Total Students: {{ table?.tableApi?.getFilteredRowModel().rows.length }}</h1>
                <UPagination activeColor="error" :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                    :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                    :total="table?.tableApi?.getFilteredRowModel().rows.length"
                    @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
            </div>
        </div>
    </NuxtLayout>
</template>