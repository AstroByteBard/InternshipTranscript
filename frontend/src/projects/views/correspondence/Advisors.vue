<template>
    <div>
        <CRow>
            <CCol>
            </CCol>
        </CRow>

        <CRow class="mb-3">

            <CCol>
                <h6> Schools </h6>
                <CDropdown 
                :toggler-text="selectionSchool"
                color="secondary"
                >
                <CDropdownItem 
                    v-for="SchoolTitle in schoolsLabels" 
                    :key="SchoolTitle"
                    @click="selectionSchool = SchoolTitle"
                >
                    {{ SchoolTitle }}
                </CDropdownItem>
                </CDropdown>
            </CCol>
                
            <CCol>
                <h6> Academic Year </h6>
                <CDropdown 
                :toggler-text="selectionAcademicYear"
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
                :toggler-text="selectionSemester"
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

            <CCol>
                <CButton block color="danger" class=" items-content-end">Apply</CButton>
            </CCol>

        </CRow>

        <CRow>
            <CCol>
                <CDataTable
                    :hover= true
                    :striped= true
                    :bordered= true
                    :small= true
                    :fixed= true
                    :items="majorsTable"
                    :fields=fields
                >
                <!-- Evaluation Status -->
                <template #evaluationStatus="{ item }">
                    <CBadge
                    :color="item.evaluationStatus === 'COMPLETE' ? 'success' : 'secondary'"
                    shape="rounded-pill"
                    >
                    {{ item.evaluationStatus === 'COMPLETE' ? 'Complete' : 'Incomplete' }}
                    </CBadge>
                </template>

                <!-- Send Status -->
                <template #sendStatus="{ item }">
                    <CBadge
                    :color="sendStatusColor(item.sendStatus)"
                    shape="rounded-pill"
                    >
                    {{ formatSendStatus(item.sendStatus) }}
                    </CBadge>
                </template>

                <!-- Send Email -->
                <template #sendEmail>
                    <CIcon name="cil-envelope-closed" size="lg" />
                </template>

                <!-- Advisors -->
                <template #advisors>
                    <CIcon name="cil-user" size="lg" />
                </template>

                <!-- Preview -->
                <template #preview>
                    <CIcon name="cil-eye" size="lg" />
                </template>
            </CDataTable>
        </CCol>
        </CRow>

        <CPagination
          align="end"
          size="sm"
          :active-page.sync="currentPage"
          :pages="10"
        />
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
            activeTab: 0,
            currentPage: 1,
            selectionSchool: "School of ADT",
            selectionAcademicYear: 2568,
            selectionSemester: 1,
            fields: [
                { key: 'majorName', label: 'Major Name' },
                { key: 'evaluationStatus', label: 'Evaluation Status' },
                { key: 'sendStatus', label: 'Send Status' },
                { key: 'sendEmail', label: 'Send Email' },
                { key: 'advisors', label: 'Advisors' },
                { key: 'preview', label: 'Preview' },
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

    },

    computed: {
        ...mapGetters('academic', ['school','major']),

        majorsTable() {
            const lang = this.$i18n.locale

            return this.major.map(item => {

                const title = item.title.find(t => t.key === lang)

                return {
                majorName: title ? title.value : '-',
                evaluationStatus: item.evaluationStatus, // มาจาก backend
                sendStatus: item.sendStatus,             // มาจาก backend
                sendEmail: true,
                advisors: true,
                preview: true,
                }
            })
        },


        schoolsLabels(){
            const lang = this.$i18n.locale

            return this.school.map(item => {
            const found = item.title.find(t => t.key === lang)
            return found ? found.value : ''
            })
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