<template>
    <CModal :show.sync="show" title=":title='$t("components.documents_editor_documentdatamodal_vue_database_variables")'" @update:show="$emit('update:show', $event)" size="sm">
        <SharedVariableList maxHeight="400px" :showIcon="true" @select="onSelect" />
        <template #footer>
            <CButton color="secondary" @click="$emit('update:show', false)">{{ $t('components.documents_editor_documentdatamodal_vue_close') }}</CButton>
        </template>
    </CModal>
</template>

<script>
import SharedVariableList from './SharedVariableList.vue';

export default {
    name: 'DocumentDataModal',
    components: {
        SharedVariableList
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        onSelect(value) {
            this.$emit('insert-variable', value);
            this.$emit('update:show', false);
        }
    }
}
</script>

<style scoped>
/* Scoped styles are now managed in SharedVariableList.vue */
</style>
