<template>
    <CRow>
        <CCol>
            <CCard class="table-card border-0 shadow-sm mb-4">
                <div class="table-scroll">
                    <CDataTable class="custom-table mb-0" :items="filteredStudents" :fields="fields"
                        :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">

                        <template #nameCombo="{ item }">
                            <td class="align-middle">
                                <div><strong>{{ item.primaryName || item.nameThai || item.nameEnglish || '-' }}</strong>
                                </div>
                                <div class="text-muted small">{{ item.secondaryName || item.nameEnglish || item.nameThai
                                    ||
                                    '-' }}</div>
                            </td>
                        </template>

                        <template #emailCompanyCombo="{ item }">
                            <td class="align-middle">
                                <div><strong>{{ item.email || '-' }}</strong></div>
                                <div class="text-muted small">{{ item.company || '-' }}</div>
                            </td>
                        </template>

                        <template #schoolProgram="{ item }">
                            <td class="align-middle">
                                <div><strong>{{ item.primarySchoolName || item.schoolName || '-' }}</strong></div>
                                <div class="text-muted small">{{ item.primaryProgramName || item.programName || '-' }}
                                </div>
                            </td>
                        </template>

                        <template #actions="{ item }">
                            <td class="text-center align-middle">
                                <CButton class="btn-action-icon mr-2" @click="editStudent(item)" :title="$t('edit')">
                                    <CIcon name="cil-pencil" />
                                </CButton>
                                <CButton class="btn-action-icon" @click="deleteStudent(item)" :title="$t('delete')">
                                    <CIcon name="cil-trash" />
                                </CButton>
                            </td>
                        </template>

                    </CDataTable>
                </div>

                <!-- Footer: stay visible below scroll area -->
                <div class="d-flex justify-content-between align-items-center px-4 py-3 table-footer"
                    style="border-top: 1px solid #f3f4f6;">
                    <div class="text-muted" style="font-size: 13px;">
                        {{ $t('showing_results', {
                            start: tableStartItem, end: tableEndItem,
                            total: filteredStudents.length
                        }) }}
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
    name: 'TableAdministrator',
    props: {
        filteredStudents: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            activePage: 1,
            itemsPerPage: 5,
        }
    },
    methods: {
        editStudent(student) {
            this.$emit('edit-student', student);
        },
        deleteStudent(student) {
            const displayName = student.primaryName || student.nameThai || student.nameEnglish || student.studentID || this.$t('student');
            if (confirm(this.$t('confirm_delete_student', { name: displayName }))) {
                this.$store.dispatch("member/students/deleteStudents", { _id: student._id }).then(() => {
                    this.$emit('refresh');
                }).catch(err => {
                    console.error("Failed to delete student:", err);
                    alert(this.$t('failed_to_delete_student'));
                });
            }
        }
    },
    computed: {
        fields() {
            return [
                { key: 'studentID', label: this.$t('id_label') },
                { key: 'nameCombo', label: this.$t('name_label') },
                { key: 'emailCompanyCombo', label: this.$t('email_company') },
                { key: 'schoolProgram', label: this.$t('school_and_program') },
                { key: 'courseName', label: this.$t('course') },
                { key: 'semester', label: this.$t('semester') },
                { key: 'year', label: this.$t('year_short') },
                { key: 'actions', label: this.$t('actions'), _classes: 'text-center', sorter: false, filter: false },
            ];
        },

        totalPages() {
            return Math.ceil(this.filteredStudents.length / this.itemsPerPage) || 1;
        },
        tableStartItem() {
            if (this.filteredStudents.length === 0) return 0;
            return ((this.activePage - 1) * this.itemsPerPage) + 1;
        },
        tableEndItem() {
            const end = this.activePage * this.itemsPerPage;
            return end > this.filteredStudents.length ? this.filteredStudents.length : end;
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