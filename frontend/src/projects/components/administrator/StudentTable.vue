<template>
    <CCard class="table-card border-0 shadow-sm mb-4">
        <CDataTable class="custom-table mb-0" :items="items" :fields="fields" :items-per-page="itemsPerPage"
            :pagination="false" hover :activePage.sync="currentPage">

            <!-- Under Table Pagination & Info -->
            <template #under-table>
                <div class="d-flex justify-content-between align-items-center px-4 py-3"
                    style="border-top: 1px solid #f3f4f6;">
                    <div class="text-muted" style="font-size: 13px;">
                        Showing {{ tableStartItem }} to {{ tableEndItem }} of {{ items.length }} results
                    </div>
                    <CPagination :activePage.sync="currentPage" :pages="totalPages" :doubleArrows="false" align="end"
                        class="mb-0 custom-pagination" />
                </div>
            </template>

            <!-- Name Combo -->
            <template #nameCombo="{ item }">
                <td class="align-middle">
                    <div><strong>{{ item.nameThai || '-' }}</strong></div>
                    <div class="text-muted small">{{ item.nameEnglish || '-' }}</div>
                </td>
            </template>

            <!-- Email / Company Combo -->
            <template #emailCompanyCombo="{ item }">
                <td class="align-middle">
                    <div><strong>{{ item.email || '-' }}</strong></div>
                    <div class="text-muted small">{{ item.company || '-' }}</div>
                </td>
            </template>

            <!-- School / Program Combo -->
            <template #schoolProgram="{ item }">
                <td class="align-middle">
                    <div><strong>{{ item.schoolName || '-' }}</strong></div>
                    <div class="text-muted small">{{ item.programName || '-' }}</div>
                </td>
            </template>

            <!-- Actions -->
            <template #actions="{ item }">
                <td class="text-center align-middle">
                    <CButton class="btn-action-icon mr-2" @click="$emit('edit', item)" title="Edit">
                        <CIcon name="cil-pencil" />
                    </CButton>
                    <CButton class="btn-action-icon" @click="$emit('delete', item)" title="Delete">
                        <CIcon name="cil-trash" />
                    </CButton>
                </td>
            </template>

        </CDataTable>
    </CCard>
</template>

<script>
export default {
    name: 'StudentTable',
    props: {
        items: { type: Array, required: true },
        itemsPerPage: { type: Number, default: 5 },
        activePage: { type: Number, default: 1 }
    },
    data() {
        return {
            fields: [
                { key: 'studentID', label: 'studentID' },
                { key: 'nameCombo', label: 'NAME' },
                { key: 'emailCompanyCombo', label: 'EMAIL / COMPANY' },
                { key: 'schoolProgram', label: 'SCHOOL / PROGRAM' },
                { key: 'courseName', label: 'COURSE' },
                { key: 'semester', label: 'SEMESTER' },
                { key: 'year', label: 'Year' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ]
        }
    },
    computed: {
        currentPage: {
            get() { return this.activePage },
            set(value) { this.$emit('update:active-page', value) }
        },
        totalPages() {
            return Math.ceil(this.items.length / this.itemsPerPage) || 1;
        },
        tableStartItem() {
            if (this.items.length === 0) return 0;
            return ((this.activePage - 1) * this.itemsPerPage) + 1;
        },
        tableEndItem() {
            const end = this.activePage * this.itemsPerPage;
            return end > this.items.length ? this.items.length : end;
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

/* Action Buttons within DataTable (Edit/Delete) */
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