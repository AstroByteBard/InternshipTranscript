<template>
    <div>
        <CorrespondenceHeader />
        
        <WidgetsCorrespondence 
            :total="totalCount" 
            :pending="pendingCount" 
            :sent="sentCount" 
            :failed="failedCount" 
        />

        <!-- Unified Management Bar -->
        <CCard class="management-card border-0 mb-4 shadow-sm">
            <CCardBody class="p-3">
                <CRow class="align-items-center">
                    <!-- Navigation (Student/Adviser) -->
                    <CCol lg="3" md="4" class="mb-3 mb-md-0">
                        <div class="custom-segmented-control w-100">
                            <CButtonGroup class="w-100 h-100">
                                <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'StudentData' }"
                                    @click="selected = 'StudentData'">
                                    Student
                                </CButton>
                                <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'AdviserData' }"
                                    @click="selected = 'AdviserData'">
                                    Adviser
                                </CButton>
                            </CButtonGroup>
                        </div>
                    </CCol>

                    <!-- Search Bar -->
                    <CCol lg="4" md="8" class="mb-3 mb-md-0">
                        <div class="search-input-wrapper">
                            <CIcon name="cil-search" class="search-icon" />
                            <input type="text" class="form-control modern-search-input"
                                placeholder="Search by name, ID, or subject..." v-model="searchQuery" />
                        </div>
                    </CCol>

                    <!-- Action Buttons -->
                    <CCol lg="5" md="12" class="d-flex justify-content-end align-items-center flex-wrap">
                        <CButton class="btn-modern-action mr-2" @click="sendBulkEmail('school')">
                            <CIcon name="cil-envelope-closed" class="mr-2 text-primary" /> Send Email {{ selected === 'StudentData' ? 'School' : 'Org' }}
                        </CButton>
                        <CButton v-if="selected === 'StudentData'" class="btn-modern-action mr-2" @click="sendBulkEmail('program')">
                            <CIcon name="cil-envelope-closed" class="mr-2 text-primary" /> Send Email Program
                        </CButton>
                        <CButton class="btn-modern-action btn-modern-filter mr-2" @click="showFilters = !showFilters">
                            <CIcon name="cil-filter" class="mr-2" /> Filters
                        </CButton>
                        <CButton class="btn-modern-action btn-modern-red" @click="handlePreview">
                            <CIcon name="cil-envelope-open" class="mr-2" /> Preview
                        </CButton>
                    </CCol>
                </CRow>

                <!-- Expanded Filters -->
                <transition name="slide">
                    <div v-show="showFilters" class="mt-3 pt-3 border-top">
                        <CRow>
                            <CCol md="3">
                                <label class="filter-mini-label">SCHOOL</label>
                                <CSelect 
                                    custom 
                                    class="modern-select-filter mb-0" 
                                    :options="schoolOptions"
                                    :value.sync="filterSchool" 
                                    placeholder="All Schools" 
                                />
                            </CCol>
                            <CCol md="3">
                                <label class="filter-mini-label">PROGRAM</label>
                                <CSelect 
                                    custom 
                                    class="modern-select-filter mb-0" 
                                    :options="programOptions"
                                    :value.sync="filterProgram" 
                                    placeholder="All Programs" 
                                />
                            </CCol>
                            <CCol md="3">
                                <label class="filter-mini-label">ACADEMIC YEAR</label>
                                <CSelect 
                                    custom 
                                    class="modern-select-filter mb-0" 
                                    :options="yearOptions"
                                    :value.sync="filterYear" 
                                    placeholder="All Years" 
                                />
                            </CCol>
                            <CCol md="3">
                                <label class="filter-mini-label">STATUS</label>
                                <CSelect 
                                    custom 
                                    class="modern-select-filter mb-0" 
                                    :options="statusOptions"
                                    :value.sync="filterStatus" 
                                    placeholder="All Status" 
                                />
                            </CCol>
                        </CRow>
                    </div>
                </transition>
            </CCardBody>
        </CCard>

        <!-- Content Area -->
        <div class="content-pannel">
            <StudentEmailSection 
                ref="studentSection"
                v-if="selected === 'StudentData'" 
                :search-query="searchQuery"
                :school="filterSchool"
                :program="filterProgram"
                :year="filterYear"
                :status="filterStatus"
            />

            <AdviserEmailSection 
                ref="adviserSection"
                v-else-if="selected === 'AdviserData'" 
                :search-query="searchQuery"
                :school="filterSchool"
                :program="filterProgram"
                :year="filterYear"
                :status="filterStatus"
            />
        </div>

        <ModalEmailPreview ref="modalPreview" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CorrespondenceHeader from '@/projects/components/Layout/CorrespondenceHeader.vue'
import WidgetsCorrespondence from '@/projects/components/widgets/WidgetsCorrespondence.vue'
import StudentEmailSection from '@/projects/components/Correspondence/StudentEmailSection.vue'
import AdviserEmailSection from '@/projects/components/Correspondence/AdviserEmailSection.vue'
import ModalEmailPreview from '@/projects/components/Modal/ModalEmailPreview.vue'

export default {
    name: 'Correspondence',
    components: {
        CorrespondenceHeader,
        WidgetsCorrespondence,
        StudentEmailSection,
        AdviserEmailSection,
        ModalEmailPreview,
    },
    data() {
        return {
            selected: 'StudentData',
            searchQuery: '',
            showFilters: false,
            filterSchool: null,
            filterProgram: null,
            filterYear: null,
            filterStatus: null,
        }
    },
    created() {
        this.onInit();
    },
    methods: {
        onInit() {
            this.$store.dispatch('member/students/students')
            this.$store.dispatch('member/advisors/advisors')
            this.$store.dispatch('academic/schools/schools')
            this.$store.dispatch('academic/programs/programs')
            this.$store.dispatch('email/emailStudent/email')
            this.$store.dispatch('email/emailAdviser/email')
        },
        async handlePreview() {
            const isStudent = this.selected === 'StudentData';
            const section = isStudent ? this.$refs.studentSection : this.$refs.adviserSection;
            if (!section) return;

            const items = isStudent ? section.programsTable : section.advisersTable;
            if (!items || items.length === 0) {
                alert('No data to preview with.');
                return;
            }

            const activeTemplate = section.emailsData.find(t => t.active);
            if (!activeTemplate) {
                alert('No active template found. Please activate a template first.');
                return;
            }

            // Using first recipient as sample
            this.$refs.modalPreview.open(activeTemplate, items[0], !isStudent);
        },
        async sendBulkEmail(type) {
            const isStudent = this.selected === 'StudentData';
            const section = isStudent ? this.$refs.studentSection : this.$refs.adviserSection;
            
            if (!section) return;

            const items = isStudent ? section.programsTable : section.advisersTable;
            
            if (!items || items.length === 0) {
                alert('No data to send emails to.');
                return;
            }

            if (!confirm(`Are you sure you want to send emails to ${items.length} ${isStudent ? 'students' : 'advisers'}?`)) {
                return;
            }

            // Iterate and send
            for (const item of items) {
                try {
                    await section.sendEmail(item._id);
                } catch (error) {
                    console.error(`Failed to send email to ${item._id}:`, error);
                }
            }
            alert('Bulk email operation completed.');
        }
    },
    computed: {
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),

        totalCount() {
            const list = this.selected === 'StudentData' ? (this.storedStudents || []) : (this.storedAdvisors || []);
            return list.length;
        },
        sentCount() {
            // "Complete" status maps to sentCount widget
            if (this.selected === 'StudentData') {
                return (this.storedStudents || []).filter(s => s.evaluation).length;
            } else {
                return (this.storedAdvisors || []).filter(a => a.student?.evaluation).length;
            }
        },
        pendingCount() {
            return this.totalCount - this.sentCount;
        },
        failedCount() { return 0; },

        schoolOptions() {
            const lang = this.$i18n.locale || 'en';
            return [
                { value: null, label: 'All Schools' },
                ...(this.storedSchools || []).map(item => ({ 
                    value: item._id, 
                    label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '' 
                }))
            ]
        },
        programOptions() {
            const lang = this.$i18n.locale || 'en';
            let progs = this.storedPrograms || [];
            if (this.filterSchool) progs = progs.filter(p => p.school === this.filterSchool);
            return [
                { value: null, label: 'All Programs' },
                ...progs.map(item => ({ 
                    value: item._id, 
                    label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '' 
                }))
            ]
        },
        yearOptions() {
            const students = this.storedStudents || [];
            if (!students.length) return [{ value: null, label: 'All Years' }];
            const years = [...new Set(students.map(s => s.info?.year ? parseInt(s.info.year) : null).filter(Boolean))].sort((a, b) => b - a);
            return [{ value: null, label: 'All Years' }, ...years.map(y => ({ value: y, label: y.toString() }))];
        },
        statusOptions() {
            return [
                { value: null, label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'COMPLETE', label: 'Complete' },
                { value: 'FAILED', label: 'Closed' },
            ]
        }
    }
}
</script>

<style scoped>
.management-card {
    border-radius: 20px !important;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.custom-segmented-control {
    background-color: #f1f5f9;
    border-radius: 12px;
    padding: 4px;
    height: 48px;
}

.segment-btn {
    background-color: transparent;
    color: #64748b;
    border: none;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 10px;
    transition: all 0.25s ease;
}

.segment-btn.active {
    background-color: #ffffff !important;
    color: #0f172a !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 16px;
    color: #94a3b8;
    width: 18px;
    height: 18px;
}

.modern-search-input {
    padding-left: 44px !important;
    height: 48px !important;
    border-radius: 12px !important;
    border: 1.5px solid #f1f5f9 !important;
    background-color: #f8fafc !important;
    font-size: 14px;
    font-weight: 500;
}

.modern-search-input:focus {
    background-color: #ffffff;
    border-color: #cbd5e1 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.btn-modern-action {
    height: 48px;
    padding: 0 20px;
    border-radius: 12px;
    background-color: #ffffff;
    border: 1.5px solid #f1f5f9;
    font-weight: 700;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    color: #334155;
}

.btn-modern-action:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
}

.btn-modern-filter {
    color: #1e293b;
    background-color: #ffffff;
}

.btn-modern-red {
    background-color: #fef2f2;
    border-color: #fee2e2;
    color: #dc2626;
}

.btn-modern-red:hover {
    background-color: #fee2e2;
    color: #b91c1c;
}

.filter-mini-label {
    font-size: 10px;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    display: block;
}

.modern-select-filter {
    border-radius: 10px !important;
    border: 1.5px solid #f1f5f9 !important;
    background-color: #ffffff !important;
    height: 42px !important;
    font-size: 13px !important;
    font-weight: 600;
}

.slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
    max-height: 200px;
    opacity: 1;
    overflow: hidden;
}
.slide-enter, .slide-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>
```