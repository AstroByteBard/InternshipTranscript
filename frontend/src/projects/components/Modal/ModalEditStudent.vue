<template>
    <CModal :title="isEditing ? $t('components.modal_modaleditstudent_vue_isediting_edit_student_add_new_st') : $t('components.administrator_actionbuttons_vue_add_student')" :show.sync="show"
        color="danger" size="lg">
        <CRow>
            <CCol sm="6">
                <CInput :label="studentIdLabel" :placeholder="$t('components.modal_modaleditstudent_vue_enter_id')"
                    v-model="formStudent.studentID" />
            </CCol>
            <CCol sm="6">
                <CInput :label="emailLabel" :placeholder="$t('components.modal_modaleditstudent_vue_enter_email')"
                    type="email" v-model="formStudent.email" />
            </CCol>
            <CCol sm="6">
                <CInput :label="nameThaiLabel" :placeholder="$t('components.modal_modaleditstudent_vue')"
                    v-model="formStudent.nameThai" />
            </CCol>
            <CCol sm="6">
                <CInput :label="nameEnglishLabel" :placeholder="$t('components.modal_modaleditstudent_vue_first_last')"
                    v-model="formStudent.nameEnglish" />
            </CCol>
            <CCol sm="6">
                <CSelect :label="schoolLabel" :options="schoolOptions" :value.sync="formStudent.school" />
            </CCol>
            <CCol sm="6">
                <CSelect :label="programLabel" :options="formProgramOptions" :value.sync="formStudent.program" />
            </CCol>
            <CCol sm="6">
                <CSelect :label="courseLabel" :options="courseOptions" :value.sync="formStudent.course" />
            </CCol>
            <CCol sm="6">
                <CSelect :label="semesterLabel" :options="semesterOptions" :value.sync="formStudent.semester" />
            </CCol>
            <CCol sm="6">
                <CInput label="Academic Year(EN)" :placeholder="$t('components.modal_modaleditstudent_vue_year')"
                    v-model="formStudent.yearEn" />
            </CCol>
            <CCol sm="6">
                <CInput label="Academic Year(TH)" placeholder="ปีการศึกษา (พ.ศ.)"
                    v-model="formStudent.yearTh" />
            </CCol>
        </CRow>

        <template #footer>
            <CButton color="secondary" @click="show = false">{{ $t('components.modal_modaleditstudent_vue_cancel') }}
            </CButton>
            <CButton color="danger" @click="submit">{{ submitLabel }}</CButton>
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
            originalStudent: null,
            formStudent: {
                studentID: '', nameThai: '', nameEnglish: '', email: '', company: '',
                school: '', schoolName: '', program: '', programName: '', course: '', courseName: '',
                semester: '', yearEn: '', yearTh: ''
            }
        }
    },
    computed: {
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),

        isThaiLocale() {
            return (this.$i18n.locale || 'en').startsWith('th');
        },
        studentIdLabel() {
            return this.$t('student_id');
        },
        emailLabel() {
            return this.$t('email');
        },
        nameThaiLabel() {
            return this.isThaiLocale ? 'ชื่อ (ไทย)' : 'Name (Thai)';
        },
        nameEnglishLabel() {
            return this.isThaiLocale ? 'ชื่อ (อังกฤษ)' : 'Name (English)';
        },
        companyLabel() {
            return this.$t('components.administrator_studentmodal_vue_organization');
        },
        schoolLabel() {
            return this.$t('school');
        },
        programLabel() {
            return this.$t('program');
        },
        courseLabel() {
            return this.isThaiLocale ? 'รายวิชา' : 'Course';
        },
        semesterLabel() {
            return this.$t('semester');
        },
        academicYearLabel() {
            return this.$t('academicYear');
        },
        selectSchoolLabel() {
            return this.$t('components.administrator_studentfiltercard_vue_select_school');
        },
        selectProgramLabel() {
            return this.$t('components.administrator_studentfiltercard_vue_select_program');
        },
        selectCourseLabel() {
            return this.$t('course');
        },
        selectSemesterLabel() {
            return this.$t('components.administrator_studentfiltercard_vue_select_semester');
        },
        submitLabel() {
            return this.isEditing ? this.$t('update') : this.$t('save');
        },

        formProgramOptions() {
            const lang = this.$i18n.locale || 'en';
            let source = this.storedPrograms || [];

            if (this.formStudent.school) {
                source = source.filter(program => program.school === this.formStudent.school);
            }

            return [
                { value: '', label: this.selectProgramLabel },
                ...source.map(item => {
                    const titleObj = item.title?.find(t => t.key === lang)
                        || item.title?.find(t => t.key === 'en')
                        || item.title?.find(t => t.key === 'th');
                    return {
                        value: item._id,
                        label: titleObj ? titleObj.value : ''
                    };
                })
            ];
        },
        schoolOptions() {
            if (!this.storedSchools) return [];
            const lang = this.$i18n.locale || 'en';
            return [
                { value: '', label: this.selectSchoolLabel },
                ...this.storedSchools.map(s => ({
                    value: s._id,
                    label: s.title?.find(t => t.key === lang)?.value
                        || s.title?.find(t => t.key === 'en')?.value
                        || s.title?.find(t => t.key === 'th')?.value
                        || s._id
                }))
            ];
        },
        courseOptions() {
            if (!this.storedCourses) return [];
            const lang = this.$i18n.locale || 'en';
            return [
                { value: '', label: this.selectCourseLabel },
                ...this.storedCourses.map(c => ({
                    value: c._id,
                    label: c.title?.find(t => t.key === lang)?.value
                        || c.title?.find(t => t.key === 'en')?.value
                        || c.title?.find(t => t.key === 'th')?.value
                        || c._id
                }))
            ];
        },
        semesterOptions() {
            const lang = this.$i18n.locale || 'en';
            let semesters = this.$store.getters['setting/semester/item'];
            if (!semesters || semesters.length === 0) {
                semesters = this.$store.getters['setting/status/item'] || [];
            }

            return [
                { value: '', label: this.selectSemesterLabel },
                ...semesters.map(s => {
                    const titleObj = Array.isArray(s.title)
                        ? (s.title.find(t => t.key === lang) || s.title.find(t => t.key === 'en') || s.title.find(t => t.key === 'th') || s.title[0])
                        : s.title;
                    return {
                        value: s._id,
                        label: titleObj ? titleObj.value : ''
                    };
                })
            ];
        }
    },
    methods: {
        openAdd() {
            this.ensureSemesters();
            this.isEditing = false;
            this.editID = null;
            this.originalStudent = null;
            this.formStudent = {
                studentID: '', nameThai: '', nameEnglish: '', email: '', company: '',
                school: '', schoolName: '', program: '', programName: '', course: '', courseName: '',
                semester: '', yearEn: '', yearTh: ''
            };
            this.show = true;
        },
        openEdit(student) {
            this.ensureSemesters();
            const getVal = (arr, k) => {
                if (!Array.isArray(arr)) return '';
                const item = arr.find(i => i.key === k);
                return item ? item.value : '';
            };

            const getYearVal = (yr, locale) => {
                if (Array.isArray(yr)) {
                    const found = yr.find(y => y.key === locale);
                    return found ? found.value : '';
                }
                if (yr && typeof yr === 'object') return yr.value || '';
                return yr || '';
            };

            this.isEditing = true;
            this.editID = student._id;
            this.originalStudent = JSON.parse(JSON.stringify(student || {}));

            this.formStudent = {
                studentID: student.studentID || '',
                nameThai: getVal(student.name, 'th'),
                nameEnglish: getVal(student.name, 'en'),
                email: student.email || '',
                company: student.company || '',
                school: student.info?.school?._id || student.info?.school || '',
                schoolName: student.info?.schoolName || '',
                program: student.info?.program?._id || student.info?.program || '',
                programName: student.info?.programName || '',
                course: student.info?.course?._id || student.info?.course || '',
                courseName: student.info?.courseName || '',
                semester: student.info?.semester?._id || student.info?.semester || '',
                yearEn: getYearVal(student.info?.year, 'en'),
                yearTh: getYearVal(student.info?.year, 'th')
            };
            this.show = true;
        },
        ensureSemesters() {
            const semesters = this.$store.getters['setting/semester/item'];
            if (!semesters || semesters.length === 0) {
                this.$store.dispatch('setting/semester/get');
            }
        },
        submit() {
            if (!this.formStudent.studentID || (!this.isEditing && !this.formStudent.email)) {
                alert(this.isThaiLocale ? 'กรุณากรอกรหัสนักศึกษาและอีเมลให้ครบ' : 'Student ID and Email are required');
                return;
            }
            const baseStudent = this.isEditing ? JSON.parse(JSON.stringify(this.originalStudent || {})) : {};
            const baseInfo = baseStudent.info || {};
            const studentData = {
                ...baseStudent,
                studentID: this.formStudent.studentID,
                name: [
                    { key: 'th', value: this.formStudent.nameThai || '' },
                    { key: 'en', value: this.formStudent.nameEnglish || '' }
                ],
                email: this.formStudent.email || baseStudent.email || null,
                info: {
                    ...baseInfo,
                    semester: this.formStudent.semester || baseInfo.semester || null,
                    program: this.formStudent.program || baseInfo.program || null,
                    programName: this.formStudent.programName || baseInfo.programName || null,
                    school: this.formStudent.school || baseInfo.school || null,
                    schoolName: this.formStudent.schoolName || baseInfo.schoolName || null,
                    course: this.formStudent.course || baseInfo.course || null,
                    courseName: this.formStudent.courseName || baseInfo.courseName || null,
                    year: [
                        this.formStudent.yearEn ? { key: 'en', value: String(this.formStudent.yearEn) } : null,
                        this.formStudent.yearTh ? { key: 'th', value: String(this.formStudent.yearTh) } : null
                    ].filter(Boolean)
                },
                company: this.formStudent.company || baseStudent.company || null,
            };

            if (this.isEditing) {
                studentData._id = this.editID;
                this.$store.dispatch("member/students/updateStudents", studentData).then(() => {
                    this.$emit('refresh');
                    this.show = false;
                    alert(this.isThaiLocale ? `อัปเดตนักศึกษา ${studentData.studentID} สำเร็จ` : `Student ${studentData.studentID} updated successfully!`);
                }).catch(err => {
                    console.error("Failed to update student:", err);
                    alert(this.isThaiLocale ? 'อัปเดตนักศึกษาไม่สำเร็จ' : 'Failed to update student.');
                });
            } else {
                this.$store.dispatch("member/students/createStudents", [studentData]).then(() => {
                    this.$emit('refresh');
                    this.show = false;
                    alert(this.isThaiLocale ? `เพิ่มนักศึกษา ${studentData.studentID} สำเร็จ` : `Student ${studentData.studentID} added successfully!`);
                }).catch(err => {
                    console.error("Failed to add student:", err);
                    alert(this.isThaiLocale ? 'เพิ่มนักศึกษาไม่สำเร็จ' : 'Failed to add student.');
                });
            }
        }
    }
}
</script>
