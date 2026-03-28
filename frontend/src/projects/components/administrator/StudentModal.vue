<template>
    <CModal :title="isEditing ? 'Edit Student' : 'Add New Student'" :show.sync="visible" color="danger" size="lg">
        <CRow>
            <CCol sm="6">
                <CInput label="Student ID" placeholder="Enter ID" v-model="form.studentID" />
            </CCol>
            <CCol sm="6">
                <CInput label="Email" placeholder="Enter Email" type="email" v-model="form.email" />
            </CCol>
            <CCol sm="6">
                <CInput label="Name (Thai)" placeholder="ชื่อ-นามสกุล" v-model="form.nameThai" />
            </CCol>
            <CCol sm="6">
                <CInput label="Name (English)" placeholder="First Last" v-model="form.nameEnglish" />
            </CCol>
            <CCol sm="6">
                <CInput label="Company" placeholder="Organization" v-model="form.company" />
            </CCol>
            <CCol sm="6">
                <CSelect label="School" :options="schoolOptions" :value.sync="form.school" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Program" :options="filteredProgramOptions" :value.sync="form.program" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Course" :options="courseOptions" :value.sync="form.course" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Semester" :options="semesterOptions" :value.sync="form.semester" />
            </CCol>
            <CCol sm="6">
                <CInput label="Academic Year" placeholder="Year" v-model="form.year" />
            </CCol>
        </CRow>

        <template #footer>
            <CButton color="secondary" @click="visible = false">Cancel</CButton>
            <CButton color="danger" @click="submit">{{ isEditing ? 'Update Student' : 'Save Student' }}</CButton>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'StudentModal',
    props: {
        show: { type: Boolean, default: false },
        isEditing: { type: Boolean, default: false },
        studentData: { type: Object, default: () => ({}) },
        schoolOptions: { type: Array, default: () => [] },
        programOptions: { type: Array, default: () => [] },
        courseOptions: { type: Array, default: () => [] },
        semesterOptions: { type: Array, default: () => [] }
    },
    data() {
        return {
            form: {
                studentID: '',
                nameThai: '',
                nameEnglish: '',
                email: '',
                company: '',
                school: '',
                program: '',
                course: '',
                semester: '',
                year: ''
            }
        }
    },
    computed: {
        visible: {
            get() { return this.show },
            set(value) { this.$emit('update:show', value) }
        },
        filteredProgramOptions() {
            let source = this.programOptions || [];

            // Filter programs based on the selected school in the form
            if (this.form.school) {
                source = source.filter(program => program.schoolId === this.form.school);
            }

            return source.length > 1 ? source : this.programOptions;
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.resetForm();
            }
        },
        studentData: {
            handler(newData) {
                if (newData && Object.keys(newData).length > 0) {
                    this.form = { ...newData };
                }
            },
            immediate: true
        },
        'form.school'() {
            // Reset program selection when school changes
            if (this.form.program) {
                this.form.program = '';
            }
        }
    },
    methods: {
        resetForm() {
            this.form = {
                studentID: '',
                nameThai: '',
                nameEnglish: '',
                email: '',
                company: '',
                school: '',
                program: '',
                course: '',
                semester: '',
                year: ''
            };
        },
        submit() {
            if (!this.form.studentID || !this.form.email) {
                alert("Student ID and Email are required");
                return;
            }
            this.$emit('submit', { ...this.form });
        }
    }
}
</script>

<style scoped>
/* Modal styles are inherited from parent or global CoreUI styles */
</style>