<script setup>
import AddRoleModal from '~/components/adminstratorModal/AddRoleModal.vue'

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:shield"
pageTitle.value = "Roles"
pageSubtitle.value = "Access the student list of each faculty and update related documents"

const roleItems = ref([
    { label: 'Admin' },
    { label: 'Student' }
])

const overlay = useOverlay()
const addRoleModal = overlay.create(AddRoleModal)

function openAddRoleModal() {
    addRoleModal.open()
}

</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-actions>
            <UButton icon="lucide:plus" color="error" variant="solid" label="Add Role" @click="openAddRoleModal()" />
        </template>

        <div class="space-y-6">
            <UCard v-for="items in roleItems" :key="items.label" >
                <div class="w-full flex justify-between">
                    <h1> {{ items.label }} </h1>
                    <UButton icon="lucide:ellipsis-vertical" color="neutral" variant="ghost"
                        @click="openAddRoleModal()" />
                </div>
            </UCard>
        </div>

    </NuxtLayout>
</template>