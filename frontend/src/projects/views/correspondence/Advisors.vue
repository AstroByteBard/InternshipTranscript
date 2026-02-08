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
            <!-- Default View: School/Year Filter and Main Table -->
            <div v-if="!selectedMajor">
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
                        <CDataTable class="custom-table" striped outlined :items="majorsTable" :fields=fields
                            :items-per-page="8" :pagination="{ doubleArrows: false, align: 'end' }">
                            <!-- Evaluation Status -->
                            <template #evaluationStatus="{ item }">
                                <td>
                                    <CBadge :color="item.evaluationStatus === 'COMPLETE' ? 'success' : 'secondary'">
                                        {{ item.evaluationStatus === 'COMPLETE' ? 'Complete' : 'Incomplete' }}
                                    </CBadge>
                                </td>
                            </template>

                            <!-- Send Status -->
                            <template #sendStatus="{ item }">
                                <td>
                                    <CBadge :color="sendStatusColor(item.sendStatus)">
                                        {{ formatSendStatus(item.sendStatus) }}
                                    </CBadge>
                                </td>
                            </template>

                            <!-- Send Email -->
                            <template #sendEmail="{ item }">
                                <td>
                                    <CIcon name="cil-envelope-closed" size="lg" @click="sendEmail(item._id)" />
                                </td>
                            </template>

                            <!-- Advisors -->
                            <template #advisors="{ item }">
                                <td>
                                    <CIcon name="cil-user" size="lg" class="cursor-pointer"
                                        @click="selectMajor(item)" />
                                </td>
                            </template>

                            <!-- Preview -->
                            <template #preview>
                                <td>
                                    <CIcon name="cil-magnifying-glass" size="lg" />
                                </td>
                            </template>
                        </CDataTable>
                    </CCol>
                </CRow>
            </div>

            <!-- Detail View: Advisors List -->
            <div v-else>
                <CRow class="mb-3">
                    <CCol>
                        <h6 class="text-muted">
                            <span class="cursor-pointer" @click="clearSelectedMajor">E-mail to Advisors</span>
                            >
                            <span class="text-danger">{{ selectedMajor.majorTitle }}</span>
                        </h6>
                    </CCol>
                </CRow>

                <CRow class="mb-3 align-items-center">
                    <CCol sm="4">
                        <CInput placeholder="Search..." v-model="advisorSearch">
                            <template #prepend-content>
                                <CIcon name="cil-magnifying-glass" />
                            </template>
                        </CInput>
                    </CCol>
                    <CCol sm="4">
                        <CSelect placeholder="Send Status" :options="['All', 'Sent', 'Failed', 'Pending']" />
                    </CCol>
                    <CCol sm="4" class="text-right">
                        <CButton color="danger" class="text-white">
                            <CIcon name="cil-envelope-closed" class="mr-2" /> Resend Email
                        </CButton>
                    </CCol>
                </CRow>

                <CRow>
                    <CCol>
                        <CDataTable class="custom-table" striped outlined :items="selectedMajorAdvisors"
                            :fields="advisorFields" :items-per-page="8"
                            :pagination="{ doubleArrows: false, align: 'end' }">
                            <template #id="{ index }">
                                <td>{{ index + 1 }}</td>
                            </template>
                            <template #resend>
                                <td>
                                    <CIcon name="cil-envelope-closed" size="lg" />
                                </td>
                            </template>
                            <template #status="{ item }">
                                <td>
                                    <CBadge :color="sendStatusColor(item.status)">
                                        {{ formatSendStatus(item.status) }}
                                    </CBadge>
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
                                            <p class="mb-0">{{ email.description }}</p>
                                        </div>
                                        <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                            <template #toggler-content>
                                                <CIcon name="cil-options" />
                                            </template>
                                            <CDropdownItem>Edit</CDropdownItem>
                                            <CDropdownItem>Duplicate</CDropdownItem>
                                            <CDropdownItem>Delete</CDropdownItem>
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
                                            <p class="mb-0">{{ email.description }}</p>
                                        </div>
                                        <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                            <template #toggler-content>
                                                <CIcon name="cil-options" />
                                            </template>
                                            <CDropdownItem @click="useTemplate(email._id)">
                                                Use
                                            </CDropdownItem>
                                            <CDropdownItem>Edit</CDropdownItem>
                                            <CDropdownItem>Duplicate</CDropdownItem>
                                            <CDropdownItem>Delete</CDropdownItem>
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

                <CInput v-model="title" placeholder="text Title here" />
            </div>
            <div>
                <label>
                    template
                </label>

                <CTextarea v-model="template" :rows="4" :maxlength="200"
                    placeholder="Description of the form questions written to help user use the correct form" />
                <div class="d-flex justify-content-end">{{ (template || '').length }}/200</div>
            </div>
            <template #header>
                <h6 class="modal-title">New Email Form</h6>
                <CButtonClose @click="addEmailModel = false" class="text-black" />
            </template>
            <template #footer>
                <CButton @click="addEmailModel = false">Close</CButton>
                <CButton @click="submitForm" color="danger">Save</CButton>
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
            selectionSchool: null,
            selectionAcademicYear: 2568,
            selectionSemester: 1,
            addEmailModel: null,
            fields: [
                { key: 'majorTitle', label: 'Major Name', _style: 'min-width: 300px' },
                { key: 'sendStatus', label: 'Send Status', _classes: 'text-center' },
                { key: 'sendEmail', label: 'Send Email', _classes: 'text-center' },
                { key: 'advisors', label: 'Advisors', _classes: 'text-center' },
                { key: 'preview', label: 'Form Preview', _classes: 'text-center' },
            ],

            title: '',
            template: '',

            selectedMajor: null,
            advisorFields: [
                { key: 'id', label: 'Id', _classes: 'text-center', _style: 'width: 80px' },
                { key: 'email', label: 'Advisors\' E-mail' },
                { key: 'status', label: 'Send Status', _classes: 'text-center' },
                { key: 'resend', label: 'Resend Email', _classes: 'text-center' },
            ],
            advisorSearch: '',
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
            this.$store.dispatch("academic/school"),
                this.$store.dispatch("academic/major"),
                this.$store.dispatch("email/email")
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
        selectMajor(major) {
            this.selectedMajor = major
        },
        clearSelectedMajor() {
            this.selectedMajor = null
        },

        submitForm() {
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
                "activity": false,
                "group": "69730cdf31640a4d402b0670"
            }

            this.$store.dispatch('email/createEmail', payload)
                .then(() => {
                    this.addEmailModel = false
                    this.title = ''
                    this.template = ''
                })
        },

        sendEmail(_id) {
            const payload = {
                "_id": _id,
                "templete": "6973168131640a4d402b0682"
            }
        }
    },

    computed: {
        ...mapGetters('academic', ['school', 'major']),
        ...mapGetters('email', ['emailAdviser']),

        majorsTable() {
            const lang = this.$i18n.locale
            let source = this.major
            if (this.selectionSchool) {
                source = source.filter(major => major.school === this.selectionSchool._id)
            }

            return source.map(item => {

                const foundTitle = item.title.find(t => t.key === lang)
                const title = foundTitle ? foundTitle.value : ''

                return {
                    _id: item._id,
                    majorTitle: title,
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
                    activity: item.activity,
                    template: item.description
                }
            })
        },

        schools() {
            const lang = this.$i18n.locale
            return this.school.map(item => ({
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

        selectedMajorAdvisors() {
            if (!this.selectedMajor) return []

            // If the selected major has real advisor data, map it.
            // Otherwise, return mock data for demonstration purposes as per the UI requirement.
            // Assuming current data structure might not support the full table yet.

            const realAdvisors = this.selectedMajor.advisors || []
            if (realAdvisors.length > 0) {
                return realAdvisors.map(adv => ({
                    email: adv.email || adv, // checking format
                    status: 'SENT' // mock status
                }))
            }

            // Mock Data matching the screenshot
            return [
                { email: 'nuttarwathunkitcharoen@hisense.com', status: 'FAILED' },
                { email: 'apiradee.wa@summitthai.com', status: 'SENT' },
                { email: 'tantai.t@extend-it-resource.com', status: 'SENT' },
                { email: 'worawit.sut@ascendcorp.com', status: 'SENT' },
                { email: 'sarunya@bmsp.tech', status: 'SENT' },
                { email: 'nattapong.anupat@gmail.com', status: 'FAILED' },
                { email: 'vorapol.wong@gmail.com', status: 'FAILED' },
                { email: 'Thiphawan.B@tcc-technology.com', status: 'FAILED' },
            ]
        },

        activeEmails() {
            return this.emailsData.filter(email => email.activity)
        },

        inactiveEmails() {
            return this.emailsData.filter(email => !email.activity)
        }
    },

    watch: {
    }
}

</script>

<style>
.custom-table thead th {
    background-color: #8c4646;
    /* Reddish brown */
    color: #ffffff;
    font-weight: 600;
    text-align: center;
    border: 1px solid #d8dbe0;
    vertical-align: middle;
}

.custom-table thead th:first-child {
    text-align: left;
    padding-left: 20px;
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

.btn-tab:hover {
    background-color: #f0f0f0;
}

.btn-tab.active {
    background-color: #8c4646 !important;
    color: #fff !important;
    border-color: #8c4646 !important;
}
</style>