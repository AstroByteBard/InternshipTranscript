<script setup>
import { Bar } from 'vue-chartjs';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    options: {
        type: Object,
        default: () => ({ responsive: true , scales: { x: { stacked: true }, y: { stacked: true } } })   
    }
});
</script>

<template>
    <Bar :data="data" :options="options" />
</template>