<script setup>
const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(["update:modelValue"])

const close = () => emit("update:modelValue", false)
</script>

<template>
  <UModal
    teleport-to="body"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Download CSV"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Simple Modal</h2>
      <UButton icon="i-lucide-x" variant="ghost" @click="close" />
    </div>

    <!-- Content -->
    <p class="text-gray-600">This is a simple modal with static content.</p>

    <!-- Footer -->
    <div class="flex justify-end gap-3 mt-6">
      <UButton color="neutral" @click="close">Close</UButton>
    </div>
  </UModal>
</template>
