<template>
    <div>
        <CRow>
            <CCol>
                <CButtonGroup class="w-100">
                    <CButton 
                     v-for="(value, key) in ['Email Sending', 'Email Template']" 
                     :key="key"
                     :color="value === selected ? 'danger' : 'secondary'"
                     :pressed="value === selected"
                     @click="selected = value">
                     {{ value }}
                    </CButton>
                </CButtonGroup>
            </CCol>
        </CRow>

        <div v-if="selected === 'Email Sending'">
            <CRow class="my-3">
                <CCol>
                    <h6> Schools </h6>
                    <CDropdown 
                    :togglerText="selectionSchool ? selectionSchool.label : 'Select School'"
                    addTogglerClasses="w-100"
                    color="secondary"
                    >
                    <CDropdownItem 
                        v-for="SchoolTitle in schools" 
                        :key="SchoolTitle._id"
                        @click="selectionSchool = SchoolTitle"
                    >
                        {{ SchoolTitle.label }}
                    </CDropdownItem>
                    </CDropdown>
                </CCol>
                <CCol>
                    <h6> Academic Year </h6>
                    <CDropdown 
                    :togglerText="`${selectionAcademicYear}`"
                    addTogglerClasses="w-100"
                    color="secondary"
                    >
                    <CDropdownItem 
                        v-for="years in academicYears" 
                        :key="years"
                        @click="selectionAcademicYear = years"
                    >
                        {{ years }}
                    </CDropdownItem>
                    </CDropdown>
                </CCol>
                <CCol>
                    <h6> Semester </h6>
                    <CDropdown 
                    :togglerText="`${selectionSemester}`"
                    addTogglerClasses="w-100"
                    color="secondary"
                    >
                    <CDropdownItem 
                        v-for="sem in semesters" 
                        :key="sem"
                        @click="selectionSemester = sem"
                    >
                        {{ sem }}
                    </CDropdownItem>
                    </CDropdown>
                </CCol>
                <CCol class="d-flex flex-column justify-content-end text-end">
                    <CButton block color="danger" @click="search"> Apply</CButton>
                </CCol>
            </CRow>

            <CRow>
                <CCol>
                    <CDataTable
                        class="custom-table"
                        striped
                        outlined
                        :items="majorsTable"
                        :fields=fields
                        :items-per-page="8"
                        :pagination="{doubleArrows: false, align: 'end'}"
                    >
                        <!-- Evaluation Status -->
                        <template #evaluationStatus="{ item }">
                            <td>
                                <CBadge
                                :color="item.evaluationStatus === 'COMPLETE' ? 'success' : 'secondary'"
                                >
                                {{ item.evaluationStatus === 'COMPLETE' ? 'Complete' : 'Incomplete' }}
                                </CBadge>
                            </td>
                        </template>

                        <!-- Send Status -->
                        <template #sendStatus="{ item }">
                            <td>
                                <CBadge
                                :color="sendStatusColor(item.sendStatus)"
                                >
                                {{ formatSendStatus(item.sendStatus) }}
                                </CBadge>
                            </td>
                        </template>

                        <!-- Send Email -->
                        <template #sendEmail =" { item } ">
                            <td>
                                <CButton @click="sendEmail(item._id)">
                                    <CIcon name="cil-envelope-closed" size="lg"  />
                                </CButton>
                            </td>
                        </template>

                        <!-- Advisors -->
                        <template #detail>
                            <td>
                                <CIcon name="cil-user" size="lg" />
                            </td>
                        </template>

                    </CDataTable>
                </CCol>
            </CRow>
        </div>

        <div v-if="selected === 'Email Template'">

            <!-- Email In Use -->
            <div class="mt-3">
                <CRow class="mb-3"> 
                    <CCol>
                        <h4>Email in Use </h4> 
                    </CCol>
                </CRow>
                <CRow v-for="email in emailsData" :key="email._id">
                    <CCol v-if="email.activity">
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

            <!-- Form In Not Use -->
            <div>
                <CRow class="d-flex align-items-center mb-3">
                    <CCol>
                        <h4> Create Forms</h4>
                    </CCol>

                    <CCol col="auto">
                        <CButton color="danger" @click="addEmailModel = true">
                            <CIcon name="cil-plus" />&nbsp;New
                        </CButton>
                    </CCol>
                </CRow>

                <CRow v-for="email in emailsData" :key="email._id">
                    <CCol v-if="!email.activity">
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
    name: 'Students',
    components: {
    },
    data() {
          return {
            selected: 'Email Sending',
            selectionSchool: null,
            selectionAcademicYear: 2568,
            selectionSemester: 1,
            addEmailModel: null,
            filteredMajors: [],
            fields: [
                { key: 'majorTitle', label: 'Major' },
                { key: 'evaluationStatus', label: 'Evaluation Status' },
                { key: 'sendStatus', label: 'Send Status' },
                { key: 'sendEmail', label: 'Send Email' },
                { key: 'detail', label: 'Students' }
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
            this.$store.dispatch("academic/school"),
            this.$store.dispatch("academic/major"),
            this.$store.dispatch("email/email")
        },
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

        search() {
            this.filteredMajors = this.major.filter( major => major.school === this.selectionSchool._id )
        },

        submitForm() {

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

        sendEmail(_id){
            const activeEmailTemplate = this.emailStudent.find(
                email => email.activity === true
            )

            const payload = {
                "_id": _id ,
                "templete" : activeEmailTemplate._id
            }

            console.log(payload)
            this.$store.dispatch('academic/sendMajor', payload)
        }
    },

    computed: {
        ...mapGetters('academic', ['school','major']),
        ...mapGetters('email',['emailStudent']),

        majorsTable() {
            const lang = this.$i18n.locale
            const source = this.filteredMajors.length ? this.filteredMajors : this.major

            return source.map(item => {
                
                const title = item.title.find(t => t.key === lang).value

                return {
                _id: item._id,
                majorTitle: title,
                evaluationStatus: 'Incomplete', // มาจาก backend
                sendStatus: 'Pending',             // มาจาก backend
                sendEmail: true,
                detail: true
                }
            })
        },

        emailsData() {
            const lang = this.$i18n.locale

            return this.emailStudent.map(item => {
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

        schools(){
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
            return ['1','2','3']
        }
    },

    watch: {
    }
}

</script>

<style>

.custom-table thead th {
    background-color: #343a40; /* สีพื้นหลัง header */
    color: #ffffff;           /* สีตัวอักษร */
    font-weight: 600;
}
</style>