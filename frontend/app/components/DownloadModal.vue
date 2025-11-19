<script setup>
const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

const itemssemesters = ref(['1', '2', '3'])
const selectedSemester = ref('');

const itemsSchools = ref(['School of Information Technology', 'School of Business', 'School of Management'])
const selectedSchool = ref('');

const itemsMajors = ref(['Computer Science', 'Information Systems', 'Business Administration', 'Marketing'])
const selectedMajor = ref('');

</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }" title="Download CSV" :ui="{ footer: 'justify-end' }">
    <template #body>
      <div class="grid grid-rows-4 gap-4">
        <UFormField class="w-full" label="Academic Year" required>
          <USelectMenu placeholder="Select Academic Year" :items="itemsyear" v-model="selectedYear" class="w-full"
            color="error" />
        </UFormField>
        <UFormField class="w-full" label="Semester" required>
          <USelect placeholder="Select Semester" :items="itemssemesters" v-model="selectedSemester" class="w-full"
            color="error" />
        </UFormField>
        <UFormField class="w-full" label="School" required>
          <USelectMenu placeholder="Select School" :items="itemsSchools" v-model="selectedSchool" class="w-full"
            color="error" />
        </UFormField>
        <UFormField class="w-full" label="Majors" required>
          <USelectMenu placeholder="Select Majors" :items="itemsMajors" v-model="selectedMajor" class="w-full"
            color="error" />
        </UFormField>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Download" color="error" />
    </template>
  </UModal>
</template>
