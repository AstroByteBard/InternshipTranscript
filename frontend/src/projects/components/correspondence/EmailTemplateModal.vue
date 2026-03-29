<template>
    <CModal :centered="true" :show.sync="visible" :close-on-backdrop="true" size="lg" @update:show="handleModalClose">
        <template #header>
            <h5 class="modal-title font-weight-bold" style="color: #111827;">
                {{ isEditing ? 'EditEmailTemplate' : 'Create Email Template' }}
            </h5>
            <CButtonClose @click="visible = false" class="text-black" />
        </template>
        <div class="px-3 py-2">
            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">
                    Template Name <span class="text-danger">*</span>
                </label>
                <CInput v-model="form.title" placeholder="e.g. Acceptance Letter" class="custom-input shadow-sm" />
            </div>

            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">
                    Subject <span class="text-danger">*</span>
                </label>
                <CInput v-model="form.subject" placeholder="e.g. Regarding your application"
                    class="custom-input shadow-sm" />
            </div>

            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">
                    Insert Variables
                </label>
                <div class="d-flex flex-wrap" style="gap: 16px;">
                    <CButton v-for="variable in availableVariables" :key="variable" class="variable-btn shadow-sm"
                        size="sm" @click="insertVariable(variable)">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ variable }}
                    </CButton>
                </div>
            </div>

            <div>
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">
                    Content <span class="text-danger">*</span>
                </label>
                <CTextarea v-model="form.template" :rows="8" class="custom-textarea shadow-sm"
                    placeholder="Write your email content here..." style="border-color: #ef4444;" />
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end px-3 py-2">
                <CButton color="light" class="mr-3 filter-card font-weight-bold"
                    style="color: #4b5563; padding: 8px 24px;" @click="visible = false">
                    Cancel
                </CButton>
                <CButton color="danger" class="font-weight-bold px-4 d-flex align-items-center"
                    style="padding: 8px 24px; border-radius: 6px;" @click="submit">
                    <CIcon name="cil-save" class="mr-2" />
                    {{ isEditing ? 'Update Template' : 'Save Template' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'EmailTemplateModal',
    props: {
        show: { type: Boolean, default: false },
        isEditing: { type: Boolean, default: false },
        templateData: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            form: {
                title: '',
                subject: '',
                template: ''
            },
            availableVariables: [
                'Student Name',
                'Student ID',
                'School',
                'Program',
                'Academic Year'
            ]
        }
    },
    computed: {
        visible: {
            get() { return this.show },
            set(value) { this.$emit('update:show', value) }
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.resetForm();
            }
        },
        templateData: {
            handler(newData) {
                if (newData && Object.keys(newData).length > 0) {
                    this.form = {
                        title: newData.title || '',
                        subject: newData.subject || '',
                        template: newData.template || newData.templete || ''
                    };
                }
            },
            immediate: true
        }
    },
    methods: {
        resetForm() {
            if (!this.isEditing) {
                this.form = {
                    title: '',
                    subject: '',
                    template: ''
                };
            }
        },
        insertVariable(variableName) {
            const tag = `{{${variableName}}}`;
            this.form.template = this.form.template ? this.form.template + ' ' + tag : tag;
        },
        handleModalClose(val) {
            if (!val) {
                this.$emit('modal-close');
            }
        },
        submit() {
            if (!this.form.title || !this.form.template) {
                alert("Template Name and Content are required");
                return;
            }
            this.$emit('submit', { ...this.form });
        }
    }
}
</script>

<style scoped>
/* Modal Form Customizing */
::v-deep .custom-input .form-control,
::v-deep .custom-textarea .form-control {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 12px 16px;
    color: #374151;
    font-size: 14px;
}

::v-deep .custom-input .form-control:focus,
::v-deep .custom-textarea .form-control:focus {
    box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.25);
    border-color: #ef4444;
}

.variable-btn {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
    font-weight: 500;
    border-radius: 6px;
    padding: 6px 12px;
    transition: all 0.2s;
}

.variable-btn:hover {
    background-color: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
}

.filter-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff;
}
</style>