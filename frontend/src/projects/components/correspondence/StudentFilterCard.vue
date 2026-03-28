<template>
    <CCard class="mb-4 filter-card">
        <CCardBody class="p-3">
            <CRow class="align-items-center mb-3">
                <CCol md="5">
                    <div class="search-input-wrapper">
                        <CIcon name="cil-search" class="search-icon" />
                        <input type="text" class="form-control search-input"
                            placeholder="Search by student name or ID..." :value="searchQuery"
                            @input="updateSearchQuery($event.target.value)" />
                    </div>
                </CCol>
                <CCol md="7" class="d-flex justify-content-end align-items-center">
                    <CButton class="btn-filter-action mr-2" @click="$emit('send-email-school')">
                        <CIcon name="cil-envelope-closed" class="mr-2" /> Send Email School
                    </CButton>
                    <CButton class="btn-filter-action mr-2" @click="$emit('send-email-program')">
                        <CIcon name="cil-envelope-closed" class="mr-2" /> Send Email Program
                    </CButton>
                    <CButton class="btn-filter-action btn-filter-red" @click="toggleFilters">
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
                            <CSelect class="custom-select-ui mb-0" :options="schoolOptions" :value="filters.school"
                                @update:value="updateFilter('school', $event)" placeholder="Select School" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">PROGRAM</label>
                            <CSelect class="custom-select-ui mb-0" :options="programOptions" :value="filters.program"
                                @update:value="updateFilter('program', $event)" placeholder="Select Program" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">ACADEMIC YEAR</label>
                            <CSelect class="custom-select-ui mb-0" :options="academicYearOptions"
                                :value="filters.academicYear" @update:value="updateFilter('academicYear', $event)"
                                placeholder="Select Academic Year" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">STATUS</label>
                            <CSelect class="custom-select-ui mb-0" :options="statusOptions" :value="filters.status"
                                @update:value="updateFilter('status', $event)" placeholder="Select Status" />
                        </CCol>
                    </CRow>
                </div>
            </transition>
        </CCardBody>
    </CCard>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'StudentFilterCard',
    props: {
        // เก็บเฉพาะ props ที่จำเป็นจริงๆ
    },
    data() {
        return {
            showFilters: false,
            searchQuery: '',
            filters: {
                school: null,
                program: null,
                academicYear: null,
                status: null
            }
        }
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),

        schoolOptions() {
            const lang = this.$i18n.locale
            return [
                { value: null, label: 'All Schools' },
                ...this.storedSchools.map(item => ({
                    value: item._id,
                    label: item.title.find(t => t.key === lang).value
                }))
            ]
        },

        programOptions() {
            const lang = this.$i18n.locale
            let progs = this.storedPrograms

            // Filter programs by selected school
            if (this.filters.school) {
                progs = progs.filter(p => p.school === this.filters.school)
            }

            return [
                { value: null, label: 'All Programs' },
                ...progs.map(item => ({
                    value: item._id,
                    label: item.title.find(t => t.key === lang).value
                }))
            ]
        },

        academicYearOptions() {
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

        statusOptions() {
            return [
                { value: null, label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'SENT', label: 'Replied' },
                { value: 'FAILED', label: 'Closed' }
            ]
        }
    },
    methods: {
        toggleFilters() {
            this.showFilters = !this.showFilters;
            this.$emit('update:show-filters', this.showFilters);
        },
        updateFilter(key, value) {
            this.filters[key] = value;

            // Reset program when school changes
            if (key === 'school') {
                this.filters.program = null;
            }

            // Emit updated filters to parent
            this.$emit('filters-changed', { ...this.filters });
        },
        updateSearchQuery(value) {
            this.searchQuery = value;
            this.$emit('search-changed', value);
        }
    },
    created() {
        // Load necessary data
        this.$store.dispatch("academic/schools/schools")
        this.$store.dispatch("academic/programs/programs")
        this.$store.dispatch("member/students/students")
    }
}
</script>

<style scoped>
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