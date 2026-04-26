<template>
    <div class="administrator-view">
        <AdministratorHeader 
            @add-advisor="$refs.modalAdvisor.openAdd()"
            @refresh="onInit" 
        />

        <WidgetsAdministrator 
            :studentCount="storedStudents ? storedStudents.length : 0"
            :advisorCount="storedAdvisors ? storedAdvisors.length : 0"
            :selectedSchool="selectedSchoolName"
            :selectedMajor="selectedMajorName"
            :selectedYear="selectedYearName"
            activeTab="Advisor"
        />
        
        <div>
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
            if (!this.school || !this.storedSchools) return 'ALL';
            const school = this.storedSchools.find(s => s._id === this.school);
            if (!school) return 'ALL';
            return school.title?.find(t => t.key === 'en')?.value || 'ALL';
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

                // Try to resolve student info
                if (adv.student) {
                    if (typeof adv.student === 'object' && adv.student !== null) {
                        // Case 1: Populated as object
                        studentID = adv.student.studentID || '-';
                        const nameThai = adv.student.name ? getVal(adv.student.name, 'th') : '';
                        const nameEnglish = adv.student.name ? getVal(adv.student.name, 'en') : '';
                        studentName = nameThai || nameEnglish || '-';
                    } else if (typeof adv.student === 'string') {
                        // Case 2: Just an ID string, try to find in storedStudents
                        const found = this.storedStudents.find(s => s._id === adv.student);
                        if (found) {
                            studentID = found.studentID || '-';
                            const nameThai = found.name ? getVal(found.name, 'th') : '';
                            const nameEnglish = found.name ? getVal(found.name, 'en') : '';
                            studentName = nameThai || nameEnglish || '-';
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
