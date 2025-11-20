<script setup>
const props = defineProps({
    context: {
        type: String,
        required: false,
    }
})
const Username = ref('');
const Email = ref('');
const Department = ref('');
const Password = ref('');
</script>

<template>
    <UModal :close="{ onClick: () => emit('close', false) }" :title="`Manual ${ context }`" :ui="{ footer: 'justify-end gap-4', 'body': 'space-y-4' }">
        
        <template #body>
            <UFormField class="w-full" label="Username" required>
                <UInput v-model="Username" class="w-full" color="error" />
            </UFormField>
            <UFormField class="w-full" label="Email" required>
                <UInput v-model="Email" class="w-full" color="error" />
            </UFormField>
            <UFormField class="w-full" label="Department" required>
                <UInput v-model="Department" class="w-full" color="error" />
            </UFormField>
            <UFormField class="w-full" label="Password" required>
                <UInput v-model="Password" type="password" class="w-full" color="error" />
            </UFormField>
        </template>

        <template #footer="{ close }">
            <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
            <UButton label="Save" color="error" />
        </template>
    </UModal>
</template>