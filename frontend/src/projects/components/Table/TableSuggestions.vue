<template>
    <CCard class="table-card border-0 shadow-sm mb-4">
        <CDataTable class="custom-table mb-0" :items="items" :fields="fields"
            :items-per-page="itemsPerPage" :pagination="false" hover 
            :activePage="activePage"
            @update:activePage="$emit('update:activePage', $event)">
            
            <!-- Year -->
            <template #year="{ item }">
                <td class="text-center align-middle">
                    <div class="font-weight-bold" style="color: #1e293b;">
                        {{ item.year || '-' }}
                    </div>
                </td>
            </template>

            <!-- Title -->
            <template #title="{ item }">
                <td class="text-center align-middle">
                    <div style="color: #334155; font-weight: 700;">
                        {{ translate(item.title, 'th') }}
                    </div>
                    <!-- Added description under title -->
                    <div class="mt-1 font-italic text-secondary" style="font-size: 11px;">
                        {{ translate(item.description, 'th') }}
                    </div>
                </td>
            </template>

            <!-- Active Status -->
            <template #status="{ item }">
                <td class="text-center align-middle">
                    <div v-if="item.active"
                        class="status-pill status-replied d-inline-flex align-items-center font-weight-bold"
                        style="cursor: pointer;" title="Click to deactivate"
                        @click="$emit('toggle-status', item._id)">
                        <CIcon name="cil-check-circle" class="mr-1" size="sm" />
                        Active
                    </div>
                    <div v-else class="status-pill status-closed d-inline-flex align-items-center text-muted" 
                        style="cursor: pointer;" title="Click to make active" 
                        @click="$emit('toggle-status', item._id)">
                        <div class="mr-2"
                            style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                        </div>
                        Inactive
                    </div>
                </td>
            </template>

            <!-- Suggestion Content Count -->
            <template #suggestionContent="{ item }">
                <td class="text-center align-middle">
                    <CBadge color="secondary" shape="pill" class="px-3 py-2" style="font-size: 11px; background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;">
                        {{ item.config ? item.config.length : 0 }} Items
                    </CBadge>
                </td>
            </template>



            <!-- Actions -->
            <template #actions="{ item }">
                <td class="text-center align-middle">
                    <CButton class="btn-action-icon mr-2" title="Edit" @click="$emit('edit', item)">
                        <CIcon name="cil-pencil" />
                    </CButton>
                    <CButton class="btn-action-icon" title="Delete" @click="$emit('delete', item._id)">
                        <CIcon name="cil-trash" />
                    </CButton>
                </td>
            </template>

            <!-- Pagination logic rendered under table -->
            <template #under-table>
                <div class="d-flex justify-content-between align-items-center px-4 py-3"
                    style="border-top: 1px solid #f3f4f6;">
                    <div class="text-muted" style="font-size: 13px;">
                        Showing {{ tableStart }} to {{ tableEnd }} of {{ items.length }} results
                    </div>
                    <CPagination :activePage="activePage" @update:activePage="$emit('update:activePage', $event)"
                        :pages="totalPages" :doubleArrows="false"
                        align="end" class="mb-0 custom-pagination" />
                </div>
            </template>
        </CDataTable>
    </CCard>
</template>

<script>
export default {
    name: 'TableSuggestions',
    props: {
        items: { type: Array, default: () => [] },
        fields: { type: Array, default: () => [] },
        itemsPerPage: { type: Number, default: 5 },
        activePage: { type: Number, default: 1 },
        totalPages: { type: Number, default: 1 },
        tableStart: { type: Number, default: 0 },
        tableEnd: { type: Number, default: 0 },
        translate: { type: Function, required: true }
    }
}
</script>

<style scoped>
.table-card {
    border-radius: 20px;
    overflow: hidden;
}

.status-pill {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
}

.status-replied {
    background: #ecfdf5;
    color: #059669;
}

.status-closed {
    background: #f1f5f9;
    color: #64748b;
}

.btn-action-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    transition: all 0.2s;
}

.btn-action-icon:hover {
    background: #f1f5f9;
    color: #dc2626;
    border-color: #dc2626;
}

.question-list {
    display: flex;
    flex-direction: column;
}

.question-item {
    padding: 10px 0;
}

.question-item--border {
    border-bottom: 1px solid #f1f5f9;
}

.question-category {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-bottom: 3px;
}

.question-title {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2px;
    line-height: 1.4;
}

.question-subtitle {
    font-size: 13px;
    color: #64748b;
}

::v-deep .custom-table thead th {
    background: #f8fafc;
    border-bottom: 2px solid #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 16px;
}
</style>
