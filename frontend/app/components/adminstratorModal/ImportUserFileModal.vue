<script setup>

</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }" title="Import File" :ui="{ footer: 'justify-end gap-4', 'body': 'space-y-4' }">
        <template #body>
            <UFormField class="w-full" label="Upload CSV File" required>
                <UInput type="file" class="w-full" color="error" />
            </UFormField>
        </template>

        <template #footer="{ close }">
            <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
            <UButton label="Import" color="error" />
        </template>
    </UModal>
</template>