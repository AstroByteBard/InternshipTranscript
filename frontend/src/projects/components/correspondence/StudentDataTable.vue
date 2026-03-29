<template>
    <CCard class="table-card border-0 shadow-sm mb-4">
        <CDataTable class="custom-table mb-0" :items="paginatedItems" :fields="fields" :pagination="false" hover>

            <!-- Status Column -->
            <template #sendStatus="{ item }">
                <td class="text-center">
                    <span :class="[
                        'status-pill',
                        {
                            'status-pending': item.sendStatus === 'PENDING',
                            'status-replied': item.sendStatus === 'SENT',
                            'status-closed': item.sendStatus === 'FAILED'
                        }
                    ]">
                        <CIcon :name="getStatusIcon(item.sendStatus)" size="sm" class="mr-1" />
                        {{ formatSendStatus(item.sendStatus) }}
                    </span>
                </td>
            </template>

            <!-- Actions Column -->
            <template #actions="{ item }">
                <td class="text-center">
                    <CButton class="btn-action-icon mr-2" @click="$emit('send-email', item)" title="Send Email">
                        <CIcon name="cil-envelope-closed" />
                    </CButton>
                    <CButton class="btn-action-icon" @click="$emit('view-details', item)" title="View Details">
                        <CIcon name="cil-eye" />
                    </CButton>
                </td>
            </template>
        </CDataTable>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center px-4 py-3" style="border-top: 1px solid #f3f4f6;">
            <div class="text-muted" style="font-size: 13px;">
                Showing {{ tableStartItem }} to {{ tableEndItem }} of {{ totalItems }} results
            </div>
            <CPagination :activePage.sync="currentPage" :pages="totalPages" :doubleArrows="false" align="end"
                class="mb-0 custom-pagination" />
        </div>
    </CCard>
</template>

<script>
export default {
    name: 'StudentDataTable',
    props: {
        items: { type: Array, required: true },
        itemsPerPage: { type: Number, default: 5 },
        activePage: { type: Number, default: 1 }
    },
    data() {
        return {
            fields: [
                { key: 'id', label: 'ID', _style: 'min-width: 100px' },
                { key: 'student', label: 'STUDENT', _style: 'min-width: 100px' },
                { key: 'schoolName', label: 'SCHOOL NAME', _style: 'min-width: 300px' },
                { key: 'programName', label: 'PROGRAM NAME', _style: 'min-width: 300px' },
                { key: 'academicYear', label: 'ACADEMIC YEAR', _style: 'min-width: 100px' },
                { key: 'sendStatus', label: 'STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ]
        }
    },
    computed: {
        currentPage: {
            get() { return this.activePage },
            set(value) { this.$emit('update:active-page', value) }
        },
        totalItems() {
            return this.items.length;
        },
        totalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage) || 1;
        },
        paginatedItems() {
            const start = (this.activePage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.items.slice(start, end);
        },
        tableStartItem() {
            if (this.totalItems === 0) return 0;
            return ((this.activePage - 1) * this.itemsPerPage) + 1;
        },
        tableEndItem() {
            const end = this.activePage * this.itemsPerPage;
            return end > this.totalItems ? this.totalItems : end;
        }
    },
    methods: {
        getStatusIcon(status) {
            switch (status) {
                case 'SENT': return 'cil-check-circle'
                case 'FAILED': return 'cil-warning'
                case 'PENDING': return 'cil-clock'
                default: return 'cil-clock'
            }
        },
        formatSendStatus(status) {
            return status.charAt(0) + status.slice(1).toLowerCase()
        }
    }
}
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

/* Status Pills */
.status-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
}

.status-pending {
    background-color: #fef9c3;
    color: #a16207;
}

.status-replied {
    background-color: #dcfce7;
    color: #166534;
}

.status-closed {
    background-color: #f3f4f6;
    color: #4b5563;
}

/* Action Buttons */
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

/* Pagination Styling */
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
</style>