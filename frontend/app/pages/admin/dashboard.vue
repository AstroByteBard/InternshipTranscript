<script setup>
import { ref } from 'vue';

const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")

pageIcon.value = "lucide:layout-dashboard"
pageTitle.value = "Dashboard"
pageSubtitle.value = "Overview of student evaluation activity"

const showModal = ref(false);

const itemsyear = ref(['2023', '2024', '2025']);
const selectedYear = ref('2025');

const itemssemesters = ref(['1', '2', '3'])
const selectedSemester = ref('');

const itemsSchools = ref([ 'School of Information Technology', 'School of Business', 'School of Management'])
const selectedSchool = ref('');

const itemsDepartments = ref([ 'Computer Science', 'Information Systems', 'Business Administration', 'Marketing', 'Accounting', 'Management'])
const selectedDepartment = ref('');

const dataDepartments = ref([
  { name: 'Marketing', count: 600, NotEvaluation: 200 },
  { name: 'Accounting', count: 400, NotEvaluation: 150 },
  { name: 'Information Systems', count: 800, NotEvaluation: 300 },
  { name: 'Management', count: 500, NotEvaluation: 100 },
  { name: 'Business Administration', count: 1000, NotEvaluation: 250 },
  { name: 'Computer Science', count: 1200, NotEvaluation: 500 },
  { name: 'Finance', count: 700, NotEvaluation: 200 },
  { name: 'Human Resource', count: 450, NotEvaluation: 120 },
  { name: 'Economics', count: 350, NotEvaluation: 80 },
  { name: 'Other', count: 300, NotEvaluation: 50 },
]);

const data = ref([
  { name: 'Total Student', count: 4000 },
  { name: 'Completed Evaluations', count: 2500 },
  { name: 'Incompleted Evaluations', count: 1500 },
]);

const BarChartData = {
  labels: dataDepartments.value.map(dept => dept.name),
  datasets: [
    {
      label: 'Evaluations',
      data: dataDepartments.value.map(dept => dept.count),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
      stack: 'Status'
    },
    {
      label: 'Not Evaluations',
      data: dataDepartments.value.map(dept => dept.NotEvaluation),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 1,
      stack: 'Status'
    }
  ]
}

const DoughnutChartData = {
  labels: data.value.slice(1).map(item => item.name),
  datasets: [
    {
      data: data.value.slice(1).map(item => item.count),
      backgroundColor: ['#10B981', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#DC2626']
    }
  ]
}

</script>

<template>
  <NuxtLayout name="admin">
    <template #navbar-actions>
      <UButton icon="lucide:download" color="error" variant="solid" label="Download CSV" @click="showModal = true" />
    </template>

    <filter class="flex justify-end gap-5">
      <USelect v-model="selectedYear" size="xl" :items="itemsyear" class="w-30" color="error" />
      <USelect v-model="selectedSemester" size="xl" placeholder="Semesters" :items="itemssemesters" color="error" />
      <USelectMenu v-model="selectedSchool" size="xl" placeholder="Schools" :items="itemsSchools" class="w-80" color="error" />
      <USelectMenu v-model="selectedDepartment" size="xl" placeholder="Majors" :items="itemsDepartments" class="w-60" color="error" />
    </filter>

    <header class="grid grid-cols-3 gap-10 mt-5">
      <UCard class="relative" v-for="x in data" :key="x.name">
        <UButton icon="lucide:user" color="neutral" size="xl" class="absolute top-10 right-10" />
        <h2 class="text-lg font-semibold mb-2">{{ x.name }}</h2>
        <p class="text-2xl font-semibold ">{{ x.count }}</p>
      </UCard>
    </header>

    <main class="grid grid-cols-3 gap-10 mt-10">
      <UCard>
        <h2 class="text-lg font-semibold mb-4">Evaluation</h2>
        <DoughnutChart :data="DoughnutChartData" :options="{ responsive: true }" />
      </UCard>
      <UCard class="col-span-2">
        <h2 class="text-lg font-semibold mb-4">School Evaluation</h2>
        <BarChart :data="BarChartData" :options="{ responsive: true }" />
      </UCard>
    </main>

  </NuxtLayout>
</template>