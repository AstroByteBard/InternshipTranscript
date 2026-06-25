<template>
    <div>
        <CorrespondenceHeader @preview="handlePreview" />

        <WidgetsCorrespondence :emailReady="isEmailReady" :total="totalCount" :pending="pendingCount" :sent="sentCount"
            :failed="failedCount" />

        <!-- Unified Management Bar -->
        <CCard class="management-card border-0 mb-4 shadow-sm">
            <CCardBody class="p-3">
                <CRow class="align-items-center">

                    <!-- Search Bar -->
                    <CCol lg="6" md="6" class="mb-3 mb-md-0">
                        <div class="search-input-wrapper">
                            <CIcon name="cil-search" class="search-icon" />
                            <input type="text" class="form-control modern-search-input"
                                :placeholder="$t('search_by_name_id_subject')" v-model="searchQuery" />
                        </div>
                    </CCol>

                    <!-- Action Buttons -->
                    <CCol lg="6" md="6" class="d-flex justify-content-end align-items-center flex-wrap">
                        <CButton class="btn-modern-action mr-2" @click="sendBulkEmail('school')"
                            :disabled="!isEmailReady">
                            <CIcon name="cil-envelope-closed" class="mr-2 text-primary" /> {{ $t('send_email_school') }}
                        </CButton>
                        <CButton class="btn-modern-action mr-2" @click="sendBulkEmail('program')"
                            :disabled="!isEmailReady">
                            <CIcon name="cil-envelope-closed" class="mr-2 text-primary" /> {{ $t('send_email_program')
                            }}
                        </CButton>
                        <CButton class="btn-modern-action btn-modern-filter mr-2" @click="showFilters = !showFilters">
                            <CIcon name="cil-filter" class="mr-2" /> {{ $t('filters') }}
                        </CButton>
                    </CCol>
                </CRow>

                <!-- Expanded Filters -->
                <transition name="slide">
                    <div v-show="showFilters" class="mt-3 pt-3 border-top">
                        <CRow>
                            <CCol md="3">
                                <label class="filter-mini-label">{{ $t('school') }}</label>
                                <CSelect custom class="modern-select-filter mb-0" :options="schoolOptions"
                                    :value.sync="filterSchool" :placeholder="$t('all_schools_label')" />
                            </CCol>
                            <CCol md="3">
                                <label class="filter-mini-label">{{ $t('program') }}</label>
                                <CSelect custom class="modern-select-filter mb-0" :options="programOptions"
                                    :value.sync="filterProgram" :placeholder="$t('all_programs_label')" />
                            </CCol>
                            <CCol md="3">
                                <label class="filter-mini-label">{{ $t('academicYear') }}</label>
                                <CSelect custom class="modern-select-filter mb-0" :options="yearOptions"
                                    :value.sync="filterYear" :placeholder="$t('all_years_label')" />
                            </CCol>
                            <CCol md="3">
                                <label class="filter-mini-label">{{ $t('delivery_status') }}</label>
                                <CSelect custom class="modern-select-filter mb-0" :options="deliveryStatusOptions"
                                    :value.sync="filterDeliveryStatus" :placeholder="$t('all_status_label')" />
                            </CCol>
                        </CRow>
                    </div>
                </transition>
            </CCardBody>
        </CCard>

        <!-- Content Area -->
        <div class="content-pannel">
            <StudentEmailSection ref="studentSection" :search-query="searchQuery" :school="filterSchool"
                :program="filterProgram" :year="filterYear" :delivery-status="filterDeliveryStatus" />
        </div>

        <ModalEmailPreview ref="modalPreview" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CorrespondenceHeader from '@/projects/components/Layout/CorrespondenceHeader.vue'
import WidgetsCorrespondence from '@/projects/components/widgets/WidgetsCorrespondence.vue'
import StudentEmailSection from '@/projects/components/Correspondence/StudentEmailSection.vue'
import ModalEmailPreview from '@/projects/components/Modal/ModalEmailPreview.vue'

export default {
    name: 'CorrespondenceStudent',
    components: {
        CorrespondenceHeader,
        WidgetsCorrespondence,
        StudentEmailSection,
        ModalEmailPreview,
    },
    data() {
        return {
            searchQuery: '',
            showFilters: false,
            filterSchool: null,
            filterProgram: null,
            filterYear: null,
            filterDeliveryStatus: null,
        }
    },
    created() {
        this.onInit();
    },
    methods: {
        onInit() {
            this.$store.dispatch('member/students/students')
            this.$store.dispatch('academic/schools/schools')
            this.$store.dispatch('academic/programs/programs')
            this.$store.dispatch('email/emailStudent/email')
            this.$store.dispatch('email/emailTransactionStudent/get')
        },
        async handlePreview() {
            const section = this.$refs.studentSection;
            if (!section) return;

            const items = section.programsTable;
            if (!items || items.length === 0) {
                alert(this.$t('no_data_to_preview'));
                return;
            }

            const activeTemplate = section.emailsData.find(t => t.active);
            if (!activeTemplate) {
                alert(this.$t('no_active_template_found'));
                return;
            }

            this.$refs.modalPreview.open(activeTemplate, items[0], false);
        },
        async sendBulkEmail(type) {
            const section = this.$refs.studentSection;
            if (!section) return;

            if (!this.isEmailReady) {
                alert(this.$t('no_active_template_found'));
                return;
            }

            // Filter for Pending only as requested for consistent behavior
            const items = section.programsTable.filter(item => item.deliveryStatus === 'PENDING');

            if (!items || items.length === 0) {
                alert(this.$t('no_pending_students_found'));
                return;
            }

            if (!confirm(this.$t('confirm_send_emails', { count: items.length }))) {
                return;
            }

            this.$store.commit('dialog/loading', true);
            this.$store.commit('dialog/loadingMessage', this.$t('submitting'));

            for (const item of items) {
                try {
                    await section.sendEmail(item._id);
                } catch (error) {
                    console.error(`Failed to send email to ${item._id}:`, error);
                }
            }

            this.$store.commit('dialog/loadingMessage', this.$t('done'));
            setTimeout(() => {
                this.$store.commit('dialog/loading', false);
            }, 1500);
        }
    },
    computed: {
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('email/emailStudent', { storedStudentEmails: 'emailStudent' }),
        ...mapGetters('email/emailTransactionStudent', { storedTransactionStudents: 'emailTransactionStudent' }),

        isEmailReady() {
            return (this.storedStudentEmails || []).some(t => t.active);
        },

        totalCount() {
            return (this.storedStudents || []).length;
        },
        sentCount() {
            const tx = this.storedTransactionStudents || []
            const completed = tx.filter(t => (t.delivery_status || '').toUpperCase() === 'COMPLETED')
            return new Set(completed.map(t => t.student_id?._id || t.student_id)).size
        },
        pendingCount() {
            const tx = this.storedTransactionStudents || []
            const pending = tx.filter(t => (t.delivery_status || '').toUpperCase() === 'PENDING')
            const pendingIds = new Set(pending.map(t => t.student_id?._id || t.student_id))
            const allIds = new Set((this.storedStudents || []).map(s => s._id))
            const txIds = new Set(tx.map(t => t.student_id?._id || t.student_id))
            const noTxIds = [...allIds].filter(id => !txIds.has(id))
            return pendingIds.size + noTxIds.length
        },
        failedCount() {
            const tx = this.storedTransactionStudents || []
            const failed = tx.filter(t => (t.delivery_status || '').toUpperCase() === 'FAILED')
            return new Set(failed.map(t => t.student_id?._id || t.student_id)).size
        },

        schoolOptions() {
            const lang = this.$store.getters['setting/lang'] || 'en';
            return [
                { value: null, label: this.$t('all_schools_label') },
                ...(this.storedSchools || []).map(item => ({
                    value: item._id,
                    label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? ''
                }))
            ]
        },
        programOptions() {
            const lang = this.$store.getters['setting/lang'] || 'en';
            let progs = this.storedPrograms || [];
            if (this.filterSchool) progs = progs.filter(p => p.school === this.filterSchool);
            return [
                { value: null, label: this.$t('all_programs_label') },
                ...progs.map(item => ({
                    value: item._id,
                    label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? ''
                }))
            ]
        },
        yearOptions() {
            const students = this.storedStudents || [];
            if (!students.length) return [{ value: null, label: this.$t('all_years_label') }];
            const years = [...new Set(students.map(s => {
                const yr = s.info?.year;
                if (Array.isArray(yr)) {
                    const found = yr.find(y => y.key === 'en') || yr[0];
                    return found ? parseInt(found.value) : null;
                }
                if (yr && typeof yr === 'object') return parseInt(yr.value) || null;
                return yr ? parseInt(yr) : null;
            }).filter(Boolean))].sort((a, b) => b - a);
            return [{ value: null, label: this.$t('all_years_label') }, ...years.map(y => ({ value: y, label: y.toString() }))];
        },
        deliveryStatusOptions() {
            return [
                { value: null, label: this.$t('all_status_label') },
                { value: 'PENDING', label: this.$t('pending') },
                { value: 'COMPLETE', label: this.$t('complete') },
                { value: 'FAILED', label: this.$t('failed') },
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
    max-height: 200px;
    opacity: 1;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>
