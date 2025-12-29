<script setup>
const router = useRouter()
const route = useRoute()
const items = ref([
    {
        title: 'General Competencies',
    },{
        title: 'Specific Competencies',
    },{
        title: 'Suggestions'
    }
])
</script>

<template>
    <NuxtLayout name="admin">
        <template #navbar-actions>
            <UButton icon="lucide:eye-off" color="error" variant="solid" label="End Preview" @click="router.push('/admin/correspondence')" />
        </template>
        <UStepper :items="items" color="error" />
    </NuxtLayout>
</template>