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
                        <template #sendEmail>
                            <td>
                                <CIcon name="cil-envelope-closed" size="lg" />
                            </td>
                        </template>

                        <!-- Advisors -->
                        <template #advisors>
                            <td>
                                <CIcon name="cil-user" size="lg" />
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

        <div v-if="selected === 'Email Template'">

            <!-- Email In Use -->
            <div class="mt-3">
                <CRow class="mb-3"> 
                    <CCol>
                        <h4>Email in Use </h4> 
                    </CCol>
                </CRow>
                <CRow v-if="selectedForm">
                    <CCol>
                        <CCard class="form-card" accent-color="danger">
                            <CCardBody class="py-3">
                                <div class="d-flex align-items-center w-100 gap-3">

                                    <!-- center -->
                                    <div class="flex-grow-1 mx-4">
                                        <div class="d-flex align-items-baseline">
                                            <h5 class="mr-1">{{ selectedForm.title }}</h5>
                                        </div>

                                        <p class="mb-0">
                                            {{ selectedForm.description }}
                                        </p>
                                    </div>

                                    <!-- right -->
                                    <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                        <template #toggler-content>
                                            <CIcon name="cil-options" />
                                        </template>
                                        <CDropdownItem>Use</CDropdownItem>
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
                    <CCol>
                        <CCard class="form-card">
                            <CCardBody class="py-3">
                                <div class="d-flex align-items-center w-100 gap-3">

                                    <!-- center -->
                                    <div class="flex-grow-1 mx-4">
                                        <div class="d-flex align-items-baseline">
                                            <h5 class="mr-1">{{ email.title }}</h5>
                                            <!-- <span class="text-medium-emphasis small">
                                                / created {{ form.created }}
                                            </span> -->
                                        </div>

                                        <p class="mb-0">
                                            {{ email.description }}
                                        </p>
                                    </div>

                                    <!-- right -->
                                    <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                        <template #toggler-content>
                                            <CIcon name="cil-options" />
                                        </template>
                                        <CDropdownItem @click="selectForm(email._id)">Use</CDropdownItem>
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
                    Description
                </label>

                <CTextarea v-model="description" :rows="4" :maxlength="200"
                    placeholder="Description of the form questions written to help user use the correct form" />
                <div class="d-flex justify-content-end">{{ (description || '').length }}/200</div>
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
            selectedFormId: null,
            addEmailModel: null,
            filteredMajors: [],
            fields: [
                { key: 'majorTitle', label: 'Major' },
                { key: 'evaluationStatus', label: 'Evaluation Status' },
                { key: 'sendStatus', label: 'Send Status' },
                { key: 'sendEmail', label: 'Send Email' },
                { key: 'advisors', label: 'Advisors' },
                { key: 'preview', label: 'Preview' },
            ],

            title: '',
            description: '',

            
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

        selectForm(_id) {
            this.selectedFormId = _id
        },

        search() {
            this.filteredMajors = this.major.filter( major => major.school === this.selectionSchool._id )
        },

        submitForm() {

            const payload = {

            }

            this.$store.dispatch('email/createEmail',)
        }

    },

    computed: {
        ...mapGetters('academic', ['school','major']),
        ...mapGetters('email',['emailAdviser']),

        selectedForm() {
            if (!this.selectedFormId) return null

            const lang = this.$i18n.locale
            const email = this.emailAdviser.find(
                email => email._id === this.selectedFormId
            )


            const title = email.title.find(title => title.key === lang)?.value
            const description = email.description.find(description => description.key === lang)?.value

            return {
                _id: email._id,
                title: title,
                description: description,
                template: email.description
            }
        },

        majorsTable() {
            const lang = this.$i18n.locale
            const source = this.filteredMajors.length ? this.filteredMajors : this.major

            return source.map(item => {
                
                const title = item.title.find(t => t.key === lang).value

                return {
                majorTitle: title,
                evaluationStatus: 'Incomplete', // มาจาก backend
                sendStatus: 'Pending',             // มาจาก backend
                sendEmail: true,
                advisors: true,
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