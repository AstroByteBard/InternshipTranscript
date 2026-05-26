<template>
    <div class="variable-list-container">
        <div class="data-items-container custom-scrollbar" :style="containerStyle">
            <div v-for="item in items" :key="item.value" class="data-item p-2 mb-2 text-center" draggable="true"
                @dragstart="onDragStart($event, item)" @click="onClick(item)">
                <div class="d-flex align-items-center justify-content-center">
                    <CIcon v-if="showIcon" name="cil-storage" size="sm" class="mr-2" />
                    {{ item.label }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SharedVariableList',
    props: {
        maxHeight: {
            type: String,
            default: 'none'
        },
        showIcon: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {}
    },
    computed: {
        items() {
            return [
                { label: this.$t('var_student_name') || 'Name', value: '{StudentName}' },
                { label: this.$t('var_student_id') || 'Student ID', value: '{StudentID}' },
                { label: this.$t('var_school') || 'School', value: '{School}' },
                { label: this.$t('var_major') || 'Major', value: '{Program}' },
                { label: this.$t('var_general_comp') || 'General Competencies', value: '{GeneralCompetencies}' },
                { label: this.$t('var_specific_comp') || 'Specific Competencies', value: '{SpecificCompetencies}' },
                { label: this.$t('var_suggestion') || 'Suggestion', value: '{Suggestion}' },
                { label: this.$t('var_academic_year') || 'Academic Year', value: '{AcademyYear}' }
            ]
        },
        containerStyle() {
            return {
                maxHeight: this.maxHeight,
                overflowY: 'auto'
            };
        }
    },
    methods: {
        onDragStart(e, item) {
            e.dataTransfer.setData('text/plain', item.value);
            e.dataTransfer.setData('application/json', JSON.stringify({ type: 'variable', value: item.value }));
            e.dataTransfer.effectAllowed = 'copy';
        },
        onClick(item) {
            this.$emit('select', item.value);
        }
    }
}
</script>

<style scoped>
.data-item {
    border: 1px dashed #cbd5e1;
    border-radius: 20px;
    font-size: 13px;
    color: #475569;
    background-color: #fff;
    cursor: grab;
    transition: all 0.2s ease;
    user-select: none;
}

.data-item:hover {
    border-color: #94a3b8;
    background-color: #f8fafc;
    color: #1e293b;
}

.data-item:active {
    cursor: grabbing;
}
</style>
