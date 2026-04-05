<template>
    <CRow>
        <CCol>
            <CCard class="table-card border-0 shadow-sm mb-4">
                <CDataTable class="custom-table mb-0" :items="filteredAdvisors" :fields="advisorFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePageAdvisor">

                    <!-- Name Combo -->
                    <template #nameCombo="{ item }">
                        <td class="align-middle">
                            <div><strong>{{ item.nameThai || '-' }}</strong></div>
                            <div class="text-muted small">{{ item.nameEnglish || '-' }}</div>
                        </td>
                    </template>

                    <!-- Organization Combo -->
                    <template #province="{ item }">
                        <td class="align-middle">
                            {{ getProvinceName(item.province) }}
                        </td>
                    </template>

                    <template #organizationCombo="{ item }">
                        <td class="align-middle">
                            <div><strong>{{ item.organizationName || '-' }}</strong></div>
                            <div class="text-muted small">{{ item.organizationAddress || '-' }}</div>
                        </td>
                    </template>

                    <!-- actions -->
                    <template #actions="{ item }">
                        <td class="text-center align-middle">
                            <CButton class="btn-action-icon mr-2" @click="editAdvisor(item)" title="Edit">
                                <CIcon name="cil-pencil" />
                            </CButton>
                            <CButton class="btn-action-icon" @click="deleteAdvisor(item)" title="Delete">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </td>
                    </template>

                    <!-- Student Combo -->
                    <template #studentCombo="{ item }">
                        <td class="align-middle">
                            <div><strong>{{ item.studentName || '-' }}</strong></div>
                            <div class="text-muted small">{{ item.studentID || '-' }}</div>
                        </td>
                    </template>

                    <!-- Under Table Pagination & Info -->
                    <template #under-table>
                        <div class="d-flex justify-content-between align-items-center px-4 py-3"
                            style="border-top: 1px solid #f3f4f6;">
                            <div class="text-muted" style="font-size: 13px;">
                                Showing {{ tableStartItemAdvisor }} to {{ tableEndItemAdvisor }} of {{
                                    filteredAdvisors.length }}
                                results
                            </div>
                            <CPagination :activePage.sync="activePageAdvisor" :pages="totalPagesAdvisor"
                                :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                        </div>
                    </template>

                </CDataTable>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'TableAdminstratorAdviser',
    props: {
        filteredAdvisors: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            activePageAdvisor: 1,
            itemsPerPage: 5,
            advisorFields: [
                { key: 'organizationCombo', label: 'ORGANISATION INFO' },
                { key: 'province', label: 'PROVINCE' },
                { key: 'email', label: 'EVALUATOR\'S EMAIL' },
                { key: 'studentCombo', label: 'STUDENT NAME / ID' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
        }
    },
    methods: {
        editAdvisor(advisor) {
            this.$emit('edit-advisor', advisor);
        },
        deleteAdvisor(item) {
            if (confirm(`Are you sure you want to delete advisor ${item.email}?`)) {
                this.$store.dispatch("member/advisors/deleteAdvisors", item._id).then(() => {
                    this.$emit('refresh');
                    alert(`Advisor deleted successfully!`);
                }).catch(err => {
                    console.error("Failed to delete advisor:", err);
                    alert("Failed to delete advisor.");
                });
            }
        },
        getProvinceName(province) {
            if (!province) return '-';
            if (typeof province === 'string') return province; // Support IDs if not populated
            if (province.title && Array.isArray(province.title)) {
                const lang = this.$i18n.locale || 'en';
                const titleObj = province.title.find(t => t.key === lang) || province.title[0];
                return titleObj ? titleObj.value : '-';
            }
            return '-';
        },
    },
    computed: {
        totalPagesAdvisor() {
            return Math.ceil(this.filteredAdvisors.length / this.itemsPerPage) || 1;
        },
        tableStartItemAdvisor() {
            if (this.filteredAdvisors.length === 0) return 0;
            return ((this.activePageAdvisor - 1) * this.itemsPerPage) + 1;
        },
        tableEndItemAdvisor() {
            const end = this.activePageAdvisor * this.itemsPerPage;
            return end > this.filteredAdvisors.length ? this.filteredAdvisors.length : end;
        },
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