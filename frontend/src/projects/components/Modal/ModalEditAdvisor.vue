<template>
    <CModal :title="$t('components.modal_modaleditadvisor_vue_isediting_edit_advisor_add_new_ad')" :show.sync="show"
        color="danger" size="lg">
        <CRow>
            <CCol sm="6">
                <CInput :label="$t('components.modal_modaleditadvisor_vue_enter_evaluator_email') + ' *'"
                    :placeholder="$t('components.modal_modaleditadvisor_vue_enter_evaluator_email')" type="email"
                    v-model="formAdvisor.email" />
            </CCol>
            <CCol sm="6">
                <CInput :label="$t('components.modal_modaleditadvisor_vue_enter_student_id')"
                    :placeholder="$t('components.modal_modaleditadvisor_vue_enter_student_id')"
                    v-model="formAdvisor.studentID" />
            </CCol>
            <CCol sm="12">
                <CInput :label="$t('components.modal_modaleditadvisor_vue_organization_name')"
                    :placeholder="$t('components.modal_modaleditadvisor_vue_organization_name')"
                    v-model="formAdvisor.organizationName" />
            </CCol>
            <CCol sm="12">
                <CInput :label="$t('components.modal_modaleditadvisor_vue_organization_address')"
                    :placeholder="$t('components.modal_modaleditadvisor_vue_organization_address')"
                    v-model="formAdvisor.organizationAddress" />
            </CCol>
            <CCol sm="6">
                <CSelect :label="$t('components.filter_adminstrator_filteradvisor_vue_province')"
                    :options="provinceOptions" :value="formAdvisor.province"
                    @update:value="formAdvisor.province = $event" />
            </CCol>
            <CCol sm="6">
                <CInput :label="$t('components.modal_modaleditadvisor_vue_year')"
                    :placeholder="$t('components.modal_modaleditadvisor_vue_year')" v-model="formAdvisor.year" />
            </CCol>
        </CRow>
        <template #footer>
            <CButton color="secondary" @click="show = false">{{ $t('components.modal_modaleditadvisor_vue_cancel') }}
            </CButton>
            <CButton color="danger" @click="submit">{{ isEditing ? $t('update') : $t('save') }}</CButton>
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
            const lang = this.$i18n.locale || 'en';
            const provinces = this.$store.getters['setting/province/province'] || [];
            return [
                { value: '', label: 'Select Province' },
                ...provinces.map(p => {
                    const titleObj = (Array.isArray(p.title) ? p.title.find(t => t.key === lang) : null) || (Array.isArray(p.title) ? p.title[0] : null);
                    return {
                        value: p._id,
                        label: titleObj ? titleObj.value : p._id
                    };
                })
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
                province: item.province ? (item.province._id || item.province) : '',
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
                this.$store.dispatch("member/advisors/updateAdvisors", advisorData).then(() => {
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
