<template>
    <CCard class="mb-4 filter-card">
        <CCardBody class="p-3">
            <CRow class="align-items-center mb-3">
                <CCol md="8">
                    <div class="search-input-wrapper">
                        <CIcon name="cil-search" class="search-icon" />
                        <input type="text" class="form-control search-input"
                            placeholder="Search by name, ID, or email..." v-model="internalSearch" />
                    </div>
                </CCol>
                <CCol md="4" class="d-flex justify-content-end align-items-center">
                    <CButton class="btn-filter-action btn-filter-red ml-2" @click="showFilters = !showFilters">
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
                            <CSelect class="custom-select-ui mb-0" :options="schoolOptions" :value.sync="internalSchool"
                                placeholder="Select School" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">PROGRAM</label>
                            <CSelect class="custom-select-ui mb-0" :options="programOptions"
                                :value.sync="internalProgram" placeholder="Select Program" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">ACADEMIC YEAR</label>
                            <CSelect class="custom-select-ui mb-0" :options="academicOptions"
                                :value.sync="internalAcademic" placeholder="Select Academic" />
                        </CCol>
                        <CCol md="3">
                            <label class="filter-label">Province</label>
                            <CSelect class="custom-select-ui mb-0" :options="provinceOptions"
                                :value.sync="internalProvince" placeholder="Select Province" />
                        </CCol>
                    </CRow>
                </div>
            </transition>
        </CCardBody>
    </CCard>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'FilterAdvisor',
    props: {
        search: { type: String, default: '' },
        school: { type: String, default: '' },
        program: { type: String, default: '' },
        academic: { type: String, default: '' },
        province: { type: String, default: '' }
    },
    data() {
        return {
            showFilters: false
        };
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),

        schoolOptions() {
            if (!this.storedSchools) return [];
            return [
                { value: '', label: 'Select School' },
                ...this.storedSchools.map(s => ({
                    value: s._id,
                    label: s.title.find(t => t.key === 'en')?.value || s.title.find(t => t.key === 'th')?.value || s._id
                }))
            ];
        },
        programOptions() {
            const lang = this.$i18n.locale;
            let source = this.storedPrograms || [];

            if (this.internalSchool) {
                source = source.filter(program => program.school === this.internalSchool);
            }

            return [
                { value: '', label: 'Select Program' },
                ...source.map(item => {
                    const titleObj = item.title.find(t => t.key === lang);
                    return {
                        value: item._id,
                        label: titleObj ? titleObj.value : ''
                    };
                })
            ];
        },
        academicOptions() {
            if (!this.storedAdvisors) return [];
            // Assuming academic year comes from the advisor's student, or the advisor itself
            // Following the pattern from Administrator.vue's formattedAdvisors
            const years = new Set();
            this.storedAdvisors.forEach(adv => {
                if (adv.year) years.add(adv.year);
            });
            return [
                { value: '', label: 'Select Academic' },
                ...Array.from(years).sort().map(y => ({ value: y, label: y }))
            ];
        },
        provinceOptions() {
            const lang = this.$i18n.locale || 'en';
            const provinces = this.$store.getters['setting/province/province'] || [];
            return [
                { value: '', label: 'Select Province' },
                ...provinces.map(p => {
                    const titleObj = (Array.isArray(p.title) ? p.title.find(t => t.key === lang) : null) || (Array.isArray(p.title) ? p.title[0] : null);
                    return {
                        value: p._id,
                        label: titleObj ? titleObj.value : p._id
                    };
                })
            ];
        },
        internalSearch: {
            get() { return this.search; },
            set(val) { this.$emit('update:search', val); }
        },
        internalSchool: {
            get() { return this.school; },
            set(val) { this.$emit('update:school', val); }
        },
        internalProgram: {
            get() { return this.program; },
            set(val) { this.$emit('update:program', val); }
        },
        internalAcademic: {
            get() { return this.academic; },
            set(val) { this.$emit('update:academic', val); }
        },
        internalProvince: {
            get() { return this.province; },
            set(val) { this.$emit('update:province', val); }
        }
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

::v-deep .custom-select-ui select {
    background-color: #f9fafb !important;
    border: 1px solid #f3f4f6 !important;
    border-radius: 6px !important;
    color: #4b5563 !important;
    font-size: 14px !important;
}

::v-deep .custom-select-ui select:focus {
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
