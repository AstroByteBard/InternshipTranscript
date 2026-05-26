<template>
    <CCard class="mb-4 filter-card">
        <CCardBody class="p-3">
            <CRow class="align-items-center mb-3">
                <CCol md="5">
                    <div class="search-input-wrapper">
                        <CIcon name="cil-search" class="search-icon" />
                        <input type="text" class="form-control search-input"
                            :placeholder="$t('components.correspondence_studentfiltercard_vue_search_by_student_name_')"
                            :value="searchQuery" @input="updateSearchQuery($event.target.value)" />
                    </div>
                </CCol>
                <CCol md="7" class="d-flex justify-content-end align-items-center">
                    <CButton class="btn-filter-action mr-2" @click="$emit('send-email-school')">
                        <CIcon name="cil-envelope-closed" class="mr-2" />{{
                            $t('components.correspondence_studentfiltercard_vue_send_email_school') }}
                    </CButton>
                    <CButton class="btn-filter-action mr-2" @click="$emit('send-email-program')">
                        <CIcon name="cil-envelope-closed" class="mr-2" />{{
                            $t('components.correspondence_studentfiltercard_vue_send_email_program') }}
                    </CButton>
                    <CButton class="btn-filter-action btn-filter-red" @click="toggleFilters">
                        <CIcon name="cil-filter" class="mr-2" />{{
                            $t('components.correspondence_studentfiltercard_vue_filters') }}
                    </CButton>
                </CCol>
            </CRow>

            <transition name="slide">
                <div v-show="showFilters">
                    <hr class="filter-divider" />
                    <CRow>
                        <CCol md="3">
                            <label class="filter-label">{{ $t('components.correspondence_studentfiltercard_vue_school')
                            }}</label>
                            <CSelect class="custom-select-ui mb-0" :options="schoolOptions" :value="filters.school"
                                @update:value="updateFilter('school', $event)"
                                :placeholder="$t('components.correspondence_studentfiltercard_vue_select_school')" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">{{ $t('components.correspondence_studentfiltercard_vue_program')
                            }}</label>
                            <CSelect class="custom-select-ui mb-0" :options="programOptions" :value="filters.program"
                                @update:value="updateFilter('program', $event)"
                                :placeholder="$t('components.correspondence_studentfiltercard_vue_select_program')" />
                        </CCol>
                        <CCol md="2">
                            <label class="filter-label">{{
                                $t('components.correspondence_studentfiltercard_vue_academic_year') }}</label>
                            <CSelect class="custom-select-ui mb-0" :options="academicYearOptions"
                                :value="filters.academicYear" @update:value="updateFilter('academicYear', $event)"
                                :placeholder="$t('components.correspondence_studentfiltercard_vue_select_academic_year')" />
                        </CCol>
                        <CCol md="2">
                            <label class="filter-label">{{ $t('components.correspondence_studentfiltercard_vue_status')
                            }}</label>
                            <CSelect class="custom-select-ui mb-0" :options="statusOptions" :value="filters.status"
                                @update:value="updateFilter('status', $event)"
                                :placeholder="$t('components.correspondence_studentfiltercard_vue_select_status')" />
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
        searchQuery: String,
        filters: Object,
        schoolOptions: Array,
        programOptions: Array,
        academicYearOptions: Array,
        statusOptions: Array
    },
    data() {
        return {
            showFilters: false
        }
    },
    methods: {
        toggleFilters() {
            this.showFilters = !this.showFilters
        },
        updateSearchQuery(value) {
            this.$emit('update:search-query', value)
        },
        updateFilter(key, value) {
            this.$emit('update:filters', {
                ...this.filters,
                [key]: value
            })
        }
    }
}
</script>

<style scoped>
.filter-card {
    border: none;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border-radius: 8px;
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
}

.search-input {
    padding-left: 40px;
    height: 42px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-size: 14px;
}

.search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-select-ui {
    height: 38px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-size: 14px;
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

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
    max-height: 200px;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
}
</style>