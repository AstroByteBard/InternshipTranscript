<template>
    <div class="administrator-view">
        <AdministratorHeader 
            @add-student="$refs.modalStudent.openAdd()"
            @add-advisor="$refs.modalAdvisor.openAdd()"
            @refresh="onInit" 
        />

        <WidgetsAdministrator 
            :studentCount="storedStudents ? storedStudents.length : 0"
            :advisorCount="storedAdvisors ? storedAdvisors.length : 0"
            :schoolCount="storedSchools ? storedSchools.length : 0"
            :programCount="storedPrograms ? storedPrograms.length : 0"
            :activeTab="selected"
            @select-tab="selected = $event"
        />
        
        <div v-if="selected === 'Student'">
            <FilterStudent :search.sync="search" :school.sync="school" :program.sync="program" :academic.sync="academic"
                :semester.sync="semester" />

            <TableAdministratorStudent :filteredStudents="filteredStudents"
                @edit-student="$refs.modalStudent.openEdit($event)" @refresh="onInit" />

        </div>

        <div v-if="selected === 'Advisor'">
            <FilterAdvisor :search.sync="searchAdvisor" :school.sync="school" :program.sync="program"
                :academic.sync="academic" :province.sync="province" />

            <TableAdminstratorAdviser :filteredAdvisors="filteredAdvisors"
                @edit-advisor="$refs.modalAdvisor.openEdit($event)" @refresh="onInit" />
        </div>

        <ModalEditStudent ref="modalStudent" @refresh="onInit" />
        <ModalEditAdvisor ref="modalAdvisor" @refresh="onInit" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ModalEditStudent from '@/projects/components/Modal/ModalEditStudent.vue'
import ModalEditAdvisor from '@/projects/components/Modal/ModalEditAdvisor.vue'
import TableAdministratorStudent from '@/projects/components/Table/TableAdministratorStudent.vue'
import TableAdminstratorAdviser from '@/projects/components/Table/TableAdminstratorAdviser.vue'
import FilterStudent from '@/projects/components/Filter/Adminstrator/FilterStudent.vue'
import FilterAdvisor from '@/projects/components/Filter/Adminstrator/FilterAdvisor.vue'
import AdministratorHeader from '@/projects/components/Layout/AdministratorHeader.vue'
import WidgetsAdministrator from '@/projects/components/widgets/WidgetsAdministrator.vue'

export default {
    name: 'Administrator',
    components: {
        AdministratorHeader,
        WidgetsAdministrator,
        FilterStudent,
        FilterAdvisor,
        TableAdministratorStudent,
        TableAdminstratorAdviser,
        ModalEditStudent,
        ModalEditAdvisor
    },
    data() {
        return {
            selected: 'Student',
            search: '',
            searchAdvisor: '',
            school: '',
            program: '',
            academic: '',
            semester: '',
            province: '',
        }
    },

    mounted() {

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
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),

        studentFilters() {
            return {
                school: this.school,
                program: this.program,
                academic: this.academic,
                semester: this.semester
            }
        },

        formattedStudents() {
            if (!this.storedStudents || !this.storedStudents.length) return [];
            return this.storedStudents.map(s => {
                const getVal = (arr, k) => {
                    if (!Array.isArray(arr)) return '';
                    const item = arr.find(i => i.key === k);
                    return item ? item.value : '';
                };

                return {
                    ...s,
                    nameThai: getVal(s.name, 'th'),
                    nameEnglish: getVal(s.name, 'en'),
                    programName: s.info?.program ? getVal(s.info.program.title, 'en') : '',
                    schoolName: s.info?.school ? getVal(s.info.school.title, 'en') : '',
                    courseName: s.info?.course ? getVal(s.info.course.title, 'en') : '',
                    semester: s.info?.semester,
                    year: s.info?.year
                };
            });
        },

        filteredStudents() {
            return this.formattedStudents.filter(student => {
                // Search Filter
                const searchLower = this.search.toLowerCase();
                const matchesSearch =
                    (student.nameThai && student.nameThai.toLowerCase().includes(searchLower)) ||
                    (student.nameEnglish && student.nameEnglish.toLowerCase().includes(searchLower)) ||
                    (student.studentID && student.studentID.toLowerCase().includes(searchLower)) ||
                    (student.email && student.email.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;

                // Dropdown Filters
                const info = student.info || {};
                
                // School Filter
                if (this.studentFilters.school) {
                    const studentSchoolId = info.school?._id || info.school;
                    if (studentSchoolId !== this.studentFilters.school) return false;
                }

                // Program Filter
                if (this.studentFilters.program) {
                    const studentProgramId = info.program?._id || info.program;
                    if (studentProgramId !== this.studentFilters.program) return false;
                }

                // Academic Year Filter
                if (this.studentFilters.academic && String(student.year) !== String(this.studentFilters.academic)) return false;

                // Semester Filter
                if (this.studentFilters.semester && String(student.semester) !== String(this.studentFilters.semester)) return false;

                return true;
            });
        },

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

            if (this.school) {
                source = source.filter(program => program.school === this.school);
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

        courseOptions() {
            if (!this.storedCourses) return [];
            return [
                { value: '', label: 'Select Course' },
                ...this.storedCourses.map(c => ({
                    value: c._id,
                    label: c.title.find(t => t.key === 'en')?.value || c.title.find(t => t.key === 'th')?.value || c._id
                }))
            ];
        },

        academicOptions() {
            if (!this.formattedStudents) return [];
            const years = new Set(this.formattedStudents.map(s => s.year).filter(y => y));
            return [
                { value: '', label: 'Select Academic' },
                ...Array.from(years).sort().map(y => ({ value: y, label: y }))
            ];
        },

        semesterOptions() {
            const lang = this.$i18n.locale || 'en';
            const statuses = this.$store.getters['setting/status/item'] || [];
            
            return [
                { value: '', label: 'Select Semester' },
                ...statuses.map(s => {
                    const titleObj = s.title.find(t => t.key === lang) || s.title[0];
                    return {
                        value: titleObj ? titleObj.value : s._id,
                        label: titleObj ? titleObj.value : s._id
                    };
                })
            ];
        },

        // Advisor Computeds
        formattedAdvisors() {
            if (!this.storedAdvisors || !this.storedAdvisors.length) return [];

            return this.storedAdvisors.map(adv => {
                const getVal = (arr, k) => {
                    if (!Array.isArray(arr)) return '';
                    const item = arr.find(i => i.key === k);
                    return item ? item.value : '';
                };

                let studentName = '-';
                let studentID = '-';

                if (adv.student) {
                    studentID = adv.student.studentID || '-';
                    const nameThai = adv.student.name ? getVal(adv.student.name, 'th') : '';
                    const nameEnglish = adv.student.name ? getVal(adv.student.name, 'en') : '';
                    studentName = nameThai || nameEnglish || '-';
                }

                return {
                    ...adv,
                    studentName,
                    studentID
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
                    (adv.studentID && adv.studentID.toLowerCase().includes(searchLower));

                if (!matches) return false;
                
                // Province Filter
                if (this.province) {
                    const studentProvinceId = adv.province?._id || adv.province;
                    if (studentProvinceId !== this.province) return false;
                }

                return true;
            });
        }
    }
}
</script>
