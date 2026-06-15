<template>
    <CModal :title="'Edit Major'" :show.sync="showProxy" color="danger" size="lg" :centered="true">
        <CRow>
            <CCol sm="12">
                <CSelect :label="schoolLabel" :options="schoolOptions" :value.sync="formSchool" />
            </CCol>
            <CCol sm="12" class="mt-3">
                <CInput label="MAJOR TH" v-model="formTitleTh" placeholder="ชื่อสาขา (ไทย)" />
            </CCol>
            <CCol sm="12" class="mt-3">
                <CInput label="MAJOR EN" v-model="formTitleEn" placeholder="Major name (English)" />
            </CCol>
        </CRow>
        <template #footer>
            <CButton color="secondary" @click="showProxy = false">Cancel</CButton>
            <CButton color="danger" @click="save">Save</CButton>
        </template>
    </CModal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'MajorEditModal',
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
            formTitleEn: '',
            formSchool: ''
        };
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        schoolLabel() {
            return 'SELECT SCHOOL';
        },
        schoolOptions() {
            const lang = this.$i18n.locale || 'en';
            if (!this.storedSchools) return [{ value: '', label: this.schoolLabel }];
            return [
                { value: '', label: this.schoolLabel },
                ...this.storedSchools.map(s => ({
                    value: s._id,
                    label: s.title?.find(t => t.key === lang)?.value || s.title?.find(t => t.key === 'en')?.value || s._id
                }))
            ];
        },
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
                    this.formSchool = '';
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
                this.formSchool = value.school?._id || value.school || '';
            }
        },
        show(value) {
            if (!value) {
                this.formTitleTh = '';
                this.formTitleEn = '';
                this.formSchool = '';
            }
        }
    },
    methods: {
        save() {
            const th = String(this.formTitleTh || '').trim();
            const en = String(this.formTitleEn || '').trim();
            const school = this.formSchool || null;
            if (!th && !en) return;
            this.$emit('save', { th, en, school });
        }
    }
};
</script>

<style scoped>
.mt-3 {
    margin-top: 12px;
}
</style>