<template>
    <div class="administrator-view">
        <AdministratorHeader @add-student="$refs.modalStudent.openAdd()" @refresh="onInit" />

        <WidgetsAdministrator :studentCount="storedStudents ? storedStudents.length : 0"
            :advisorCount="storedAdvisors ? storedAdvisors.length : 0" :selectedSchool="selectedSchoolName"
            :selectedMajor="selectedMajorName" :selectedYear="selectedYearName" activeTab="Student" />

        <div>
            <FilterStudent :search.sync="search" :school.sync="school" :program.sync="program" :academic.sync="academic"
                :semester.sync="semester" />

            <TableAdministratorStudent :filteredStudents="filteredStudents"
                @edit-student="$refs.modalStudent.openEdit($event)" @refresh="onInit" />
        </div>

        <ModalEditStudent ref="modalStudent" @refresh="onInit" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ModalEditStudent from '@/projects/components/Modal/ModalEditStudent.vue'
import TableAdministratorStudent from '@/projects/components/Table/TableAdministratorStudent.vue'
import FilterStudent from '@/projects/components/Filter/Adminstrator/FilterStudent.vue'
import AdministratorHeader from '@/projects/components/Layout/AdministratorHeader.vue'
import WidgetsAdministrator from '@/projects/components/widgets/WidgetsAdministrator.vue'

export default {
    name: 'Student',
    components: {
        AdministratorHeader,
        WidgetsAdministrator,
        FilterStudent,
        TableAdministratorStudent,
        ModalEditStudent,
    },
    data() {
        return {
            search: '',
            school: '',
            program: '',
            academic: '',
            semester: '',
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
        studentFilters() {
            return {
                school: this.school,
                program: this.program,
                academic: this.academic,
                semester: this.semester
            }
        },

        formattedStudents() {
            const lang = this.$i18n.locale || 'en';
            const altLang = lang === 'th' ? 'en' : 'th';
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
                    primaryName: getVal(s.name, lang) || getVal(s.name, 'th'),
                    secondaryName: getVal(s.name, altLang),
                    primarySchoolName: s.info?.school ? (getVal(s.info.school.title, lang) || getVal(s.info.school.title, 'en') || getVal(s.info.school.title, 'th')) : '',
                    secondarySchoolName: s.info?.school ? getVal(s.info.school.title, altLang) : '',
                    primaryProgramName: s.info?.program ? (getVal(s.info.program.title, lang) || getVal(s.info.program.title, 'en') || getVal(s.info.program.title, 'th')) : '',
                    secondaryProgramName: s.info?.program ? getVal(s.info.program.title, altLang) : '',
                    programName: s.info?.program ? (getVal(s.info.program.title, lang) || getVal(s.info.program.title, 'en')) : '',
                    schoolName: s.info?.school ? (getVal(s.info.school.title, lang) || getVal(s.info.school.title, 'en')) : '',
                    courseName: s.info?.course ? (getVal(s.info.course.title, lang) || getVal(s.info.course.title, 'en')) : '',
                    semester: s.info?.semester,
                    year: s.info?.year
                };
            });
        },

        filteredStudents() {
            return this.formattedStudents.filter(student => {
                const searchLower = this.search.toLowerCase();
                const matchesSearch =
                    (student.nameThai && student.nameThai.toLowerCase().includes(searchLower)) ||
                    (student.nameEnglish && student.nameEnglish.toLowerCase().includes(searchLower)) ||
                    (student.studentID && student.studentID.toLowerCase().includes(searchLower)) ||
                    (student.email && student.email.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;

                const info = student.info || {};

                if (this.studentFilters.school) {
                    const studentSchoolId = info.school?._id || info.school;
                    if (studentSchoolId !== this.studentFilters.school) return false;
                }

                if (this.studentFilters.program) {
                    const studentProgramId = info.program?._id || info.program;
                    if (studentProgramId !== this.studentFilters.program) return false;
                }

                if (this.studentFilters.academic && String(student.year) !== String(this.studentFilters.academic)) return false;

                if (this.studentFilters.semester && String(student.semester) !== String(this.studentFilters.semester)) return false;

                return true;
            });
        },
    }
}
</script>
