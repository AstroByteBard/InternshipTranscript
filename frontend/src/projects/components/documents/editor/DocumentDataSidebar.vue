<template>
    <CCard class="border-0 shadow-sm h-100">
        <CCardBody class="p-3 d-flex flex-column h-100">
            <h6 class="mb-3 font-weight-bold">Data</h6>
            <SharedVariableList @select="onSelect" class="flex-grow-1" />
        </CCardBody>
    </CCard>
</template>

<script>
import SharedVariableList from './SharedVariableList.vue';

export default {
    name: 'DocumentDataSidebar',
    components: {
        SharedVariableList
    },
    methods: {
        onSelect(value) {
            this.$emit('insert-variable', value);
        }
    }
}
</script>

<style scoped>
/* Scoped styles are now managed in SharedVariableList.vue */
</style>
