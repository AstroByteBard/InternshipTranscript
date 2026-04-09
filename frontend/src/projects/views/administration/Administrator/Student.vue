<template>
    <div class="administrator-view">
        <AdministratorHeader 
            @add-student="$refs.modalStudent.openAdd()"
            @refresh="onInit" 
        />

        <WidgetsAdministrator 
            :studentCount="storedStudents ? storedStudents.length : 0"
            :advisorCount="storedAdvisors ? storedAdvisors.length : 0"
            :selectedSchool="selectedSchoolName"
            :selectedMajor="selectedMajorName"
            :selectedYear="selectedYearName"
            activeTab="Student"
        />
        
        <div>
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
            if (!this.school || !this.storedSchools) return 'ALL';
            const school = this.storedSchools.find(s => s._id === this.school);
            if (!school) return 'ALL';
            const enName = school.title?.find(t => t.key === 'en')?.value || '';
            // If it's something like "School of Information Technology", might want "IT"
            // For now, return the name or a shortened version if common
            return enName;
        },
        selectedMajorName() {
            if (!this.program || !this.storedPrograms) return 'ALL';
            const prog = this.storedPrograms.find(p => p._id === this.program);
            if (!prog) return 'ALL';
            return prog.title?.find(t => t.key === 'en')?.value || 'ALL';
        },
        selectedYearName() {
            return this.academic || 'ALL';
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
