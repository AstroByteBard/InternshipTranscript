<script setup>
const items = ref(['Dashboard', 'Correspondence', 'Competencies', 'Documents', 'Administrator'])
const selectedItems = ref(['System'])
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }" title="Add Role"
        :ui="{ footer: 'justify-end gap-4', 'body': 'space-y-4' }">
        <template #body>
            <UFormField class="w-full" label="Role Name" required>
                <UInput class="w-full" color="error" />
            </UFormField>
            <UFormField class="w-full" label="Control Panel" required>
                <UCard>
                    <UCheckboxGroup :items="items" v-model="selectedItems" color="error" :ui="{ root:'grid grid-cols-2'}" />
                </UCard>
            </UFormField>
        </template>

        <template #footer="{ close }">
            <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
            <UButton label="Save" color="error" />
        </template>
    </UModal>
</template>