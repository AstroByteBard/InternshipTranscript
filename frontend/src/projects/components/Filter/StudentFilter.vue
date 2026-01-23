<template>
    <div>
        <CCol sm="12" md="7">
            <CRow class="mt-4">
                <CCol sm="12" md="7">
                    <CInput
                    placeholder="Search..." 
                    v-model="filters.search"
                    @keyup.enter="applySearch" />
                </CCol>
                <CCol sm="6" md="2">
                    <CButton 
                    color="primary" 
                    @click="showFilterModal = true" block>
                    <CIcon name="cil-filter" />
                    </CButton>
                </CCol>
                <CCol sm="6" md="3">
                    <CButton 
                    color="success"
                    @click="applySearch" block>
                    <CIcon name="cil-magnifying-glass" />
                    </CButton>
                </CCol>
            </CRow>
        </CCol>

        <!-- Filter Modal -->
        <CModal :show.sync="showFilterModal" :centered="true" size="lg" color="primary">
            <template #header>
                <h6 class="modal-title">
                    <CIcon name="cil-filter" /> Filter Students
                </h6>
                <CButtonClose @click="showFilterModal = false" class="text-white" />
            </template>

            <CCard class="border-0">
                <CCardBody>
                    <CRow>
                        <CCol sm="12" md="6">
                            <CInput label="Academic Year" type="number" v-model="filters.year" />
                        </CCol>

                        <CCol sm="12" md="6">
                            <CSelect label="Semester" :options="semesterOptions" v-model="filters.semester" />
                        </CCol>

                        <CCol sm="12" md="6">
                            <CSelect label="School" :options="schoolOptions" v-model="filters.school" />
                        </CCol>

                        <CCol sm="12" md="6">
                            <CSelect label="Program" :options="majorOptions" v-model="filters.major" />
                        </CCol>

                        <CCol sm="12" md="6">
                            <CSelect label="Course" :options="courseOptions" v-model="filters.course" />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <template #footer>
                <CButton color="secondary" @click="clearFilters">
                    <CIcon name="cil-x" /> Clear
                </CButton>
                <CButton color="primary" @click="applyFiltersAndClose">
                    <CIcon name="cil-check" /> Apply Filter
                </CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
export default {
    name: 'StudentFilter',
    props: {
        schools: {
            type: Array,
            default: () => []
        },
        majors: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            showFilterModal: false,
            filters: {
                search: '',
                school: '',
                major: '',
                course: '',
                year: new Date().getFullYear(),
                semester: ''
            },
            semesterOptions: [
                { label: 'All Semesters', value: '' },
                { label: 'Semester 1', value: 1 },
                { label: 'Semester 2', value: 2 },
                { label: 'Semester 3', value: 3 }
            ],
            courseOptions: [
                { label: 'All Courses', value: '' },
                { label: 'Cooperative Education', value: 1 },
                { label: 'Cooperative Education Semester', value: 2 }
            ]
        }
    },
    computed: {
        schoolOptions() {
            return [
                { label: 'All Schools', value: '' },
                ...this.schools.map(s => ({
                    label: this.getTitleValue(s),
                    value: s._id
                }))
            ]
        },
        majorOptions() {
            return [
                { label: 'All Programs', value: '' },
                ...this.majors.map(m => ({
                    label: this.getTitleValue(m),
                    value: m._id
                }))
            ]
        }
    },
    methods: {

        applySearch() {
            this.$emit('filter', this.filters)
        },

        getTitleValue(obj) {
            if (!obj || !obj.title || !Array.isArray(obj.title)) return '-'
            const titleTh = obj.title.find(t => t.key === 'th')
            const titleEn = obj.title.find(t => t.key === 'en')
            return (titleTh && titleTh.value) || (titleEn && titleEn.value) || '-'
        },
        applyFiltersAndClose() {
            this.$emit('filter', this.filters)
            this.showFilterModal = false
        },
        clearFilters() {
            this.filters = {
                search: '',
                school: '',
                major: '',
                course: '',
                year: new Date().getFullYear(),
                semester: ''
            }
            this.$emit('filter', this.filters)
            this.showFilterModal = false
        }
    }
}
</script>