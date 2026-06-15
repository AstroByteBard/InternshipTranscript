<template>
    <CRow>
        <CCol>
            <CCard class="table-card border-0 shadow-sm mb-4">
                <div class="table-scroll">
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
                                <div><strong>{{ getOrganizationDisplayName(item) }}</strong></div>
                                <div class="text-muted small">{{ item.organizationAddress || '-' }}</div>
                            </td>
                        </template>

                        <!-- actions -->
                        <template #actions="{ item }">
                            <td class="text-center align-middle">
                                <CButton class="btn-action-icon mr-2" @click="editAdvisor(item)" :title="$t('edit')">
                                    <CIcon name="cil-pencil" />
                                </CButton>
                                <CButton class="btn-action-icon" @click="deleteAdvisor(item)" :title="$t('delete')">
                                    <CIcon name="cil-trash" />
                                </CButton>
                            </td>
                        </template>

                        <!-- Student Combo -->
                        <template #studentCombo="{ item }">
                            <td class="align-middle">
                                <div><strong>{{ getStudentDisplayName(item) }}</strong></div>
                                <div class="text-muted small">{{ item.studentID || '-' }}</div>
                            </td>
                        </template>

                    </CDataTable>
                </div>

                <!-- Footer: stay visible below scroll area -->
                <div class="d-flex justify-content-between align-items-center px-4 py-3 table-footer"
                    style="border-top: 1px solid #f3f4f6;">
                    <div class="text-muted" style="font-size: 13px;">
                        {{ $t('showing_results', {
                            start: tableStartItemAdvisor, end: tableEndItemAdvisor,
                            total: filteredAdvisors.length
                        }) }}
                    </div>
                    <CPagination :activePage.sync="activePageAdvisor" :pages="totalPagesAdvisor" :doubleArrows="false"
                        align="end" class="mb-0 custom-pagination" />
                </div>
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
        }
    },
    methods: {
        editAdvisor(advisor) {
            this.$emit('edit-advisor', advisor);
        },
        deleteAdvisor(item) {
            if (confirm(this.$t('confirm_delete_advisor', { email: item.email }))) {
                this.$store.dispatch("member/advisors/deleteAdvisors", { _id: item._id }).then(() => {
                    this.$emit('refresh');
                    alert(this.$t('advisor_deleted_successfully'));
                }).catch(err => {
                    console.error("Failed to delete advisor:", err);
                    alert(this.$t('failed_to_delete_advisor'));
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
        getStudentDisplayName(item) {
            const isThai = (this.$i18n.locale || 'en') === 'th';
            return isThai ? (item.studentName || '-') : (item.studentNameEn || item.studentName || '-');
        },
        getOrganizationDisplayName(item) {
            const isEnglish = (this.$i18n.locale || 'en') === 'en';
            const englishValue = item.studentCompany || item.organizationName || '-';
            const thaiValue = item.organizationName || item.studentCompany || '-';
            return isEnglish ? englishValue : thaiValue;
        },
    },
    computed: {
        advisorFields() {
            return [
                { key: 'organizationCombo', label: this.$t('organisation_info') },
                { key: 'province', label: this.$t('province') },
                { key: 'email', label: this.$t('evaluator_email') },
                { key: 'studentCombo', label: this.$t('student_name_id') },
                { key: 'actions', label: this.$t('actions'), _classes: 'text-center', sorter: false, filter: false },
            ];
        },
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
    min-width: 980px;
}

/* Keep cells single-line and truncate with ellipsis like Correspondence table */
::v-deep .custom-table tbody td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 900px) {

    ::v-deep .custom-table thead th:nth-child(1),
    ::v-deep .custom-table tbody td:nth-child(1) {
        width: 50%;
    }

    ::v-deep .custom-table thead th:nth-child(3),
    ::v-deep .custom-table tbody td:nth-child(3) {
        width: 30%;
    }

    ::v-deep .custom-table thead th:nth-child(4),
    ::v-deep .custom-table tbody td:nth-child(4) {
        width: 30%;
    }
}

.table-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 10px;
    /* reserve space so scrollbar doesn't overlap content */
    scrollbar-gutter: stable;
    /* keep layout stable when scrollbar appears */
    -webkit-overflow-scrolling: touch;
}

/* show a thin scrollbar on WebKit browsers for better visibility */
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