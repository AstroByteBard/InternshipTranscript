<script setup>
import { Doughnut } from 'vue-chartjs';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    options: {
        type: Object,
        default: () => ({ responsive: true })   
    }
});
</script>

<template>
    <Doughnut :data="data" :options="options" />
</template>