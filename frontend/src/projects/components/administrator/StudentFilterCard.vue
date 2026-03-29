<template>
    <CCard class="mb-4 filter-card">
        <CCardBody class="p-3">
            <CRow class="align-items-center mb-3">
                <CCol md="8">
                    <div class="search-input-wrapper">
                        <CIcon name="cil-search" class="search-icon" />
                        <input type="text" class="form-control search-input" :placeholder="searchPlaceholder"
                            :value="searchValue" @input="$emit('update:search-value', $event.target.value)" />
                    </div>
                </CCol>
                <CCol md="4" class="d-flex justify-content-end align-items-center">
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
                            <CSelect class="custom-select-ui mb-0" :options="academicOptions" :value="filters.academic"
                                @update:value="updateFilter('academic', $event)" placeholder="Select Academic" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">SEMESTER</label>
                            <CSelect class="custom-select-ui mb-0" :options="semesterOptions" :value="filters.semester"
                                @update:value="updateFilter('semester', $event)" placeholder="Select Semester" />
                        </CCol>
                    </CRow>
                </div>
            </transition>
        </CCardBody>
    </CCard>
</template>

<script>
export default {
    name: 'StudentFilterCard',
    props: {
        searchValue: { type: String, default: '' },
        searchPlaceholder: { type: String, default: 'Search by name, ID, or email...' },
        filters: { type: Object, required: true },
        schoolOptions: { type: Array, default: () => [] },
        programOptions: { type: Array, default: () => [] },
        academicOptions: { type: Array, default: () => [] },
        semesterOptions: { type: Array, default: () => [] }
    },
    data() {
        return {
            showFilters: false
        }
    },
    methods: {
        toggleFilters() {
            this.showFilters = !this.showFilters;
        },
        updateFilter(key, value) {
            this.$emit('update:filters', { ...this.filters, [key]: value });
        }
    }
}
</script>

<style scoped>
/* Filter Card Styles */
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