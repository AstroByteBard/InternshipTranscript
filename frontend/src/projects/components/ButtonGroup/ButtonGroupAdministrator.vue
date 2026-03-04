<template>
    <CRow class="mb-4">
        <CCol sm="6">
            <div class="custom-segmented-control">
                <CButtonGroup class="w-100 h-100">
                    <CButton class="segment-btn font-weight-bold" :class="{ 'active': value === 'Student' }"
                        @click="$emit('input', 'Student')">
                        Student
                    </CButton>
                    <CButton class="segment-btn font-weight-bold" :class="{ 'active': value === 'Advisor' }"
                        @click="$emit('input', 'Advisor')">
                        Advisor
                    </CButton>
                </CButtonGroup>
            </div>
        </CCol>

        <CCol sm="6" class="text-right align-self-center d-flex justify-content-end align-items-center">
            <div class="d-flex align-items-center">
                <template v-if="value === 'Student'">
                    <input type="file" ref="fileInput" @change="onFileChangeStudent" accept=".xlsx, .xls, .csv"
                        style="display: none;" />
                    <CButton class="btn-import mr-2" @click="$refs.fileInput.click()">
                        <CIcon name="cil-cloud-upload" class="mr-2" /> Import
                    </CButton>
                    <CButton class="btn-filter-action btn-filter-red" @click="$emit('add-student')">
                        <CIcon name="cil-plus" class="mr-2" /> Add Student
                    </CButton>
                </template>
                <template v-if="value === 'Advisor'">
                    <input type="file" ref="fileInputAdvisor" @change="onFileChangeAdviser" accept=".xlsx, .xls, .csv"
                        style="display: none;" />
                    <CButton class="btn-import mr-2" @click="$refs.fileInputAdvisor.click()">
                        <CIcon name="cil-cloud-upload" class="mr-2" /> Import
                    </CButton>
                    <CButton class="btn-filter-action btn-filter-red" @click="$emit('add-advisor')">
                        <CIcon name="cil-plus" class="mr-2" /> Add Advisor
                    </CButton>
                </template>
            </div>
        </CCol>
    </CRow>
</template>

<script>
import * as XLSX from 'xlsx';
import { mapGetters } from 'vuex';

export default {
    name: 'ButtonGroupAdministrator',
    props: {
        value: {
            type: String,
            default: 'Student'
        }
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' })
    },
    methods: {
        onFileChangeStudent(e) {
            const files = e.target.files;
            if (!files.length) return;

            const file = files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays

                if (jsonData.length < 2) return; // No data

                const headers = jsonData[0].map(h => h.toString().toLowerCase().trim());
                const rows = jsonData.slice(1);

                const payload = [];

                rows.forEach(row => {
                    if (row.length === 0) return;

                    // Helper to get value by header name
                    const getValue = (headerName) => {
                        const index = headers.indexOf(headerName.toLowerCase());
                        return index !== -1 ? row[index] : null;
                    };

                    const studentID = getValue('ID')
                    const nameThai = getValue('Name-Surname (Thai)')
                    const nameEnglish = getValue('Name-Surname')
                    const email = getValue('Email');
                    const programName = getValue('Programe');
                    const schoolName = getValue('School');
                    const courseName = getValue('Course');
                    const company = getValue('Organization name');
                    const semester = getValue('Semester');
                    const year = getValue('Year');

                    if (!studentID) return;

                    const foundProgram = this.storedPrograms.find(p => Array.isArray(p.title) && p.title.some(t => t.key === 'en' && t.value === programName));
                    const foundSchool = this.storedSchools.find(s => Array.isArray(s.title) && s.title.some(t => t.key === 'en' && t.value === schoolName));
                    const foundCourse = this.storedCourses.find(c => Array.isArray(c.title) && c.title.some(t => t.key === 'en' && t.value === courseName));

                    const studentData = {
                        studentID,
                        name: [
                            { key: 'th', value: nameThai || '' },
                            { key: 'en', value: nameEnglish || '' }
                        ],
                        email,
                        info: {
                            semester: semester ? String(semester) : null,
                            program: foundProgram ? foundProgram._id : null,
                            school: foundSchool ? foundSchool._id : null,
                            course: foundCourse ? foundCourse._id : null,
                            year: year
                        },
                        company: company,
                    };
                    payload.push(studentData);
                });

                if (payload.length > 0) {
                    this.$store.dispatch("member/students/createStudents", payload).then(() => {
                        this.$emit('refresh');
                        alert(`Imported ${payload.length} students successfully.`);
                    });
                }
                this.$refs.fileInput.value = '';
            };
            reader.readAsArrayBuffer(file);
        },
        onFileChangeAdviser(e) {
            const files = e.target.files;
            if (!files.length) return;

            const file = files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) return;

                const headers = jsonData[1].map(h => h ? h.toString().toLowerCase().trim() : '');
                const rows = jsonData.slice(1);
                console.log(headers)
                const payload = [];

                rows.forEach(row => {
                    if (row.length === 0) return;

                    const getValue = (headerName) => {
                        const index = headers.indexOf(headerName.toLowerCase());
                        return index !== -1 ? row[index] : null;
                    };

                    const organizationName = getValue('ชื่อสถานประกอบการ\r\norganisation name');
                    const organizationAddress = getValue('ที่อยู่สถานประกอบการ\r\norganisation adress');
                    const province = getValue('จังหวัด\r\nprovince');
                    const email = getValue("อีเมลผู้ประเมิน\r\nevaluator's email");
                    const studentID = getValue('รหัสประจำตัว\r\nstudent id');

                    if (!email) return;

                    let studentRefId = null;
                    if (studentID) {
                        const foundStudent = this.storedStudents.find(s => s.studentID === String(studentID));
                        if (foundStudent) {
                            studentRefId = foundStudent._id;
                        } else {
                            console.warn(`Student ID ${studentID} not found in database. Advisor ${email} will have no student linked.`);
                        }
                    }

                    const advisorData = {
                        organizationName: organizationName || null,
                        organizationAddress: organizationAddress || null,
                        email: email,
                        province: province || null,
                        student: studentRefId,
                        year: new Date().getFullYear().toString()
                    };

                    payload.push(advisorData);
                });

                if (payload.length > 0) {
                    this.$store.dispatch("member/advisors/createAdvisors", payload).then(() => {
                        this.$emit('refresh');
                        alert(`Imported ${payload.length} advisors successfully.`);
                    }).catch(err => {
                        console.error('Error importing advisors:', err);
                        alert('Failed to import advisors.');
                    });
                } else {
                    alert('No valid advisor data found to import. Ensure emails are provided.');
                }

                this.$refs.fileInputAdvisor.value = '';
            };
            reader.readAsArrayBuffer(file);
        }
    }
}
</script>

<style scoped>
.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
    width: 100%;
    max-width: 250px;
}

.segment-btn {
    background-color: transparent;
    color: #6b7280;
    border: none;
    padding: 7px 18px;
    font-size: 14px;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    box-shadow: none;
}

.segment-btn:hover {
    color: #374151;
    background-color: transparent;
}

.segment-btn.active {
    background-color: #ffffff !important;
    color: #111827 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
    border: none !important;
}

.segment-btn:focus,
.segment-btn.focus {
    box-shadow: none !important;
}

.btn-import {
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    color: #4b5563;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 18px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-import:hover {
    background-color: #f9fafb;
    color: #111827;
    border-color: #9ca3af;
}

.btn-filter-action {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 16px;
    display: inline-flex;
    align-items: center;
}

.btn-filter-action:hover {
    background-color: #f9fafb;
    color: #111827;
}

.btn-filter-red {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.btn-filter-red:hover {
    background-color: #fee2e2;
    color: #b91c1c;
}
</style>
