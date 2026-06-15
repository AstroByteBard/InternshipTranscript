<template>
    <div class="general-settings">
        <div class="mb-4">
            <p class="text-muted font-weight-bold text-uppercase mb-1"
                style="font-size: 0.85rem; letter-spacing: 0.1em;">
                {{ $i18n.locale === 'th' ? 'การตั้งค่า' : 'SETTINGS' }}
            </p>
            <h2 class="font-weight-bold text-dark mb-2">{{ $i18n.locale === 'th' ? 'ทั่วไป' : 'General' }}</h2>
            <p class="text-muted">{{ $i18n.locale === 'th' ? 'จัดการข้อมูลรับรอง AI และโครงสร้างข้อมูลวิชาการ' : 'Manageyour AI credentials and academic taxonomy.' }}</p>
        </div>

        <div class="mb-4">
            <p class="text-muted font-weight-bold mb-2" style="font-size: 0.85rem; letter-spacing: 0.1em;">
                {{ $i18n.locale === 'th' ? 'คีย์สำหรับ AI' : 'AI SUMMARY KEY' }}
            </p>
            <CRow>
                <CCol sm="8" md="6" class="mb-3 mb-sm-0">
                    <CInput :type="showApiKey ? 'text' : 'password'" placeholder="sk-..." v-model="apiKey" class="mb-0">
                        <template #prepend-content>
                            <CIcon name="cil-key" />
                        </template>
                        <template #append>
                            <CButton color="secondary" @click="toggleApiKey">
                                <CIcon :name="showApiKey ? 'cil-low-vision' : 'cil-eye'" />
                            </CButton>
                        </template>
                    </CInput>
                </CCol>
                <CCol sm="4" md="2">
                    <CButton color="danger" class="w-100" @click="useApiKey">
                        {{ $i18n.locale === 'th' ? 'ใช้งาน' : 'Use' }}
                    </CButton>
                </CCol>
            </CRow>
            <p class="text-muted mt-2 small">
                {{ $i18n.locale === 'th' ? 'ใช้สำหรับสร้างบทสรุป AI ข้อมูลจะถูกจัดเก็บอย่างปลอดภัย' : 'Used to generate AI summaries.Stored securely.' }}
            </p>
        </div>

        <div class="mb-5">
            <p class="text-muted font-weight-bold mb-2" style="font-size: 0.85rem; letter-spacing: 0.1em;">
                {{ $i18n.locale === 'th' ? 'โมเดล AI' : 'AI MODEL' }}
            </p>
            <CRow>
                <CCol sm="8" md="6" class="mb-3 mb-sm-0">
                    <CInput type="text" :placeholder="$i18n.locale === 'th' ? 'กรอกชื่อโมเดล' : 'Enter model name'"
                        v-model="selectedModel" class="mb-0">
                        <template #prepend-content>
                            <CIcon name="cil-memory" />
                        </template>
                    </CInput>
                </CCol>
                <CCol sm="4" md="2">
                    <CButton color="danger" class="w-100" @click="useModel">
                        {{ $i18n.locale === 'th' ? 'ใช้งาน' : 'Use' }}
                    </CButton>
                </CCol>
            </CRow>
        </div>

        <CRow>
            <CCol sm="12" md="6" lg="6" xl="4" v-for="summary in summaryCards" :key="summary.key">
                <CCard>
                    <CCardBody class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <div class="mr-3 bg-light rounded d-flex justify-content-center align-items-center"
                                style="width: 48px; height: 48px; color: #4f5d73;">
                                <CIcon :name="summary.icon" size="lg" />
                            </div>
                            <div>
                                <div class="text-muted font-weight-bold small text-uppercase">{{ summary.title }}</div>
                                <h4 class="mb-0 text-dark font-weight-bold">
                                    {{ summary.count }}
                                    <small class="text-muted" style="font-size: 0.55em;">{{ summary.unit }}</small>
                                </h4>
                            </div>
                        </div>
                        <CButton color="danger" variant="outline" @click="onAdd(summary.key)">
                            <CIcon name="cil-plus" class="mr-1" />{{ $i18n.locale === 'th' ? 'เพิ่ม' : 'Add' }}
                        </CButton>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'ProjectSettingsGeneral',
    data() {
        return {
            apiKey: '',
            showApiKey: false,
            selectedModel: ''
        };
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('setting/general', { generalItem: 'item' }),
        provinceCount() {
            const provinces = this.$store.getters['setting/province/province'] || [];
            return provinces.length;
        },
        semesterCount() {
            const semesters = this.$store.getters['setting/semester/item'] || [];
            return semesters.length;
        },
        summaryCards() {
            const isTh = this.$i18n.locale === 'th';
            return [
                {
                    key: 'school',
                    title: isTh ? 'โรงเรียน' : 'SCHOOL',
                    titleText: isTh ? 'โรงเรียน' : 'School',
                    count: this.storedSchools ? this.storedSchools.length : 0,
                    unit: isTh ? 'แห่ง' : 'schools',
                    icon: 'cil-bank'
                },
                {
                    key: 'major',
                    title: isTh ? 'สาขาวิชา' : 'MAJOR',
                    titleText: isTh ? 'สาขาวิชา' : 'Major',
                    count: this.storedPrograms ? this.storedPrograms.length : 0,
                    unit: isTh ? 'สาขา' : 'majors',
                    icon: 'cil-library'
                },
                {
                    key: 'province',
                    title: isTh ? 'จังหวัด' : 'PROVINCE',
                    titleText: isTh ? 'จังหวัด' : 'Province',
                    count: this.provinceCount,
                    unit: isTh ? 'พื้นที่' : 'provinces',
                    icon: 'cil-map'
                },
                {
                    key: 'course',
                    title: isTh ? 'รายวิชา' : 'COURSE',
                    titleText: isTh ? 'รายวิชา' : 'Course',
                    count: this.storedCourses ? this.storedCourses.length : 0,
                    unit: isTh ? 'วิชา' : 'courses',
                    icon: 'cil-book'
                },
                {
                    key: 'semester',
                    title: isTh ? 'ภาคการศึกษา' : 'SEMESTER',
                    titleText: isTh ? 'ภาคการศึกษา' : 'Semester',
                    count: this.semesterCount,
                    unit: isTh ? 'เทอม' : 'semesters',
                    icon: 'cil-calendar'
                }
            ];
        }
    },
    watch: {
        generalItem: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.apiKey = val.apiKey || '';
                    this.selectedModel = val.modelName || '';
                }
            }
        }
    },
    created() {
        this.$store.dispatch('academic/schools/schools');
        this.$store.dispatch('academic/programs/programs');
        this.$store.dispatch('academic/course/course');
        this.$store.dispatch('setting/province/province');
        this.$store.dispatch('setting/semester/get');
        this.fetchGeneralSettings();
    },
    methods: {
        async fetchGeneralSettings() {
            try {
                const data = await this.$store.dispatch('setting/general/get');
                if (data) {
                    this.apiKey = data.apiKey || '';
                    this.selectedModel = data.modelName || '';
                }
            } catch (error) {
                console.error('Failed to fetch general settings', error);
            }
        },
        toggleApiKey() {
            this.showApiKey = !this.showApiKey;
        },
        saveSettings() {
            this.$store.dispatch('setting/general/put', {
                apiKey: this.apiKey,
                modelName: this.selectedModel
            });
        },
        useApiKey() {
            this.$store.dispatch('setting/general/put', {
                apiKey: this.apiKey,
                modelName: this.selectedModel
            });
            this.$bvToast ? this.$bvToast.toast('API Key setting updated successfully', { title: 'Success', variant: 'success' }) : alert('API Key updated successfully');
        },
        useModel() {
            this.$store.dispatch('setting/general/put', {
                apiKey: this.apiKey,
                modelName: this.selectedModel
            });
            this.$bvToast ? this.$bvToast.toast('Model setting updated successfully', { title: 'Success', variant: 'success' }) : alert('Model updated successfully');
        },
        onAdd(type) {
            const application = this.$route.params.application;
            const routeMap = {
                school: 'ProjectSettingsSchool',
                major: 'ProjectSettingsMajor',
                province: 'ProjectSettingsProvince',
                course: 'ProjectSettingsCourse',
                semester: 'ProjectSettingsSemester'
            };

            const routeName = routeMap[type];
            if (!routeName) return;

            this.$router.push({ name: routeName, params: { application } });
        }
    }
};
</script>

<style scoped>
.general-settings {
    padding: 24px;
}
</style>
