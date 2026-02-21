<template>
    <div>
        <CRow class="mb-4 align-items-center">
            <CCol md="6">
                <div class="custom-segmented-control">
                    <CButtonGroup class="w-100 h-100">
                        <CButton v-for="(value, key) in ['StudentData', 'Email Template']" :key="key"
                            class="segment-btn font-weight-bold" :class="{ 'active': value === selected }"
                            @click="selected = value">
                            {{ value }}
                        </CButton>
                    </CButtonGroup>
                </div>
            </CCol>
            <CCol md="6" class="d-flex justify-content-end">
                <CButton class="btn-filter-action mr-2">
                    <CIcon name="cil-file" class="mr-2" /> PreviewForm
                </CButton>
                <CButton class="btn-filter-action btn-filter-red">
                    <CIcon name="cil-envelope-open" class="mr-2" /> PreviewEmail
                </CButton>
            </CCol>
        </CRow>

        <div v-if="selected === 'StudentData'">
            <div v-if="!selectedProgram">
                <CCard class="mb-4 filter-card">
                    <CCardBody class="p-3">
                        <CRow class="align-items-center mb-3">
                            <CCol md="5">
                                <div class="search-input-wrapper">
                                    <CIcon name="cil-search" class="search-icon" />
                                    <input type="text" class="form-control search-input"
                                        placeholder="Search by name, ID, or subject..." v-model="searchQuery" />
                                </div>
                            </CCol>
                            <CCol md="7" class="d-flex justify-content-end align-items-center">
                                <CButton class="btn-filter-action mr-2">
                                    <CIcon name="cil-envelope-closed" class="mr-2" /> Send Email School
                                </CButton>
                                <CButton class="btn-filter-action mr-2">
                                    <CIcon name="cil-envelope-closed" class="mr-2" /> Send Email Program
                                </CButton>
                                <CButton class="btn-filter-action btn-filter-red" @click="showFilters = !showFilters">
                                    <CIcon name="cil-filter" class="mr-2" /> Filters
                                </CButton>
                            </CCol>
                        </CRow>

                        <transition name="slide">
                            <div v-show="showFilters">
                                <hr class="filter-divider" />

                                <CRow>
                                    <CCol md="3">
                                        <label class="filter-label">SCHOOL</label>
                                        <CSelect class="custom-select-ui mb-0" :options="schools"
                                            :value.sync="selectionSchool" placeholder="All Schools" />
                                    </CCol>
                                    <CCol md="3">
                                        <label class="filter-label">PROGRAM</label>
                                        <CSelect class="custom-select-ui mb-0" :options="programs"
                                            :value.sync="selectionProgram" placeholder="All Programs" />
                                    </CCol>
                                    <CCol md="3">
                                        <label class="filter-label">ACADEMIC YEAR</label>
                                        <CSelect class="custom-select-ui mb-0" :options="academicYears"
                                            :value.sync="selectionAcademicYear" placeholder="All Years" />
                                    </CCol>
                                    <CCol md="3">
                                        <label class="filter-label">STATUS</label>
                                        <CSelect class="custom-select-ui mb-0" :options="statuses"
                                            :value.sync="selectionStatus" placeholder="All Status" />
                                    </CCol>
                                </CRow>
                            </div>
                        </transition>
                    </CCardBody>
                </CCard>

                <CRow>
                    <CCol>
                        <CCard class="table-card border-0 shadow-sm mb-4">
                            <CDataTable class="custom-table mb-0" :items="programsTable" :fields=fields
                                :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">

                                <!-- Under Table Pagination & Info -->
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

                                <!-- Send Status -->
                                <template #sendStatus="{ item }">
                                    <td class="text-center align-middle">
                                        <div class="status-pill" :class="getStatusClass(item.sendStatus)">
                                            <CIcon :name="getStatusIcon(item.sendStatus)" size="sm" class="mr-1" />
                                            {{ formatSendStatus(item.sendStatus) }}
                                        </div>
                                    </td>
                                </template>

                                <!-- Actions -->
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
            </div>

        </div>

        <div v-if="selected === 'Email Template'">

            <!-- Email In Use -->
            <div class="mt-3">
                <CRow class="mb-3">
                    <CCol>
                        <h4>E-mail Template in Use</h4>
                    </CCol>
                </CRow>

                <div v-if="activeEmails.length > 0">
                    <CRow v-for="email in activeEmails" :key="email._id">
                        <CCol>
                            <CCard class="form-card" accent-color="danger">
                                <CCardBody class="py-3">
                                    <div class="d-flex align-items-center w-100 gap-3">
                                        <div class="flex-grow-1 mx-4">
                                            <h5>{{ email.title }}</h5>
                                            <p>{{ email.description }}</p>
                                            <p class="mb-0">{{ email.updatedAt }}</p>
                                        </div>
                                        <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                            <template #toggler-content>
                                                <CIcon name="cil-options" />
                                            </template>
                                            <CDropdownItem>Edit</CDropdownItem>
                                            <CDropdownItem @click="duplicateEmail(email._id)">Duplicate</CDropdownItem>
                                            <CDropdownItem @click="removeEmail(email._id)">Delete</CDropdownItem>
                                        </CDropdown>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </div>

                <div v-else>
                    <CCard class="py-5 text-center text-muted bg-light border-dashed">
                        <div>No Email Template Is in Use</div>
                    </CCard>
                </div>
            </div>

            <!-- Form In Not Use -->
            <div>
                <CRow class="d-flex align-items-center mb-3">
                    <CCol>
                        <h4>E-mail Template Created</h4>
                    </CCol>

                    <CCol col="auto">
                        <CButton color="danger" @click="addEmailModel = true">
                            <CIcon name="cil-plus" />&nbsp;Add
                        </CButton>
                    </CCol>
                </CRow>

                <div v-if="inactiveEmails.length > 0">
                    <CRow v-for="email in inactiveEmails" :key="email._id">
                        <CCol>
                            <CCard class="form-card">
                                <CCardBody class="py-3">
                                    <div class="d-flex align-items-center w-100 gap-3">
                                        <div class="flex-grow-1 mx-4">
                                            <h5>{{ email.title }}</h5>
                                            <p>{{ email.description }}</p>
                                            <p class="mb-0">{{ email.updatedAt }}</p>
                                        </div>
                                        <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                            <template #toggler-content>
                                                <CIcon name="cil-options" />
                                            </template>
                                            <CDropdownItem @click="useTemplate(email._id)">
                                                Use
                                            </CDropdownItem>
                                            <CDropdownItem>Edit</CDropdownItem>
                                            <CDropdownItem @click="duplicateEmail(email._id)">Duplicate</CDropdownItem>
                                            <CDropdownItem @click="removeEmail(email._id)">Delete</CDropdownItem>
                                        </CDropdown>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </div>

                <div v-else>
                    <CCard class="py-5 text-center text-muted bg-light border-dashed">
                        <div>No Email Template Is Created</div>
                    </CCard>
                </div>
            </div>

        </div>

        <CModal :centered="true" :show.sync="addEmailModel" :close-on-backdrop="true">
            <div>
                <label>
                    Title
                </label>

                <CInput v-model.lazy="title" placeholder="text Title here" />
            </div>
            <div>
                <label>
                    template
                </label>

                <CTextarea v-model.lazy="template" :rows="4" :maxlength="200"
                    placeholder="Description of the form questions written to help user use the correct form" />
                <div class="d-flex justify-content-end">{{ (template || '').length }}/200</div>
            </div>
            <template #header>
                <h6 class="modal-title">New Email Form</h6>
                <CButtonClose @click="addEmailModel = false" class="text-black" />
            </template>
            <template #footer>
                <CButton @click="addEmailModel = false">Close</CButton>
                <CButton @click="createForm" color="danger">Save</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'Students',
    components: {
    },
    data() {
        return {
            selected: 'StudentData',
            selectedProgram: null,
            selectionSchool: null,
            selectionProgram: null,
            selectionAcademicYear: null,
            selectionStatus: null,
            searchQuery: '',
            addEmailModel: null,
            showFilters: false,
            fields: [
                { key: 'id', label: 'ID', _style: 'min-width: 100px' },
                { key: 'student', label: 'STUDENT', _style: 'min-width: 100px' },
                { key: 'schoolName', label: 'SCHOOL NAME', _style: 'min-width: 300px' },
                { key: 'programName', label: 'PROGRAM NAME', _style: 'min-width: 300px' },
                { key: 'academicYear', label: 'ACADEMIC YEAR', _style: 'min-width: 100px' },
                { key: 'sendStatus', label: 'STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],

            title: '',
            template: '',
            activePage: 1,
            itemsPerPage: 5,

        }
    },

    mounted() {

    },

    created() {
        this.onInit();
    },

    beforeDestroy() {

    },

    methods: {
        onInit() {
            this.$store.dispatch("academic/schools/schools")
            this.$store.dispatch("academic/programs/programs")
            this.$store.dispatch("email/emailStudent/email")
            this.$store.dispatch("member/students/students")
        },

        getStatusClass(status) {
            switch (status) {
                case 'SENT': return 'status-replied'
                case 'FAILED': return 'status-closed'
                case 'PENDING': return 'status-pending'
                default: return 'status-pending'
            }
        },
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
        },
        selectProgram(program) {
            this.selectedProgram = program
        },
        clearSelectedProgram() {
            this.selectedProgram = null
        },

        createForm() {
            const payload = {
                "title": [
                    {
                        "key": "th",
                        "value": "ทดสอบ"
                    },
                    {
                        "key": "en",
                        "value": this.title
                    }
                ],
                "description": [
                    {
                        "key": "th",
                        "value": "test"
                    },
                    {
                        "key": "en",
                        "value": "test"
                    }
                ],
                "templete": this.template,
                "active": false,
                "group": "69730cdf31640a4d402b0670"
            }

            this.$store.dispatch('email/emailStudent/createEmail', payload)
                .then(() => {
                    this.addEmailModel = false
                    this.title = ''
                    this.template = ''
                })
        },

        useTemplate(_id) {
            const payload = {
                "_id": _id,
                "active": true,
            }
            this.$store.dispatch('email/emailStudent/updateEmail', payload)
        },

        duplicateEmail(_id) {
            const email = this.emailStudent.find(email => email._id === _id)
            if (email) {
                // Clone the object
                const payload = JSON.parse(JSON.stringify(email))

                // Remove keys that should not be duplicated
                delete payload._id
                delete payload.createdAt
                delete payload.updatedAt
                delete payload.__v

                // Reset status for the new copy
                payload.active = false

                this.$store.dispatch('email/emailStudent/createEmail', payload)
            }
        },

        sendEmail(_id) {
            const payload = {
                "_id": _id,
                "templete": "6973168131640a4d402b0682"
            }
            this.$store.dispatch('email/emailStudent/sendEmail', payload)
        },
        removeEmail(_id) {
            const payload = {
                "_id": _id,
            }
            this.$store.dispatch('email/emailStudent/deleteEmail', payload)
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

            // Filter by School
            if (this.selectionSchool) {
                source = source.filter(student => {
                    const schoolId = student.info && student.info.school && student.info.school._id
                        ? student.info.school._id
                        : (student.info ? student.info.school : null)
                    return schoolId === this.selectionSchool
                })
            }

            // Filter by Program
            if (this.selectionProgram) {
                source = source.filter(student => {
                    const programId = student.info && student.info.program && student.info.program._id
                        ? student.info.program._id
                        : (student.info ? student.info.program : null)
                    return programId === this.selectionProgram
                })
            }

            // Filter by Academic Year
            if (this.selectionAcademicYear) {
                source = source.filter(student => student.info && student.info.year === this.selectionAcademicYear.toString())
            }

            // Filter by Status
            if (this.selectionStatus) {
                source = source.filter(student => {
                    // Status placeholder mapping since backend status for emails doesn't exist on specific students yet
                    const rowStatus = 'PENDING'
                    return rowStatus === this.selectionStatus
                })
            }

            // Text Search filter (Search by Student Name or ID)
            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const query = this.searchQuery.toLowerCase().trim()
                source = source.filter(student => {
                    const getTitle = (titles) => {
                        if (!titles || !Array.isArray(titles)) return 'N/A'
                        const found = titles.find(t => t.key === lang)
                        return found ? found.value : (titles[0] ? titles[0].value : 'N/A')
                    }
                    const name = getTitle(student.name).toLowerCase()
                    const sId = (student.studentID || '').toLowerCase()
                    return name.includes(query) || sId.includes(query)
                })
            }

            return source.map((item, index) => {
                const getTitle = (titles) => {
                    if (!titles || !Array.isArray(titles)) return 'N/A'
                    const found = titles.find(t => t.key === lang)
                    return found ? found.value : (titles[0] ? titles[0].value : 'N/A')
                }

                const studentName = getTitle(item.name)

                const info = item.info || {}

                // If it's a populated object from the backend, use it directly. Otherwise (if string ID), look it up.
                const program = info.program && info.program.title
                    ? info.program
                    : (info.program ? this.storedPrograms.find(p => p._id === info.program) : null)

                const school = info.school && info.school.title
                    ? info.school
                    : (info.school ? this.storedSchools.find(s => s._id === info.school) : null)

                const programName = program ? getTitle(program.title) : 'N/A'
                const schoolName = school ? getTitle(school.title) : 'N/A'

                return {
                    _id: item._id,
                    id: item.studentID || `COR-00${index + 1}`,
                    student: studentName,
                    schoolName: schoolName,
                    programName: programName,
                    academicYear: info.year || 'N/A',
                    semester: info.semester || 'N/A',
                    sendStatus: 'PENDING',
                }
            })
        },

        emailsData() {
            const lang = this.$i18n.locale

            if (!this.emailStudent) return []

            return this.emailStudent.map(item => {
                const title = item.title.find(t => t.key === lang).value
                const description = item.description.find(d => d.key === lang).value

                return {
                    _id: item._id,
                    title: title,
                    description: description,
                    active: item.active,
                    template: item.description,
                    updatedAt: this.moment(item.updatedAt).format('DD/MM/YYYY HH:mm'),
                }
            })
        },

        schools() {
            const lang = this.$i18n.locale
            return [{ value: null, label: 'All Schools' }, ...this.storedSchools.map(item => ({
                value: item._id,
                label: item.title.find(t => t.key === lang).value
            }))]
        },

        programs() {
            const lang = this.$i18n.locale
            let progs = this.storedPrograms

            if (this.selectionSchool) {
                progs = progs.filter(p => p.school === this.selectionSchool)
            }

            return [{ value: null, label: 'All Programs' }, ...progs.map(item => ({
                value: item._id,
                label: item.title.find(t => t.key === lang).value
            }))]
        },

        academicYears() {
            if (!this.storedStudents || this.storedStudents.length === 0) {
                const current = new Date().getFullYear() + 543
                return [{ value: null, label: 'All Years' }, { value: current, label: current.toString() }]
            }

            // Extract all distinct, non-empty years from the student data
            const years = this.storedStudents
                .map(s => s.info && s.info.year ? parseInt(s.info.year) : null)
                .filter(y => y !== null && !isNaN(y))

            // Deduplicate and Sort descending (newest first)
            const uniqueYears = [...new Set(years)].sort((a, b) => b - a)

            return [
                { value: null, label: 'All Years' },
                ...uniqueYears.map(y => ({ value: y, label: y.toString() }))
            ]
        },

        statuses() {
            return [
                { value: null, label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'SENT', label: 'Replied' },
                { value: 'FAILED', label: 'Closed' }
            ]
        },

        semesters() {
            return ['1', '2', '3']
        },

        activeEmails() {
            return this.emailsData.filter(email => email.active)
        },

        inactiveEmails() {
            return this.emailsData.filter(email => !email.active)
        },

        totalPages() {
            return Math.ceil(this.programsTable.length / this.itemsPerPage) || 1
        },
        tableStartItem() {
            if (this.programsTable.length === 0) return 0
            return ((this.activePage - 1) * this.itemsPerPage) + 1
        },
        tableEndItem() {
            const end = this.activePage * this.itemsPerPage
            return end > this.programsTable.length ? this.programsTable.length : end
        }
    },

    watch: {
    }
}

</script>

<style scoped>
.table-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    padding-bottom: 8px;
    /* For pagination spacing */
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

.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
    width: 100%;
    max-width: 300px;
}

.segment-btn {
    background-color: transparent;
    color: #6b7280;
    border: none;
    padding: 7px 18px;
    font-size: 14px;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    box-shadow: none;
}

.segment-btn:hover {
    color: #374151;
    background-color: transparent;
}

.segment-btn.active {
    background-color: #ffffff !important;
    color: #111827 !important;
    /* Dark text for active state */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
    border: none !important;
}

.segment-btn:focus,
.segment-btn.focus {
    box-shadow: none !important;
}

.filter-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff;
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

/* Slide Transition Animations */
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
```