<template>
    <CRow class="mb-4">
        <CCol sm="6">
            <div class="custom-segmented-control">
                <CButtonGroup class="w-100 h-100">
                    <CButton class="segment-btn font-weight-bold" :class="{ 'active': value === 'Student' }"
                        @click="$emit('input', 'Student')">{{ $t('components.buttongroup_buttongroupadministrator_vue_student') }}</CButton>
                    <CButton class="segment-btn font-weight-bold" :class="{ 'active': value === 'Advisor' }"
                        @click="$emit('input', 'Advisor')">{{ $t('components.buttongroup_buttongroupadministrator_vue_advisor') }}</CButton>
                </CButtonGroup>
            </div>
        </CCol>

        <CCol sm="6" class="text-right align-self-center d-flex justify-content-end align-items-center">
            <div class="d-flex align-items-center">
                <template v-if="value === 'Student'">
                    <input type="file" ref="fileInput" @change="onFileChangeStudent" accept=".xlsx, .xls, .csv"
                        style="display: none;" />
                    <CButton class="btn-import mr-2" @click="$refs.fileInput.click()">
                        <CIcon name="cil-cloud-upload" class="mr-2" />{{ $t('components.buttongroup_buttongroupadministrator_vue_import') }}</CButton>
                    <CButton class="btn-filter-action btn-filter-red" @click="$emit('add-student')">
                        <CIcon name="cil-plus" class="mr-2" />{{ $t('components.buttongroup_buttongroupadministrator_vue_add_student') }}</CButton>
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
import { buildStudentImportPayload, normalizeHeader } from '@/utils/studentImport';

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
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),
        ...mapGetters('setting/semester', { storedSemesters: 'item' }),
        ...mapGetters('setting/province', { storedProvinces: 'province' })
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

                const headers = (jsonData[0] || []).map(h => (h === undefined || h === null) ? '' : String(h));
                const rows = jsonData.slice(1);

                const payload = [];

                rows.forEach(row => {
                    if (!Array.isArray(row) || row.length === 0) return;

                    const studentData = buildStudentImportPayload(row, headers, {
                        programs: this.storedPrograms,
                        schools: this.storedSchools,
                        courses: this.storedCourses,
                        semesters: this.storedSemesters
                    });
                    if (studentData) payload.push(studentData);
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

            const columnMap = {
                'Student ID': 'studentID',
                'Name-Surname(TH)': null,
                'Organisation Name(TH)': 'organizationName',
                'Organisation Adress': 'organizationAddress',
                'Province(TH)': 'province',
                'Evaluators Email': 'email'
            };

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetNames = Array.isArray(workbook?.SheetNames) ? workbook.SheetNames : [];
                    const payload = [];
                    let processedSheets = 0;

                    sheetNames.forEach((sheetName) => {
                        const worksheet = workbook?.Sheets?.[sheetName];
                        if (!worksheet) return;

                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        if (!Array.isArray(jsonData) || jsonData.length < 1) return;

                        let headerIndex = -1;
                        let rawHeaders = [];
                        const normalizedTargets = Object.keys(columnMap).map(normalizeHeader);
                        for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                            const row = jsonData[i];
                            if (!Array.isArray(row)) continue;
                            const normalizedRow = row.map(h => normalizeHeader(h));
                            if (normalizedTargets.some(t => normalizedRow.includes(t))) {
                                headerIndex = i;
                                rawHeaders = row.map(h => (h === undefined || h === null) ? '' : String(h));
                                break;
                            }
                        }

                        if (headerIndex === -1) return;

                        const colIndices = {};
                        Object.keys(columnMap).forEach((colName) => {
                            const norm = normalizeHeader(colName);
                            const idx = rawHeaders.findIndex(h => normalizeHeader(h) === norm);
                            if (idx !== -1) colIndices[colName] = idx;
                        });

                        const rows = jsonData.slice(headerIndex + 1);

                        rows.forEach(row => {
                            if (row.length === 0) return;

                            const getVal = (colName) => {
                                const idx = colIndices[colName];
                                return idx !== undefined && row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : null;
                            };

                            const email = getVal('Evaluators Email');
                            if (!email) return;

                            const studentID = getVal('Student ID');
                            let studentRefId = null;
                            if (studentID) {
                                const foundStudent = this.storedStudents.find(s => s.studentID === studentID);
                                if (foundStudent) {
                                    studentRefId = foundStudent._id;
                                } else {
                                    console.warn(`Student ID ${studentID} not found in database. Advisor ${email} will have no student linked.`);
                                }
                            }

                            const provinceRaw = getVal('Province(TH)');
                            let provinceId = null;
                            if (provinceRaw) {
                                const cleanProv = provinceRaw.toLowerCase();
                                const foundProv = (this.storedProvinces || []).find(p => {
                                    if (!p.title || !Array.isArray(p.title)) return false;
                                    return p.title.some(t => t.value && t.value.toLowerCase().trim() === cleanProv);
                                });
                                if (foundProv) provinceId = foundProv._id;
                            }

                            const advisorData = {
                                organizationName: getVal('Organisation Name(TH)'),
                                organizationAddress: getVal('Organisation Adress'),
                                email: email,
                                province: provinceId,
                                student: studentRefId
                            };

                            payload.push(advisorData);
                        });

                        processedSheets++;
                    });

                    if (payload.length > 0) {
                        this.$store.dispatch("member/advisors/createAdvisors", payload).then(() => {
                            this.$emit('refresh');
                            alert(`Imported ${payload.length} advisors from ${processedSheets} sheet(s) successfully.`);
                        }).catch(err => {
                            console.error('Error importing advisors:', err);
                            alert('Failed to import advisors.');
                        });
                    } else {
                        alert('No valid advisor data found to import. Ensure emails are provided.');
                    }
                } catch (err) {
                    console.error('Import advisor error:', err);
                    alert('Import Error: ' + (err.message || err));
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
