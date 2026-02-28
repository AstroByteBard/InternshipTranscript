<template>
    <CModal :title="isEditing ? 'Edit Student' : 'Add New Student'" :show.sync="show" color="danger" size="lg">
        <CRow>
            <CCol sm="6">
                <CInput label="Student ID" placeholder="Enter ID" v-model="formStudent.studentID" />
            </CCol>
            <CCol sm="6">
                <CInput label="Email" placeholder="Enter Email" type="email" v-model="formStudent.email" />
            </CCol>
            <CCol sm="6">
                <CInput label="Name (Thai)" placeholder="ชื่อ-นามสกุล" v-model="formStudent.nameThai" />
            </CCol>
            <CCol sm="6">
                <CInput label="Name (English)" placeholder="First Last" v-model="formStudent.nameEnglish" />
            </CCol>
            <CCol sm="6">
                <CInput label="Company" placeholder="Organization" v-model="formStudent.company" />
            </CCol>
            <CCol sm="6">
                <CSelect label="School" :options="schoolOptions" :value.sync="formStudent.school" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Program" :options="formProgramOptions" :value.sync="formStudent.program" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Course" :options="courseOptions" :value.sync="formStudent.course" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Semester" :options="semesterOptions" :value.sync="formStudent.semester" />
            </CCol>
            <CCol sm="6">
                <CInput label="Academic Year" placeholder="Year" v-model="formStudent.year" />
            </CCol>
        </CRow>

        <template #footer>
            <CButton color="secondary" @click="show = false">Cancel</CButton>
            <CButton color="danger" @click="submit">{{ isEditing ? 'Update' : 'Save' }}</CButton>
        </template>
    </CModal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'ModalEditStudent',
    data() {
        return {
            show: false,
            isEditing: false,
            editID: null,
            formStudent: {
                studentID: '', nameThai: '', nameEnglish: '', email: '', company: '',
                school: '', program: '', course: '', semester: '', year: ''
            }
        }
    },
    computed: {
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),

        formProgramOptions() {
            const lang = this.$i18n.locale;
            let source = this.storedPrograms || [];

            if (this.formStudent.school) {
                source = source.filter(program => program.school === this.formStudent.school);
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
        semesterOptions() {
            if (!this.storedStudents) return [];
            const semesters = new Set(this.storedStudents.map(s => s.info?.semester).filter(s => s));
            return [
                { value: '', label: 'Select Semester' },
                ...Array.from(semesters).sort().map(s => ({ value: s, label: s }))
            ];
        }
    },
    methods: {
        openAdd() {
            this.isEditing = false;
            this.editID = null;
            this.formStudent = {
                studentID: '', nameThai: '', nameEnglish: '', email: '', company: '',
                school: '', program: '', course: '', semester: '', year: ''
            };
            this.show = true;
        },
        openEdit(student) {
            const getVal = (arr, k) => {
                if (!Array.isArray(arr)) return '';
                const item = arr.find(i => i.key === k);
                return item ? item.value : '';
            };

            this.isEditing = true;
            this.editID = student._id;

            this.formStudent = {
                studentID: student.studentID || '',
                nameThai: getVal(student.name, 'th'),
                nameEnglish: getVal(student.name, 'en'),
                email: student.email || '',
                company: student.company || '',
                school: student.info?.school?._id || student.info?.school || '',
                program: student.info?.program?._id || student.info?.program || '',
                course: student.info?.course?._id || student.info?.course || '',
                semester: student.info?.semester || '',
                year: student.info?.year || ''
            };
            this.show = true;
        },
        submit() {
            if (!this.formStudent.studentID || !this.formStudent.email) {
                alert("Student ID and Email are required");
                return;
            }
            const studentData = {
                studentID: this.formStudent.studentID,
                name: [
                    { key: 'th', value: this.formStudent.nameThai || '' },
                    { key: 'en', value: this.formStudent.nameEnglish || '' }
                ],
                email: this.formStudent.email,
                info: {
                    semester: this.formStudent.semester || null,
                    program: this.formStudent.program || null,
                    school: this.formStudent.school || null,
                    course: this.formStudent.course || null,
                    year: this.formStudent.year ? String(this.formStudent.year) : null
                },
                company: this.formStudent.company || null,
            };

            if (this.isEditing) {
                studentData._id = this.editID;
                this.$store.dispatch("member/students/updateStudents", studentData).then(() => {
                    this.$emit('refresh');
                    this.show = false;
                    alert(`Student ${studentData.studentID} updated successfully!`);
                }).catch(err => {
                    console.error("Failed to update student:", err);
                    alert("Failed to update student.");
                });
            } else {
                this.$store.dispatch("member/students/createStudents", [studentData]).then(() => {
                    this.$emit('refresh');
                    this.show = false;
                    alert(`Student ${studentData.studentID} added successfully!`);
                }).catch(err => {
                    console.error("Failed to add student:", err);
                    alert("Failed to add student.");
                });
            }
        }
    }
}
</script>
