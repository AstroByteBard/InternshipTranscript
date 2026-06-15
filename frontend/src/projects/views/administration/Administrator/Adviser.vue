<template>
    <div class="administrator-view">
        <AdministratorHeader tab="Advisor" @add-advisor="$refs.modalAdvisor.openAdd()" @refresh="onInit" />

        <WidgetsAdministrator :studentCount="storedStudents ? storedStudents.length : 0"
            :advisorCount="storedAdvisors ? storedAdvisors.length : 0" :selectedSchool="selectedSchoolName"
            :selectedMajor="selectedMajorName" :selectedYear="selectedYearName" activeTab="Advisor" />

        <div>
            <FilterAdvisor :search.sync="searchAdvisor" :school.sync="school" :program.sync="program"
                :academic.sync="academic" :province.sync="province" />

            <TableAdminstratorAdviser :filteredAdvisors="filteredAdvisors"
                @edit-advisor="$refs.modalAdvisor.openEdit($event)" @refresh="onInit" />
        </div>

        <ModalEditAdvisor ref="modalAdvisor" @refresh="onInit" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ModalEditAdvisor from '@/projects/components/Modal/ModalEditAdvisor.vue'
import TableAdminstratorAdviser from '@/projects/components/Table/TableAdminstratorAdviser.vue'
import FilterAdvisor from '@/projects/components/Filter/Adminstrator/FilterAdvisor.vue'
import AdministratorHeader from '@/projects/components/Layout/AdministratorHeader.vue'
import WidgetsAdministrator from '@/projects/components/widgets/WidgetsAdministrator.vue'

export default {
    name: 'Adviser',
    components: {
        AdministratorHeader,
        WidgetsAdministrator,
        FilterAdvisor,
        TableAdminstratorAdviser,
        ModalEditAdvisor
    },
    data() {
        return {
            searchAdvisor: '',
            school: '',
            program: '',
            academic: '',
            province: '',
        }
    },
    created() {
        this.onInit();
    },
    methods: {
        onInit() {
            this.$store.dispatch("academic/programs/programs")
            this.$store.dispatch("academic/schools/schools")
            this.$store.dispatch("academic/course/course")
            this.$store.dispatch("member/students/students")
            this.$store.dispatch("member/advisors/advisors")
            this.$store.dispatch("setting/status/get")
            this.$store.dispatch("setting/province/province")
        }
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),
        selectedSchoolName() {
            if (!this.school || !this.storedSchools) return this.$t('all');
            const lang = this.$i18n.locale || 'en';
            const school = this.storedSchools.find(s => s._id === this.school);
            if (!school) return this.$t('all');
            const titleObj = Array.isArray(school.title)
                ? (school.title.find(t => t.key === lang) || school.title.find(t => t.key === 'en') || school.title.find(t => t.key === 'th'))
                : null;
            return (titleObj && titleObj.value) ? titleObj.value : this.$t('all');
        },
        selectedMajorName() {
            if (!this.program || !this.storedPrograms) return this.$t('all');
            const lang = this.$i18n.locale || 'en';
            const prog = this.storedPrograms.find(p => p._id === this.program);
            if (!prog) return this.$t('all');
            const titleObj = Array.isArray(prog.title)
                ? (prog.title.find(t => t.key === lang) || prog.title.find(t => t.key === 'en') || prog.title.find(t => t.key === 'th'))
                : null;
            return (titleObj && titleObj.value) ? titleObj.value : this.$t('all');
        },
        selectedYearName() {
            return this.academic || this.$t('all');
        },
        formattedAdvisors() {
            if (!this.storedAdvisors || !this.storedAdvisors.length) return [];

            return this.storedAdvisors.map(adv => {
                const getVal = (arr, k) => {
                    if (!Array.isArray(arr)) return '';
                    const item = arr.find(i => i.key === k);
                    return item ? item.value : '';
                };

                let studentName = '-';
                let studentNameEn = '-';
                let studentID = '-';
                let studentCompany = '-';

                // Try to resolve student info
                if (adv.student) {
                    if (typeof adv.student === 'object' && adv.student !== null) {
                        // Case 1: Populated as object
                        studentID = adv.student.studentID || '-';
                        const nameThai = adv.student.name ? getVal(adv.student.name, 'th') : '';
                        const nameEnglish = adv.student.name ? getVal(adv.student.name, 'en') : '';
                        studentName = nameThai || nameEnglish || '-';
                        studentNameEn = nameEnglish || nameThai || '-';
                        studentCompany = adv.student.company || '-';
                    } else if (typeof adv.student === 'string') {
                        // Case 2: Just an ID string, try to find in storedStudents
                        const found = this.storedStudents.find(s => s._id === adv.student);
                        if (found) {
                            studentID = found.studentID || '-';
                            const nameThai = found.name ? getVal(found.name, 'th') : '';
                            const nameEnglish = found.name ? getVal(found.name, 'en') : '';
                            studentName = nameThai || nameEnglish || '-';
                            studentNameEn = nameEnglish || nameThai || '-';
                            studentCompany = found.company || '-';
                        } else {
                            // Case 3: Fallback if not found in store
                            studentID = adv.student;
                        }
                    }
                }

                // If studentID looks like a MongoDB ObjectId (24 chars hex), and we still haven't found a better one
                if (studentID.length === 24 && /^[0-9a-fA-F]+$/.test(studentID) && studentName === '-') {
                    studentID = 'Linking...';
                }

                let studentSchoolId = null;
                let studentProgramId = null;
                let studentYear = null;
                let studentObj = null;

                if (typeof adv.student === 'object' && adv.student !== null) {
                    studentObj = adv.student;
                } else if (typeof adv.student === 'string') {
                    studentObj = this.storedStudents.find(s => s._id === adv.student);
                }

                if (studentObj) {
                    if (studentObj.info) {
                        studentSchoolId = studentObj.info.school?._id || studentObj.info.school || null;
                        studentProgramId = studentObj.info.program?._id || studentObj.info.program || null;
                        const yrData = studentObj.info.year;
                        if (Array.isArray(yrData)) {
                            const found = yrData.find(y => y.key === 'en') || yrData[0];
                            studentYear = found ? found.value : null;
                        } else if (yrData && typeof yrData === 'object') {
                            studentYear = yrData.value || null;
                        } else {
                            studentYear = yrData || null;
                        }
                    }
                }

                return {
                    ...adv,
                    studentName,
                    studentNameEn,
                    studentID,
                    studentCompany,
                    studentSchoolId,
                    studentProgramId,
                    studentYear
                };
            });
        },

        filteredAdvisors() {
            const searchLower = this.searchAdvisor.toLowerCase();
            return this.formattedAdvisors.filter(adv => {
                const matches =
                    (adv.organizationName && adv.organizationName.toLowerCase().includes(searchLower)) ||
                    (adv.email && adv.email.toLowerCase().includes(searchLower)) ||
                    (adv.studentName && adv.studentName.toLowerCase().includes(searchLower)) ||
                    (adv.studentNameEn && adv.studentNameEn.toLowerCase().includes(searchLower)) ||
                    (adv.studentID && adv.studentID.toLowerCase().includes(searchLower)) ||
                    (adv.studentCompany && adv.studentCompany.toLowerCase().includes(searchLower));

                if (!matches) return false;

                if (this.school && adv.studentSchoolId !== this.school) return false;
                if (this.program && adv.studentProgramId !== this.program) return false;
                if (this.academic && adv.studentYear !== this.academic) return false;
                if (this.province) {
                    const advisorProvinceId = adv.province?._id || adv.province;
                    if (advisorProvinceId !== this.province) return false;
                }

                return true;
            });
        }
    }
}
</script>
