<script setup>
const props = defineProps({
    context: {
        type: String,
        required: true
    }
})

const Competencies_Name = ref('');
const Competencies_Questions = ref('');
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }" :title="`Add ${context} Competencies`" :ui="{ footer: 'justify-end gap-4', 'body': 'space-y-4' }">
        
        <template #body>
            <UFormField class="w-full" :label="`${context} Competencies Name`" required>
                <UInput v-model="Competencies_Name" class="w-full" color="error" />
            </UFormField>
            <UFormField class="w-full" :label="`Set Questions`" required>
                <UInput v-model="Competencies_Questions" class="w-full" color="error" />
            </UFormField>
        </template>

        <template #footer="{ close }">
            <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
            <UButton label="Save" color="error" />
        </template>
    </UModal>
</template>
