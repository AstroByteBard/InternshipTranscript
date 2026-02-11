<template>
    <div>
        <CRow>
            <CCol>
                <CButtonGroup class="w-100">
                    <CButton v-for="(value, key) in ['Email Sending', 'Email Template']" :key="key" class="btn-tab"
                        :class="{ 'active': value === selected }" @click="selected = value">
                        {{ value }}
                    </CButton>
                </CButtonGroup>
            </CCol>
        </CRow>

        <div v-if="selected === 'Email Sending'">
            <div v-if="!selectedProgram">
                <CRow class="my-3">
                    <CCol>
                        <h6> Schools </h6>
                        <CDropdown :togglerText="selectionSchool ? selectionSchool.label : 'Select School'"
                            addTogglerClasses="w-100" color="secondary">
                            <CDropdownItem v-for="SchoolTitle in schools" :key="SchoolTitle._id"
                                @click="selectionSchool = SchoolTitle">
                                {{ SchoolTitle.label }}
                            </CDropdownItem>
                        </CDropdown>
                    </CCol>
                    <CCol>
                        <h6> Academic Year </h6>
                        <CDropdown :togglerText="`${selectionAcademicYear}`" addTogglerClasses="w-100"
                            color="secondary">
                            <CDropdownItem v-for="years in academicYears" :key="years"
                                @click="selectionAcademicYear = years">
                                {{ years }}
                            </CDropdownItem>
                        </CDropdown>
                    </CCol>
                    <CCol>
                        <h6> Semester </h6>
                        <CDropdown :togglerText="`${selectionSemester}`" addTogglerClasses="w-100" color="secondary">
                            <CDropdownItem v-for="sem in semesters" :key="sem" @click="selectionSemester = sem">
                                {{ sem }}
                            </CDropdownItem>
                        </CDropdown>
                    </CCol>
                </CRow>

                <CRow>
                    <CCol>
                        <CDataTable class="custom-table" outlined :items="programsTable" :fields=fields
                            :items-per-page="8" :pagination="{ doubleArrows: false, align: 'end' }">

                            <!-- Send Status -->
                            <template #sendStatus="{ item }">
                                <td class="text-center">
                                    <CBadge :color="sendStatusColor(item.sendStatus)" class="px-3 py-2"
                                        style="font-size: 12px;">
                                        {{ formatSendStatus(item.sendStatus) }}
                                    </CBadge>
                                </td>
                            </template>

                            <!-- Send Email -->
                            <template #sendEmail="{ item }">
                                <td class="text-center">
                                    <CButton size="sm" color="warning" @click="sendEmail(item._id)">
                                        <CIcon name="cil-envelope-closed" />
                                    </CButton>
                                </td>
                            </template>

                            <!-- Advisors -->
                            <template #advisors="{ item }">
                                <td class="text-center">
                                    <CButton size="sm" color="info" @click="selectProgram(item)">
                                        <CIcon name="cil-user" />
                                    </CButton>
                                </td>
                            </template>

                            <!-- Preview -->
                            <template #preview>
                                <td class="text-center">
                                    <CButton size="sm" color="info">
                                        <CIcon name="cil-magnifying-glass" />
                                    </CButton>
                                </td>
                            </template>
                        </CDataTable>
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
    name: 'Advisors',
    components: {
    },
    data() {
        return {
            selected: 'Email Sending',
            selectedProgram: null,
            selectionSchool: null,
            selectionAcademicYear: 2568,
            selectionSemester: 1,
            addEmailModel: null,
            fields: [
                { key: 'programTitle', label: 'Program Name', _style: 'min-width: 300px' },
                { key: 'sendStatus', label: 'Send Status', _classes: 'text-center' },
                { key: 'sendEmail', label: 'Send Email', _classes: 'text-center' },
                { key: 'advisors', label: 'Advisors', _classes: 'text-center' },
                { key: 'preview', label: 'Form Preview', _classes: 'text-center' },
            ],

            title: '',
            template: '',

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
            this.$store.dispatch("email/emailAdviser/email")
        },
        // ... (previous methods)
        sendStatusColor(status) {
            switch (status) {
                case 'SENT': return 'success'
                case 'FAILED': return 'danger'
                case 'PENDING': return 'secondary'
                default: return 'light'
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
            // ... (existing submitForm)
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

            this.$store.dispatch('email/emailAdviser/createEmail', payload)
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
            this.$store.dispatch('email/emailAdviser/updateEmail', payload)
        },

        duplicateEmail(_id) {
            const payload = this.emailAdviser.find(email => email._id === _id)

            delete payload._id
            delete payload.createdAt
            delete payload.updatedAt
            delete payload.__v

            payload.active = false

            this.$store.dispatch('email/emailAdviser/createEmail', payload)
        },

        sendEmail(_id) {
            const payload = {
                "_id": _id,
                "templete": "6973168131640a4d402b0682"
            }
            this.$store.dispatch('email/emailAdviser/sendEmail', payload)
        },
        removeEmail(_id) {
            const payload = {
                "_id": _id,
            }
            this.$store.dispatch('email/emailAdviser/deleteEmail', payload)
        },
    },

    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('email/emailAdviser', ['emailAdviser']),

        programsTable() {
            const lang = this.$i18n.locale
            let source = this.storedPrograms
            if (this.selectionSchool) {
                source = source.filter(program => program.school === this.selectionSchool._id)
            }

            return source.map(item => {

                const foundTitle = item.title.find(t => t.key === lang)
                const title = foundTitle ? foundTitle.value : ''

                return {
                    _id: item._id,
                    programTitle: title,
                    // evaluationStatus: 'Incomplete', 
                    sendStatus: 'PENDING',
                    sendEmail: true,
                    advisors: item.advisors || [],
                    preview: true,
                }
            })
        },

        emailsData() {
            const lang = this.$i18n.locale

            return this.emailAdviser.map(item => {
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
            return this.storedSchools.map(item => ({
                _id: item._id,
                label: item.title.find(t => t.key === lang).value
            }))
        },

        academicYears() {
            const start = 2560
            const current = new Date().getFullYear() + 543  // พ.ศ.
            const years = []
            for (let y = start; y <= current; y++) {
                years.push(y)
            }
            return years.reverse() // ปีล่าสุดขึ้นก่อน
        },

        semesters() {
            return ['1', '2', '3']
        },

        activeEmails() {
            return this.emailsData.filter(email => email.active)
        },

        inactiveEmails() {
            return this.emailsData.filter(email => !email.active)
        }
    },

    watch: {
    }
}

</script>

<style>
.custom-table tbody {
    background: #fff;
}

.custom-table thead th {
    background-color: #8c4646;
    color: #ffffff;
    font-weight: 600;
    text-align: center;
    border: 1px solid #d8dbe0;
    vertical-align: middle;
}

.custom-table tbody td {
    vertical-align: middle;
}

.btn-tab {
    background-color: #fff;
    color: #3c4b64;
    border: solid #d8dbe0;
    padding: 10px;
    transition: all 0.2s ease-in-out;
}

.btn-tab.active {
    background-color: #8c4646 !important;
    color: #fff !important;
    border-color: #8c4646 !important;
}
</style>