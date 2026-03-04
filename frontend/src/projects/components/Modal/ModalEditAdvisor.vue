<template>
    <CModal :title="isEditing ? 'Edit Advisor' : 'Add New Advisor'" :show.sync="show" color="danger" size="lg">
        <CRow>
            <CCol sm="6">
                <CInput label="Evaluator's Email *" placeholder="Enter Evaluator Email" type="email"
                    v-model="formAdvisor.email" />
            </CCol>
            <CCol sm="6">
                <CInput label="Student ID Linked" placeholder="Enter Student ID" v-model="formAdvisor.studentID" />
            </CCol>
            <CCol sm="12">
                <CInput label="Organisation Name" placeholder="Organization Name"
                    v-model="formAdvisor.organizationName" />
            </CCol>
            <CCol sm="12">
                <CInput label="Organisation Address" placeholder="Organization Address"
                    v-model="formAdvisor.organizationAddress" />
            </CCol>
            <CCol sm="6">
                <CSelect label="Province" :options="provinceOptions" :value.sync="formAdvisor.province" />
            </CCol>
            <CCol sm="6">
                <CInput label="Academic Year" placeholder="Year" v-model="formAdvisor.year" />
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
    name: 'ModalEditAdvisor',
    data() {
        return {
            show: false,
            isEditing: false,
            editID: null,
            formAdvisor: {
                email: '',
                studentID: '',
                organizationName: '',
                organizationAddress: '',
                province: '',
                year: ''
            },
        }
    },
    computed: {
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),

        provinceOptions() {
            if (!this.storedAdvisors) return [];
            const provinces = new Set(this.storedAdvisors.map(a => a.province).filter(p => p));
            return [
                { value: '', label: 'Select Province' },
                ...Array.from(provinces).sort().map(p => ({ value: p, label: p }))
            ];
        }
    },
    methods: {
        openAdd() {
            this.isEditing = false;
            this.editID = null;
            this.formAdvisor = {
                email: '', studentID: '', organizationName: '', organizationAddress: '', province: '', year: ''
            };
            this.show = true;
        },
        openEdit(item) {
            this.isEditing = true;
            this.editID = item._id;
            this.formAdvisor = {
                email: item.email || '',
                studentID: item.student ? item.student.studentID : '',
                organizationName: item.organizationName || '',
                organizationAddress: item.organizationAddress || '',
                province: item.province || '',
                year: item.year || ''
            };
            this.show = true;
        },
        submit() {
            if (!this.formAdvisor.email) {
                alert("Evaluator's Email is required");
                return;
            }

            let studentRefId = null;
            if (this.formAdvisor.studentID) {
                const foundStudent = this.storedStudents.find(s => s.studentID === String(this.formAdvisor.studentID));
                if (foundStudent) {
                    studentRefId = foundStudent._id;
                } else {
                    alert(`Student ID ${this.formAdvisor.studentID} not found. Cannot link to student.`);
                    return; // Prevent saving if they typed a wrong ID
                }
            }

            const advisorData = {
                organizationName: this.formAdvisor.organizationName || null,
                organizationAddress: this.formAdvisor.organizationAddress || null,
                email: this.formAdvisor.email,
                province: this.formAdvisor.province || null,
                student: studentRefId,
                year: this.formAdvisor.year ? String(this.formAdvisor.year) : new Date().getFullYear().toString()
            };

            if (this.isEditing) {
                advisorData._id = this.editID;
                this.$store.dispatch("member/advisors/updateAdvisors", [advisorData]).then(() => {
                    this.$emit('refresh');
                    this.show = false;
                    alert(`Advisor updated successfully!`);
                }).catch(err => {
                    console.error("Failed to update advisor:", err);
                    alert("Failed to update advisor.");
                });
            } else {
                this.$store.dispatch("member/advisors/createAdvisors", [advisorData]).then(() => {
                    this.$emit('refresh');
                    this.show = false;
                    alert(`Advisor created successfully!`);
                }).catch(err => {
                    console.error("Failed to create advisor:", err);
                    alert("Failed to create advisor.");
                });
            }
        },
    }
}
</script>
