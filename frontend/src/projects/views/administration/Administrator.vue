<template>
    <div>

        <CRow class="mb-4">
            <CCol sm="6">
                <div class="custom-segmented-control">
                    <CButtonGroup class="w-100 h-100">
                        <CButton v-for="(value, key) in ['Student', 'Advisor']" :key="key"
                            class="segment-btn font-weight-bold" :class="{ 'active': value === selected }"
                            @click="selected = value">
                            {{ value }}
                        </CButton>
                    </CButtonGroup>
                </div>
            </CCol>


            <CCol sm="6" class="text-right align-self-center d-flex justify-content-end align-items-center">
                <div v-if="selected === 'Student'">
                    <input type="file" ref="fileInput" style="display: none" accept=".xlsx, .xls, .csv"
                        @change="onFileChange" />

                    <CButton class="btn-import mr-2" @click="$refs.fileInput.click()">
                        <CIcon name="cil-cloud-upload" class="mr-2" /> Import
                    </CButton>
                    <CButton class="btn-add-student" @click="openAddStudentModal">
                        <CIcon name="cil-user" class="mr-2" /> Add Student
                    </CButton>
                </div>

                <div v-if="selected === 'Advisor'">
                    <input type="file" ref="fileInput" style="display: none" accept=".xlsx, .xls, .csv"
                        @change="onFileChange" />

                    <CButton class="btn-import mr-2" @click="$refs.fileInput.click()">
                        <CIcon name="cil-cloud-upload" class="mr-2" /> Import
                    </CButton>
                    <CButton class="btn-add-student">
                        <CIcon name="cil-user" class="mr-2" /> Add Advisor
                    </CButton>
                </div>
            </CCol>
        </CRow>

        <div v-if="selected === 'Student'">
            <CCard class="mb-4 filter-card">
                <CCardBody class="p-3">
                    <CRow class="align-items-center mb-3">
                        <CCol md="8">
                            <div class="search-input-wrapper">
                                <CIcon name="cil-search" class="search-icon" />
                                <input type="text" class="form-control search-input"
                                    placeholder="Search by name, ID, or email..." v-model="search" />
                            </div>
                        </CCol>
                        <CCol md="4" class="d-flex justify-content-end align-items-center">
                            <CButton class="btn-filter-action btn-filter-red" @click="showFilters = !showFilters">
                                <CIcon name="cil-filter" class="mr-2" /> Filters
                            </CButton>
                        </CCol>
                    </CRow>

                    <transition name="slide">
                        <div v-show="showFilters">
                            <hr class="filter-divider" />
                            <CRow>
                                <CCol md="3">
                                    <label class="filter-label">SCHOOL</label>
                                    <CSelect class="custom-select-ui mb-0" :options="schoolOptions" :value.sync="school"
                                        placeholder="Select School" />
                                </CCol>
                                <CCol md="3">
                                    <label class="filter-label">PROGRAM</label>
                                    <CSelect class="custom-select-ui mb-0" :options="programOptions"
                                        :value.sync="program" placeholder="Select Program" />
                                </CCol>
                                <CCol md="3">
                                    <label class="filter-label">ACADEMIC YEAR</label>
                                    <CSelect class="custom-select-ui mb-0" :options="academicOptions"
                                        :value.sync="academic" placeholder="Select Academic" />
                                </CCol>
                                <CCol md="3">
                                    <label class="filter-label">SEMESTER</label>
                                    <CSelect class="custom-select-ui mb-0" :options="semesterOptions"
                                        :value.sync="semester" placeholder="Select Semester" />
                                </CCol>
                            </CRow>
                        </div>
                    </transition>
                </CCardBody>
            </CCard>


            <CRow>
                <CCol>
                    <CCard class="table-card border-0 shadow-sm mb-4">
                        <CDataTable class="custom-table mb-0" :items="filteredStudents" :fields="fields"
                            :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">

                            <!-- Under Table Pagination & Info -->
                            <template #under-table>
                                <div class="d-flex justify-content-between align-items-center px-4 py-3"
                                    style="border-top: 1px solid #f3f4f6;">
                                    <div class="text-muted" style="font-size: 13px;">
                                        Showing {{ tableStartItem }} to {{ tableEndItem }} of {{ filteredStudents.length
                                        }} results
                                    </div>
                                    <CPagination :activePage.sync="activePage" :pages="totalPages" :doubleArrows="false"
                                        align="end" class="mb-0 custom-pagination" />
                                </div>
                            </template>

                            <!-- Name Combo -->
                            <template #nameCombo="{ item }">
                                <td class="align-middle">
                                    <div><strong>{{ item.nameThai || '-' }}</strong></div>
                                    <div class="text-muted small">{{ item.nameEnglish || '-' }}</div>
                                </td>
                            </template>

                            <!-- Email / Company Combo -->
                            <template #emailCompanyCombo="{ item }">
                                <td class="align-middle">
                                    <div><strong>{{ item.email || '-' }}</strong></div>
                                    <div class="text-muted small">{{ item.company || '-' }}</div>
                                </td>
                            </template>

                            <!-- School / Program Combo -->
                            <template #schoolProgram="{ item }">
                                <td class="align-middle">
                                    <div><strong>{{ item.schoolName || '-' }}</strong></div>
                                    <div class="text-muted small">{{ item.programName || '-' }}</div>
                                </td>
                            </template>

                            <!-- Actions -->
                            <template #actions="{ item }">
                                <td class="text-center align-middle">
                                    <CButton class="btn-action-icon mr-2" @click="editStudent(item)" title="Edit">
                                        <CIcon name="cil-pencil" />
                                    </CButton>
                                    <CButton class="btn-action-icon" @click="deleteStudent(item)" title="Delete">
                                        <CIcon name="cil-trash" />
                                    </CButton>
                                </td>
                            </template>

                        </CDataTable>
                    </CCard>
                </CCol>
            </CRow>
        </div>

        <!-- Advisor View Context -->
        <div v-if="selected === 'Advisor'">
            <CCard class="mb-4 filter-card">
                <CCardBody class="p-3">
                    <CRow class="align-items-center mb-3">
                        <CCol md="8">
                            <div class="search-input-wrapper">
                                <CIcon name="cil-search" class="search-icon" />
                                <input type="text" class="form-control search-input"
                                    placeholder="Search by name, ID, or email..." v-model="searchAdvisor" />
                            </div>
                        </CCol>
                        <CCol md="4" class="d-flex justify-content-end align-items-center">
                            <CButton class="btn-filter-action btn-filter-red">
                                <CIcon name="cil-filter" class="mr-2" /> Filters
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <CRow>
                <CCol>
                    <CCard class="table-card border-0 shadow-sm mb-4">
                        <CDataTable class="custom-table mb-0" :items="filteredAdvisors" :fields="advisorFields"
                            :items-per-page="itemsPerPage" :pagination="false" hover
                            :activePage.sync="activePageAdvisor">

                            <!-- Name Combo -->
                            <template #nameCombo="{ item }">
                                <td class="align-middle">
                                    <div><strong>{{ item.nameThai || '-' }}</strong></div>
                                    <div class="text-muted small">{{ item.nameEnglish || '-' }}</div>
                                </td>
                            </template>

                            <!-- Actions -->
                            <template #actions="{ item }">
                                <td class="text-center align-middle">
                                    <CButton class="btn-action-icon mr-2" @click="editAdvisor(item)" title="Edit">
                                        <CIcon name="cil-pencil" />
                                    </CButton>
                                    <CButton class="btn-action-icon" @click="deleteAdvisor(item)" title="Delete">
                                        <CIcon name="cil-trash" />
                                    </CButton>
                                </td>
                            </template>

                            <!-- Under Table Pagination & Info -->
                            <template #under-table>
                                <div class="d-flex justify-content-between align-items-center px-4 py-3"
                                    style="border-top: 1px solid #f3f4f6;">
                                    <div class="text-muted" style="font-size: 13px;">
                                        Showing {{ tableStartItemAdvisor }} to {{ tableEndItemAdvisor }} of {{
                                        filteredAdvisors.length }}
                                        results
                                    </div>
                                    <CPagination :activePage.sync="activePageAdvisor" :pages="totalPagesAdvisor"
                                        :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                                </div>
                            </template>

                        </CDataTable>
                    </CCard>
                </CCol>
            </CRow>
        </div>

        <!-- Add/Edit Student Modal -->
        <CModal :title="isEditingStudent ? 'Edit Student' : 'Add New Student'" :show.sync="showAddStudentModal"
            color="danger" size="lg">
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
                <CButton color="secondary" @click="showAddStudentModal = false">Cancel</CButton>
                <CButton color="danger" @click="submitAddStudent">{{ isEditingStudent ? 'Update Student' : 'SaveStudent' }}</CButton>
            </template>
        </CModal>

    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as XLSX from 'xlsx'

export default {
    name: 'student',
    components: {

    },
    data() {
        return {
            isEditingStudent: false,
            editStudentID: null,
            showAddStudentModal: false,
            formStudent: {
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
            },
            showFilters: false,
            selected: 'Student',
            activePage: 1,
            activePageAdvisor: 1,
            itemsPerPage: 5,
            search: '',
            searchAdvisor: '',
            school: '',
            program: '',
            academic: '',
            semester: '',
            fields: [
                { key: 'studentID', label: 'studentID' },
                { key: 'nameCombo', label: 'NAME' },
                { key: 'emailCompanyCombo', label: 'EMAIL / COMPANY' },
                { key: 'schoolProgram', label: 'SCHOOL / PROGRAM' },
                { key: 'courseName', label: 'COURSE' },
                { key: 'semester', label: 'SEMESTER' },
                { key: 'year', label: 'Year' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            advisorFields: [
                { key: 'advisorID', label: 'advisorID' },
                { key: 'nameCombo', label: 'NAME' },
                { key: 'email', label: 'EMAIL' },
                { key: 'department', label: 'DEPARTMENT' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
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
        },
        onFileChange(e) {
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
                        this.onInit();
                        alert(`Imported ${payload.length} students successfully.`);
                    });
                }

                this.$refs.fileInput.value = '';
            };
            reader.readAsArrayBuffer(file);
        },
        openAddStudentModal() {
            this.isEditingStudent = false;
            this.editStudentID = null;
            this.formStudent = {
                studentID: '', nameThai: '', nameEnglish: '', email: '', company: '',
                school: '', program: '', course: '', semester: '', year: ''
            };
            this.showAddStudentModal = true;
        },
        submitAddStudent() {
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

            if (this.isEditingStudent) {
                studentData._id = this.editStudentID;
                this.$store.dispatch("member/students/updateStudents", studentData).then(() => {
                    this.onInit();
                    this.showAddStudentModal = false;
                    alert(`Student ${studentData.studentID} updated successfully!`);
                }).catch(err => {
                    console.error("Failed to update student:", err);
                    alert("Failed to update student.");
                });
            } else {
                this.$store.dispatch("member/students/createStudents", [studentData]).then(() => {
                    this.onInit();
                    this.showAddStudentModal = false;
                    alert(`Student ${studentData.studentID} added successfully!`);
                }).catch(err => {
                    console.error("Failed to add student:", err);
                    alert("Failed to add student.");
                });
            }
        },
        editStudent(student) {
            const getVal = (arr, k) => {
                if (!Array.isArray(arr)) return '';
                const item = arr.find(i => i.key === k);
                return item ? item.value : '';
            };

            this.isEditingStudent = true;
            this.editStudentID = student._id;

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
            this.showAddStudentModal = true;
        },
        deleteStudent(student) {
            const displayName = student.nameThai || student.nameEnglish || student.studentID || 'this student';
            if (confirm(`Are you sure you want to delete ${displayName}?`)) {
                this.$store.dispatch("member/students/deleteStudents", { _id: student._id }).then(() => {
                    this.onInit();
                }).catch(err => {
                    console.error("Failed to delete student:", err);
                    alert("Failed to delete student. Please try again.");
                });
            }
        },
        editAdvisor(advisor) {
            console.log('Edit advisor', advisor);
        },
        deleteAdvisor(advisor) {
            console.log('Delete advisor', advisor);
        }
    },

    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/course', { storedCourses: 'course' }),
        ...mapGetters('member/students', { storedStudents: 'students' }),

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
                if (this.school && student.info?.school?._id !== this.school) return false;
                if (this.program && student.info?.program?._id !== this.program) return false;
                if (this.academic && String(student.year) !== String(this.academic)) return false;
                if (this.semester && String(student.semester) !== String(this.semester)) return false;

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

        formProgramOptions() {
            const lang = this.$i18n.locale;
            let source = this.storedPrograms || [];

            // Filter programs based on the School selected IN THE MODAL, not the page filter
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

        totalPages() {
            return Math.ceil(this.filteredStudents.length / this.itemsPerPage) || 1;
        },
        tableStartItem() {
            if (this.filteredStudents.length === 0) return 0;
            return ((this.activePage - 1) * this.itemsPerPage) + 1;
        },
        tableEndItem() {
            const end = this.activePage * this.itemsPerPage;
            return end > this.filteredStudents.length ? this.filteredStudents.length : end;
        },

        // Advisor Computeds
        filteredAdvisors() {
            // Placeholder: Return empty array or filter from a Vuex state later
            const dummyAdvisors = [];
            const searchLower = this.searchAdvisor.toLowerCase();
            return dummyAdvisors.filter(adv => {
                const matches = (adv.nameThai && adv.nameThai.toLowerCase().includes(searchLower)) ||
                    (adv.nameEnglish && adv.nameEnglish.toLowerCase().includes(searchLower)) ||
                    (adv.advisorID && adv.advisorID.toLowerCase().includes(searchLower)) ||
                    (adv.email && adv.email.toLowerCase().includes(searchLower));
                return matches;
            });
        },

        totalPagesAdvisor() {
            return Math.ceil(this.filteredAdvisors.length / this.itemsPerPage) || 1;
        },
        tableStartItemAdvisor() {
            if (this.filteredAdvisors.length === 0) return 0;
            return ((this.activePageAdvisor - 1) * this.itemsPerPage) + 1;
        },
        tableEndItemAdvisor() {
            const end = this.activePageAdvisor * this.itemsPerPage;
            return end > this.filteredAdvisors.length ? this.filteredAdvisors.length : end;
        }
    }
}
</script>

<style scoped>
.table-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    padding-bottom: 8px;
}

::v-deep .custom-table table {
    margin-bottom: 0;
}

::v-deep .custom-table thead th {
    background-color: #ffffff !important;
    color: #9ca3af !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody td {
    color: #374151 !important;
    font-size: 14px;
    font-weight: 500;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody tr:hover td {
    background-color: #f9fafb !important;
}

::v-deep .custom-table tbody tr:last-child td {
    border-bottom: 1px solid #f3f4f6 !important;
}

::v-deep .custom-pagination {
    margin: 0;
}

::v-deep .custom-pagination .page-item .page-link {
    border: 1px solid #f3f4f6;
    color: #6b7280;
    background-color: white;
    margin: 0 2px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 13px;
    box-shadow: none;
}

::v-deep .custom-pagination .page-item:not(.disabled):hover .page-link {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #374151;
}

::v-deep .custom-pagination .page-item.active .page-link {
    background-color: #ffffff;
    border-color: #d1d5db;
    color: #111827;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

::v-deep .custom-pagination .page-item.disabled .page-link {
    color: #d1d5db;
    background-color: #ffffff;
    border-color: #f3f4f6;
}

/* Action Buttons within DataTable (Edit/Delete) */
.btn-action-icon {
    background-color: transparent !important;
    border: none !important;
    color: #9ca3af !important;
    border-radius: 6px;
    padding: 6px 8px;
    transition: all 0.2s;
    box-shadow: none !important;
}

.btn-action-icon:hover {
    color: #4b5563 !important;
    background-color: #f3f4f6 !important;
}

.btn-action-icon:focus {
    box-shadow: none !important;
}

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

/* Action Buttons (Import & Add Student) */
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

.btn-add-student {
    background-color: #c82333;
    /* CoreUI Red/Danger shade matching mockup */
    border: 1px solid #c82333;
    color: #ffffff;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 18px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-add-student:hover {
    background-color: #bd2130;
    border-color: #b21f2d;
    color: #ffffff;
}

/* Filter Card Styles */
.filter-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    width: 16px;
    height: 16px;
}

.search-input {
    padding-left: 36px !important;
    border-radius: 6px;
    background-color: #f9fafb;
    border: 1px solid #f3f4f6;
    color: #4b5563;
    font-size: 14px;
}

.search-input:focus {
    background-color: #ffffff;
    border-color: #d1d5db;
    box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.5);
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

.filter-divider {
    border-top: 1px solid #f3f4f6;
    margin: 0 -1rem 1rem -1rem;
}

.filter-label {
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    text-transform: uppercase;
}

.custom-select-ui select {
    background-color: #f9fafb !important;
    border: 1px solid #f3f4f6 !important;
    border-radius: 6px !important;
    color: #4b5563 !important;
    font-size: 14px !important;
}

.custom-select-ui select:focus {
    background-color: #ffffff !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
}

/* Slide Transition Animations */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 200px;
    opacity: 1;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
}
</style>