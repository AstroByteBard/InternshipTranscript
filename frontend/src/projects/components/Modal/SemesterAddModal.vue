<template>
    <CModal :title="'Add Semester'" :show.sync="showProxy" color="danger" size="lg" :centered="true">
        <CRow>
            <CCol sm="12">
                <CInput label="SEMESTER TH" v-model="formTitleTh" placeholder="ชื่อภาคการศึกษา (ไทย)" />
            </CCol>
            <CCol sm="12" class="mt-3">
                <CInput label="SEMESTER EN" v-model="formTitleEn" placeholder="Semester name (English)" />
            </CCol>
        </CRow>
        <template #footer>
            <CButton color="secondary" @click="showProxy = false">Cancel</CButton>
            <CButton color="danger" @click="save">Create</CButton>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'SemesterAddModal',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formTitleTh: '',
            formTitleEn: ''
        };
    },
    computed: {
        showProxy: {
            get() {
                return this.show;
            },
            set(value) {
                this.$emit('update:show', value);
            }
        }
    },
    watch: {
        show(value) {
            if (!value) {
                this.formTitleTh = '';
                this.formTitleEn = '';
            }
        }
    },
    methods: {
        save() {
            const th = String(this.formTitleTh || '').trim();
            const en = String(this.formTitleEn || '').trim();
            if (!th && !en) return;
            this.$emit('save', { th, en });
        }
    }
};
</script>

<style scoped>
.mt-3 {
    margin-top: 12px;
}
</style>
