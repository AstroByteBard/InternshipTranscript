<script setup>
const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:clipboard-list"
pageTitle.value = "General Competencies"
pageSubtitle.value = "Overview of student skill assessment decided by the university"

</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-actions>
            <UButton icon="lucide:plus" color="error" variant="solid" label="Add"
                @click="showModal = true" />
        </template>
    </NuxtLayout>
</template>