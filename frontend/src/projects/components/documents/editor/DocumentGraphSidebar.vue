<template>
    <CCard class="border-0 shadow-sm h-100">
        <CCardBody class="p-3 d-flex flex-column h-100">
            <h6 class="mb-3 font-weight-bold">Graph</h6>
            
            <CInput
                placeholder="Search..."
                v-model="searchQuery"
                size="sm"
                class="mb-3"
            />

            <div class="graph-items-container flex-grow-1 custom-scrollbar" style="overflow-y: auto;">
                <div 
                    v-for="item in filteredItems" 
                    :key="item.value"
                    class="mb-4"
                >
                    <div class="text-left font-weight-bold mb-2" style="font-size: 13px;">{{ item.label }}</div>
                    <div 
                        class="graph-item p-2 text-center"
                        draggable="true"
                        @dragstart="onDragStart($event, item)"
                        @click="onClick(item)"
                    >
                        <div class="graph-preview-container p-2">
                            <!-- Radar Preview -->
                            <div v-if="item.type === 'radar'" class="radar-mini-preview">
                                <svg viewBox="0 0 100 100" class="w-100 h-100">
                                    <!-- Hexagon grid -->
                                    <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                                    <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                                    <!-- Data areas -->
                                    <polygon points="50,20 80,40 75,65 50,80 25,60 30,35" fill="rgba(255, 99, 71, 0.3)" stroke="rgba(255, 99, 71, 0.6)" stroke-width="1.5"/>
                                    <polygon points="50,15 85,35 80,70 50,85 15,65 20,30" fill="rgba(123, 104, 238, 0.4)" stroke="rgba(123, 104, 238, 0.8)" stroke-width="2"/>
                                </svg>
                            </div>
                            <!-- Bar Preview -->
                            <div v-else class="bar-mini-preview d-flex flex-column justify-content-center px-2">
                                <div v-for="i in 3" :key="i" class="mb-2">
                                    <div class="d-flex justify-content-between mb-1" style="font-size: 6px; font-weight: bold;">
                                        <span>Skill {{i}}</span>
                                        <span>xx%</span>
                                    </div>
                                    <div class="progress-bg" style="height: 3px; background: #f1f5f9; border-radius: 2px; overflow: hidden;">
                                        <div class="progress-fill" :style="{width: (70 + (i*5)) + '%', height: '100%', background: '#dc2626'}"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="position-absolute font-weight-bold text-muted" style="font-size: 9px; background: rgba(255,255,255,0.8); padding: 1px 4px; top: 4px; right: 4px; border-radius: 2px; border: 1px solid #e2e8f0;">{{ item.value }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </CCardBody>
    </CCard>
</template>

<script>
export default {
    name: 'DocumentGraphSidebar',
    data() {
        return {
            searchQuery: '',
            items: [
                { 
                    label: 'General Competencies (Radar)', 
                    value: '{GraphGeneralRadar}',
                    type: 'radar',
                    colorClass: 'text-primary'
                },
                { 
                    label: 'Specific Competencies (Radar)', 
                    value: '{GraphSpecificRadar}',
                    type: 'radar',
                    colorClass: 'text-success'
                },
                { 
                    label: 'General Competencies (Bar)', 
                    value: '{GraphGeneralBar}',
                    type: 'bar',
                    colorClass: 'text-primary'
                },
                { 
                    label: 'Specific Competencies (Bar)', 
                    value: '{GraphSpecificBar}',
                    type: 'bar',
                    colorClass: 'text-success'
                }
            ]
        }
    },
    computed: {
        filteredItems() {
            if (!this.searchQuery) return this.items;
            const q = this.searchQuery.toLowerCase();
            return this.items.filter(item => item.label.toLowerCase().includes(q));
        }
    },
    methods: {
        onDragStart(e, item) {
            e.dataTransfer.setData('text/plain', item.value);
            // We use 'graph-variable' type here to differentiate or just use variable
            e.dataTransfer.setData('application/json', JSON.stringify({ type: 'variable', value: item.value }));
            e.dataTransfer.effectAllowed = 'copy';
        },
        onClick(item) {
            this.$emit('insert-variable', item.value);
        }
    }
}
</script>

<style scoped>

.graph-item {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background-color: #fff;
    cursor: grab;
    transition: all 0.2s ease;
    user-select: none;
    position: relative;
    overflow: hidden;
}

.graph-item:hover {
    border-color: #94a3b8;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.graph-item:active {
    cursor: grabbing;
}

.graph-item:active {
    cursor: grabbing;
}

.graph-preview-container {
    width: 100%;
    height: 120px;
    background-color: #ffffff;
    border-radius: 4px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.radar-mini-preview {
    width: 80px;
    height: 80px;
}

.bar-mini-preview {
    width: 100%;
}
</style>
