<template>
    <div>
        <ButtonGroupAdministrator 
            v-model="selected" 
            @add-student="$refs.modalStudent.openAdd()"
            @add-advisor="$refs.modalAdvisor.openAdd()"
            @refresh="onInit" 
        />
        
        <div v-if="selected === 'Student'">
            <FilterStudent 
                :search.sync="search" 
                :school.sync="school" 
                :program.sync="program" 
                :academic.sync="academic" 
                :semester.sync="semester" 
            />

            <TableAdministratorStudent 
                :filteredStudents="filteredStudents"
                @edit-student="$refs.modalStudent.openEdit($event)" 
                @refresh="onInit" 
            />

        </div>

        <div v-if="selected === 'Advisor'">
            <FilterAdvisor 
                :search.sync="searchAdvisor" 
                :school.sync="school" 
                :program.sync="program"
                :academic.sync="academic" 
                :province.sync="province" 
            />

            <TableAdminstratorAdviser 
                :filteredAdvisors="filteredAdvisors"
                @edit-advisor="$refs.modalAdvisor.openEdit($event)" 
                @refresh="onInit" 
            />
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
import ButtonGroupAdministrator from '@/projects/components/ButtonGroup/ButtonGroupAdministrator.vue'

export default {
    name: 'Administrator',
    components: {
        ButtonGroupAdministrator,
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
        }
    },

    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),

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
                if (this.studentFilters.school && student.info?.school?._id !== this.studentFilters.school) return false;
                if (this.studentFilters.program && student.info?.program?._id !== this.studentFilters.program) return false;
                if (this.studentFilters.academic && String(student.year) !== String(this.studentFilters.academic)) return false;
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

            if (this.studentFilters.school) {
                source = source.filter(program => program.school === this.studentFilters.school);
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
            if (!this.formattedStudents) return [];
            const semesters = new Set(this.formattedStudents.map(s => s.semester).filter(s => s));
            return [
                { value: '', label: 'Select Semester' },
                ...Array.from(semesters).sort().map(s => ({ value: s, label: s }))
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

                if (this.province && adv.province !== this.province) return false;

                return true;
            });
        }
    }
}
</script>
