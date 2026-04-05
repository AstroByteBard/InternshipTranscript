<template>
    <div>
        <div v-if="!selectedProgram">
            <CTabs variant="tabs" class="custom-tabs mt-0">
                <CTab title="Student Email List" active>
                    <CRow class="mt-3">
                        <CCol>
                            <CCard class="table-card border-0 shadow-sm mb-4">
                                <CDataTable class="custom-table mb-0" :items="programsTable" :fields="fields"
                                    :items-per-page="itemsPerPage" :pagination="false" hover
                                    :activePage.sync="activePage">
                                    <template #under-table>
                                        <div class="d-flex justify-content-between align-items-center px-4 py-3"
                                            style="border-top: 1px solid #f3f4f6;">
                                            <div class="text-muted" style="font-size: 13px;">
                                                Showing {{ tableStartItem }} to {{ tableEndItem }} of {{
                                                programsTable.length }} results
                                            </div>
                                            <CPagination :activePage.sync="activePage" :pages="totalPages"
                                                :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                                        </div>
                                    </template>
                                    <template #sendStatus="{ item }">
                                        <td class="text-center align-middle">
                                            <div class="status-pill" :class="getStatusClass(item.sendStatus)">
                                                <CIcon :name="getStatusIcon(item.sendStatus)" size="sm" class="mr-1" />
                                                {{ formatSendStatus(item.sendStatus) }}
                                            </div>
                                        </td>
                                    </template>
                                    <template #actions="{ item }">
                                        <td class="text-center align-middle">
                                            <CButton class="btn-action-icon mr-2" @click="sendEmail(item._id)"
                                                title="Send Email">
                                                <CIcon name="cil-envelope-closed" />
                                            </CButton>
                                            <CButton class="btn-action-icon" @click="selectProgram(item)"
                                                title="View Details">
                                                <CIcon name="cil-options" />
                                            </CButton>
                                        </td>
                                    </template>
                                </CDataTable>
                            </CCard>
                        </CCol>
                    </CRow>
                </CTab>

                <CTab title="Email">
                    <div v-if="emailsData.length === 0" class="mt-4">
                        <CCard class="text-center border-0 shadow-sm" style="border-radius: 8px;">
                            <CCardBody class="d-flex flex-column justify-content-center align-items-center"
                                style="min-height: 400px; padding: 3rem;">
                                <div class="mb-3">
                                    <CIcon name="cil-description" style="width: 48px; height: 48px; color: #cbd5e1;" />
                                </div>
                                <h5 class="font-weight-bold mb-2" style="color: #1e293b;">Email Templates</h5>
                                <p class="mb-4"
                                    style="max-width: 450px; font-size: 14px; color: #64748b; line-height: 1.5;">
                                    Manage your standard response templates here. This feature is currently under
                                    development.
                                </p>
                                <CButton color="danger" class="font-weight-bold px-4"
                                    style="border-radius: 6px; padding-top: 8px; padding-bottom: 8px;"
                                    @click="$refs.modalTemplate.openAdd()">
                                    Create New Template
                                </CButton>
                            </CCardBody>
                        </CCard>
                    </div>
                    <div v-else>
                        <CCard class="table-card border-0 shadow-sm mt-4">
                            <CCardHeader
                                class="d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-4 pb-3 px-4">
                                <h5 class="mb-0 font-weight-bold" style="color: #1e293b;">Available Templates</h5>
                                <CButton color="danger" size="sm" class="font-weight-bold px-3 py-2"
                                    style="border-radius: 6px;" @click="$refs.modalTemplate.openAdd()">
                                    <CIcon name="cil-file" class="mr-2" /> Create New Template
                                </CButton>
                            </CCardHeader>
                            <CCardBody class="p-0">
                                <div class="table-responsive">
                                    <table class="table custom-template-table mb-0">
                                        <thead>
                                            <tr>
                                                <th class="pl-4" style="width: 40%;">TEMPLATE DETAILS</th>
                                                <th style="width: 20%;" class="text-center">CREATED DATE</th>
                                                <th style="width: 20%;" class="text-center">ACTIVE STATUS</th>
                                                <th style="width: 20%;" class="text-right pr-4">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="email in emailsData" :key="email._id">
                                                <td class="pl-4">
                                                    <div class="font-weight-bold"
                                                        style="color: #1e293b; font-size: 15px;">{{
                                                        email.title }}</div>
                                                    <div class="text-muted mt-1" style="font-size: 13px;">{{
                                                        email.description }}</div>
                                                </td>
                                                <td class="text-center text-muted" style="font-size: 14px;">
                                                    <CIcon name="cil-clock" size="sm" class="mr-1" /> {{
                                                    email.updatedAt.split(' ')[0]
                                                    }}
                                                </td>
                                                <td class="text-center">
                                                    <div v-if="email.active"
                                                        class="d-inline-flex align-items-center font-weight-bold"
                                                        style="color: #dc2626;">
                                                        <CIcon name="cil-check-circle" class="mr-1"
                                                            style="color: #dc2626; width: 16px; height: 16px;" />
                                                        Active
                                                    </div>
                                                    <div v-else
                                                        class="d-inline-flex align-items-center text-muted cursor-pointer"
                                                        @click="useTemplate(email._id)" title="Click to make active">
                                                        <div class="mr-2"
                                                            style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                                        </div>
                                                        Inactive
                                                    </div>
                                                </td>
                                                <td class="text-right pr-4">
                                                    <CButton variant="ghost" color="secondary" size="sm"
                                                        class="btn-action-icon mr-2" @click="openEditModal(email)"
                                                        title="Edit">
                                                        <CIcon name="cil-pencil" />
                                                    </CButton>
                                                    <CButton variant="ghost" color="secondary" size="sm"
                                                        class="btn-action-icon" @click="removeEmail(email._id)"
                                                        title="Delete">
                                                        <CIcon name="cil-trash" />
                                                    </CButton>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CCardBody>
                        </CCard>
                    </div>
                </CTab>
            </CTabs>
        </div>
        <ModalEmailTemplate ref="modalTemplate" @refresh="loadData" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ModalEmailTemplate from '@/projects/components/Modal/ModalEmailTemplate.vue'

export default {
    name: 'StudentEmailSection',
    components: { ModalEmailTemplate },
    props: {
        searchQuery: { type: String, default: '' },
        school: { type: String, default: null },
        program: { type: String, default: null },
        year: { type: [String, Number], default: null },
        status: { type: String, default: null },
    },
    data() {
        return {
            selectedProgram: null,
            fields: [
                { key: 'id', label: 'ID', _style: 'min-width: 100px' },
                { key: 'student', label: 'STUDENT', _style: 'min-width: 100px' },
                { key: 'schoolName', label: 'SCHOOL NAME', _style: 'min-width: 300px' },
                { key: 'programName', label: 'PROGRAM NAME', _style: 'min-width: 300px' },
                { key: 'academicYear', label: 'ACADEMIC YEAR', _style: 'min-width: 100px' },
                { key: 'sendStatus', label: 'STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            activePage: 1,
            itemsPerPage: 5,
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            this.$store.dispatch('email/emailStudent/email')
            this.$store.dispatch('member/students/students')
        },
        getStatusClass(status) {
            const map = { SENT: 'status-replied', FAILED: 'status-closed', PENDING: 'status-pending' }
            return map[status] ?? 'status-pending'
        },
        getStatusIcon(status) {
            const map = { SENT: 'cil-check-circle', FAILED: 'cil-warning', PENDING: 'cil-clock' }
            return map[status] ?? 'cil-clock'
        },
        formatSendStatus(status) {
            if (!status) return 'Pending'
            return status.charAt(0) + status.slice(1).toLowerCase()
        },
        selectProgram(program) { this.selectedProgram = program },
        openEditModal(email) { this.$refs.modalTemplate.openEdit(email) },
        useTemplate(_id) {
            this.$store.dispatch('email/emailStudent/updateEmail', { _id, active: true })
        },
        sendEmail(_id) {
            const activeTemplate = this.emailsData.find(t => t.active);
            const templateId = activeTemplate ? activeTemplate._id : '6973168131640a4d402b0682'; // Fallback to hardcoded if none active
            return this.$store.dispatch('email/emailStudent/sendEmail', { _id, templete: templateId });
        },
        removeEmail(_id) {
            this.$store.dispatch('email/emailStudent/deleteEmail', { _id })
        },
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('email/emailStudent', ['emailStudent']),
        ...mapGetters('member/students', { storedStudents: 'students' }),

        programsTable() {
            const lang = this.$i18n.locale
            let source = this.storedStudents || []

            if (this.school) {
                source = source.filter(s => {
                    const id = s.info?.school?._id ?? s.info?.school ?? null
                    return id === this.school
                })
            }
            if (this.program) {
                source = source.filter(s => {
                    const id = s.info?.program?._id ?? s.info?.program ?? null
                    return id === this.program
                })
            }
            if (this.year) {
                source = source.filter(s => s.info?.year === this.year.toString())
            }
            if (this.status) {
                source = source.filter(() => 'PENDING' === this.status)
            }
            if (this.searchQuery.trim()) {
                const q = this.searchQuery.toLowerCase().trim()
                const getT = t => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? '' : t ?? '')
                source = source.filter(s =>
                    getT(s.name).toLowerCase().includes(q) || (s.studentID ?? '').toLowerCase().includes(q)
                )
            }

            const getTitle = t => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? 'N/A' : t ?? 'N/A')
            return source.map((item, index) => {
                const info = item.info || {}
                const program = info.program?.title ? info.program : this.storedPrograms.find(p => p._id === info.program) ?? null
                const school = info.school?.title ? info.school : this.storedSchools.find(s => s._id === info.school) ?? null
                return {
                    _id: item._id,
                    id: item.studentID ?? `COR-00${index + 1}`,
                    student: getTitle(item.name),
                    schoolName: school ? getTitle(school.title) : 'N/A',
                    programName: program ? getTitle(program.title) : 'N/A',
                    academicYear: info.year ?? 'N/A',
                    semester: info.semester ?? 'N/A',
                    sendStatus: 'PENDING',
                }
            })
        },

        emailsData() {
            const lang = this.$i18n.locale
            if (!this.emailStudent) return []
            return this.emailStudent.map(item => ({
                _id: item._id,
                title: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '',
                description: item.description?.find?.(d => d.key === lang)?.value ?? item.description ?? '',
                templete: item.templete,
                active: item.active,
                updatedAt: this.moment(item.updatedAt).format('DD/MM/YYYY HH:mm'),
            }))
        },

        schools() {
            const lang = this.$i18n.locale
            return [
                { value: null, label: 'All Schools' },
                ...(this.storedSchools ?? []).map(item => ({ value: item._id, label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '' }))
            ]
        },

        programs() {
            const lang = this.$i18n.locale
            let progs = this.storedPrograms ?? []
            if (this.selectionSchool) progs = progs.filter(p => p.school === this.selectionSchool)
            return [
                { value: null, label: 'All Programs' },
                ...progs.map(item => ({ value: item._id, label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '' }))
            ]
        },

        academicYears() {
            const students = this.storedStudents ?? []
            if (!students.length) {
                const current = new Date().getFullYear() + 543
                return [{ value: null, label: 'All Years' }, { value: current, label: current.toString() }]
            }
            const years = [...new Set(students.map(s => s.info?.year ? parseInt(s.info.year) : null).filter(Boolean))].sort((a, b) => b - a)
            return [{ value: null, label: 'All Years' }, ...years.map(y => ({ value: y, label: y.toString() }))]
        },

        statuses() {
            return [
                { value: null, label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'SENT', label: 'Replied' },
                { value: 'FAILED', label: 'Closed' },
            ]
        },

        totalPages() { return Math.ceil(this.programsTable.length / this.itemsPerPage) || 1 },
        tableStartItem() { return this.programsTable.length === 0 ? 0 : (this.activePage - 1) * this.itemsPerPage + 1 },
        tableEndItem() { return Math.min(this.activePage * this.itemsPerPage, this.programsTable.length) },
    },
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

.filter-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff;
}

::v-deep .custom-tabs .nav-tabs {
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 1rem;
}

::v-deep .custom-tabs .nav-link {
    color: #6b7280;
    font-weight: 600;
    border: none;
    padding: 0.75rem 1.5rem;
    margin-bottom: -2px;
}

::v-deep .custom-tabs .nav-link.active {
    color: #db2777;
    background: transparent;
    border-bottom: 2px solid #db2777;
}

::v-deep .custom-tabs .nav-link:hover:not(.active) {
    color: #374151;
    border-bottom: 2px solid #d1d5db;
}

.custom-template-table thead th {
    background-color: #f8fafc !important;
    color: #64748b !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: 1px solid #f1f5f9 !important;
    border-bottom: 1px solid #f1f5f9 !important;
    padding: 12px 16px !important;
    vertical-align: middle;
}

.custom-template-table tbody td {
    padding: 20px 16px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    vertical-align: middle;
}

.custom-template-table tbody tr:hover td {
    background-color: #f8fafc !important;
}

.cursor-pointer {
    cursor: pointer;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    width: 16px;
    height: 16px;
}

.search-input {
    padding-left: 36px !important;
    border-radius: 6px;
    background-color: #f9fafb;
    border: 1px solid #f3f4f6;
    color: #4b5563;
    font-size: 14px;
}

.search-input:focus {
    background-color: #ffffff;
    border-color: #d1d5db;
    box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.5);
}

.btn-filter-action {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 16px;
    display: inline-flex;
    align-items: center;
}

.btn-filter-action:hover {
    background-color: #f9fafb;
    color: #111827;
}

.btn-filter-red {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.btn-filter-red:hover {
    background-color: #fee2e2;
    color: #b91c1c;
}

.filter-divider {
    border-top: 1px solid #f3f4f6;
    margin: 0 -1rem 1rem -1rem;
}

.filter-label {
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    text-transform: uppercase;
}

.custom-select-ui select {
    background-color: #f9fafb !important;
    border: 1px solid #f3f4f6 !important;
    border-radius: 6px !important;
    color: #4b5563 !important;
    font-size: 14px !important;
}

.custom-select-ui select:focus {
    background-color: #ffffff !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 200px;
    opacity: 1;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
}
</style>
