<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    }
})

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }" :title="`Duplicate ${title} Competencies`"
        :ui="{ footer: 'justify-end gap-4' }">
        <template #body>
            <UFormField class="w-full" label="Academic Year" required>
                <USelectMenu placeholder="Select Academic Year" :items="itemsyear" v-model="selectedYear" class="w-full"
                    color="error" />
            </UFormField>
        </template>
        <template #footer="{ close }">
            <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
            <UButton label="Save" color="error" @click="close" />
        </template>
    </UModal>
</template>
