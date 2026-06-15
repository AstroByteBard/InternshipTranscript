<template>
    <CModal :title="'Edit Semester'" :show.sync="showProxy" color="danger" size="lg" :centered="true">
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
            <CButton color="danger" @click="save">Save</CButton>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'SemesterEditModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        item: {
            type: Object,
            default: null
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
        item: {
            immediate: true,
            handler(value) {
                if (!value) {
                    this.formTitleTh = '';
                    this.formTitleEn = '';
                    return;
                }
                if (Array.isArray(value.title)) {
                    const th = value.title.find(t => t.key === 'th');
                    const en = value.title.find(t => t.key === 'en');
                    this.formTitleTh = th ? th.value : (value.primary || '');
                    this.formTitleEn = en ? en.value : (value.primary || '');
                } else {
                    this.formTitleTh = value.primary || '';
                    this.formTitleEn = value.primary || '';
                }
            }
        },
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