<template>
    <div class="variable-list-container">
        <CInput placeholder="Search..." v-model="searchQuery" size="sm" class="mb-3" />

        <div class="data-items-container custom-scrollbar" :style="containerStyle">
            <div v-for="item in filteredItems" :key="item.value" class="data-item p-2 mb-2 text-center" draggable="true"
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
        return {
            searchQuery: '',
            items: [
                { label: 'Name', value: '{StudentName}' },
                { label: 'Student ID', value: '{StudentID}' },
                { label: 'School', value: '{School}' },
                { label: 'Major', value: '{Program}' },
                { label: 'General Competencies', value: '{GeneralCompetencies}' },
                { label: 'Specific Competencies', value: '{SpecificCompetencies}' },
                { label: 'Suggestion', value: '{Suggestion}' },
                { label: 'Academic Year', value: '{AcademyYear}' }
            ]
        }
    },
    computed: {
        containerStyle() {
            return {
                maxHeight: this.maxHeight,
                overflowY: 'auto'
            };
        },
        filteredItems() {
            if (!this.searchQuery) return this.items;
            const q = this.searchQuery.toLowerCase();
            return this.items.filter(item => item.label.toLowerCase().includes(q));
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
