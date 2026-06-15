<template>
    <CRow>
        <CCol>
            <CCard class="table-card border-0 shadow-sm mb-4">
                <div class="table-scroll">
                    <CDataTable class="custom-table mb-0" :items="items" :fields="fields" :items-per-page="itemsPerPage"
                        :pagination="false" hover :activePage.sync="activePage">

                        <template #thaiName="{ item }">
                            <td class="align-middle">
                                {{ item.thaiName || '-' }}
                            </td>
                        </template>

                        <template #englishName="{ item }">
                            <td class="align-middle">
                                {{ item.englishName || '-' }}
                            </td>
                        </template>

                        <template #actions="{ item }">
                            <td class="text-center align-middle">
                                <CButton class="btn-action-icon mr-2" @click="$emit('edit', item)" :title="editLabel">
                                    <CIcon name="cil-pencil" />
                                </CButton>
                                <CButton class="btn-action-icon" @click="$emit('delete', item)" :title="deleteLabel">
                                    <CIcon name="cil-trash" />
                                </CButton>
                            </td>
                        </template>

                    </CDataTable>
                </div>

                <div class="d-flex justify-content-between align-items-center px-4 py-3 table-footer"
                    style="border-top: 1px solid #f3f4f6;">
                    <div class="text-muted" style="font-size: 13px;">
                        {{ showingText }}
                    </div>
                    <CPagination :activePage.sync="activePage" :pages="totalPages" :doubleArrows="false" align="end"
                        class="mb-0 custom-pagination" />
                </div>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'SettingsTitleTable',
    props: {
        items: {
            type: Array,
            default: () => []
        },
        countLabel: {
            type: String,
            default: 'items'
        },
        editLabel: {
            type: String,
            default: 'Edit'
        },
        deleteLabel: {
            type: String,
            default: 'Delete'
        }
    },
    data() {
        return {
            activePage: 1,
            itemsPerPage: 5
        };
    },
    computed: {
        fields() {
            return [
                { key: 'thaiName', label: 'ชื่อไทย' },
                { key: 'englishName', label: 'ชื่ออังกฤษ' },
                { key: 'actions', label: 'Action', _classes: 'text-center', sorter: false, filter: false }
            ];
        },
        totalPages() {
            return Math.ceil(this.items.length / this.itemsPerPage) || 1;
        },
        showingText() {
            if (!this.items.length) return `Showing 0 to 0 from 0 ${this.countLabel}`;
            const start = ((this.activePage - 1) * this.itemsPerPage) + 1;
            const end = Math.min(this.activePage * this.itemsPerPage, this.items.length);
            return `Showing ${start} to ${end} from ${this.items.length} ${this.countLabel}`;
        }
    }
};
</script>

<style scoped>
.table-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    padding-bottom: 8px;
}

::v-deep .custom-table table {
    margin-bottom: 0;
    min-width: 980px;
}

::v-deep .custom-table tbody td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.table-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 10px;
    scrollbar-gutter: stable;
    -webkit-overflow-scrolling: touch;
}

::v-deep .table-scroll::-webkit-scrollbar {
    height: 10px;
}

::v-deep .table-scroll::-webkit-scrollbar-thumb {
    background: rgba(107, 114, 128, 0.25);
    border-radius: 9999px;
}

.table-footer {
    background: white;
}

::v-deep .custom-table thead th {
    background-color: #ffffff !important;
    color: #9ca3af !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody td {
    color: #374151 !important;
    font-size: 14px;
    font-weight: 500;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody tr:hover td {
    background-color: #f9fafb !important;
}

::v-deep .custom-table tbody tr:last-child td {
    border-bottom: 1px solid #f3f4f6 !important;
}

::v-deep .custom-pagination {
    margin: 0;
}

::v-deep .custom-pagination .page-item .page-link {
    border: 1px solid #f3f4f6;
    color: #6b7280;
    background-color: white;
    margin: 0 2px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 13px;
    box-shadow: none;
}

::v-deep .custom-pagination .page-item:not(.disabled):hover .page-link {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #374151;
}

::v-deep .custom-pagination .page-item.active .page-link {
    background-color: #ffffff;
    border-color: #d1d5db;
    color: #111827;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

::v-deep .custom-pagination .page-item.disabled .page-link {
    color: #d1d5db;
    background-color: #ffffff;
    border-color: #f3f4f6;
}

.btn-action-icon {
    background-color: transparent !important;
    border: none !important;
    color: #9ca3af !important;
    border-radius: 6px;
    padding: 6px 8px;
    transition: all 0.2s;
    box-shadow: none !important;
}

.btn-action-icon:hover {
    color: #4b5563 !important;
    background-color: #f3f4f6 !important;
}

.btn-action-icon:focus {
    box-shadow: none !important;
}
</style>