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

            <!-- Form In Use -->
            <div class="mt-3">
                <CRow class="mb-3"> 
                    <CCol>
                        <h4>Form in Use </h4> 
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
                                            <span class="text-medium-emphasis small">
                                                / created {{ selectedForm.created }}
                                            </span>
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
                        <CButton color="danger" @click="addGeneralForm = true">
                            <CIcon name="cil-plus" />&nbsp;New
                        </CButton>
                    </CCol>
                </CRow>

                <CRow v-for="form in forms" :key="form.id">
                    <CCol>
                        <CCard class="form-card">
                            <CCardBody class="py-3">
                                <div class="d-flex align-items-center w-100 gap-3">

                                    <!-- center -->
                                    <div class="flex-grow-1 mx-4">
                                        <div class="d-flex align-items-baseline">
                                            <h5 class="mr-1">{{ form.title }}</h5>
                                            <span class="text-medium-emphasis small">
                                                / created {{ form.created }}
                                            </span>
                                        </div>

                                        <p class="mb-0">
                                            {{ form.description }}
                                        </p>
                                    </div>

                                    <!-- right -->
                                    <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                        <template #toggler-content>
                                            <CIcon name="cil-options" />
                                        </template>
                                        <CDropdownItem @click="selectForm(form.id)">Use</CDropdownItem>
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
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'Student',
    components: {
    },
    data() {
          return {
            selected: 'Email Sending',
            selectionSchool: null,
            selectionAcademicYear: 2568,
            selectionSemester: 1,
            selectedFormId: null,
            filteredMajors: [],
            fields: [
                { key: 'majorTitle', label: 'Major' },
                { key: 'evaluationStatus', label: 'Evaluation Status' },
                { key: 'sendStatus', label: 'Send Status' },
                { key: 'sendEmail', label: 'Send Email' },
                { key: 'advisors', label: 'Advisors' },
                { key: 'preview', label: 'Preview' },
            ],
            forms: [
                {
                    id: 1,
                    title: 'Evaluation Form (2021)',
                    created: 'Jun 15, 2021',
                    description: 'Description of the form questions...'
                },
                {
                    id: 2,
                    title: 'Evaluation Form (2022)',
                    created: 'Jul 10, 2022',
                    description: 'Another description...'
                },
                {
                    id: 3,
                    title: 'Evaluation Form (2023)',
                    created: 'Aug 5, 2023',
                    description: 'Another description...'
                },
                {
                    id: 4,
                    title: 'Evaluation Form (2023)',
                    created: 'Aug 5, 2023',
                    description: 'Another description...'
                },
                {
                    id: 5,
                    title: 'Evaluation Form (2023)',
                    created: 'Aug 5, 2023',
                    description: 'Another description...'
                }
            ]
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
            this.$store.dispatch("academic/major")
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

        selectForm(id) {
            this.selectedFormId = id
        },

        search() {
            this.filteredMajors = this.major.filter( major => major.school === this.selectionSchool._id )
        },

    },

    computed: {
        ...mapGetters('academic', ['school','major']),

        selectedForm() {
            return this.forms.find(form => form.id === this.selectedFormId)
        },

        majorsTable() {
            const lang = this.$i18n.locale
            const source = this.filteredMajors.length ? this.filteredMajors : this.major

            return source.map(item => {
                
                const title = item.title.find(t => t.key === lang)

                return {
                majorTitle: title ? title.value : '-',
                evaluationStatus: 'Incomplete', // มาจาก backend
                sendStatus: 'Pending',             // มาจาก backend
                sendEmail: true,
                advisors: true,
                preview: true,
                }
            })
        },


        schools(){
            const lang = this.$i18n.locale
            return this.school.map(item => ({
                _id: item._id,
                label: item.title.find(t => t.key === lang)?.value
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