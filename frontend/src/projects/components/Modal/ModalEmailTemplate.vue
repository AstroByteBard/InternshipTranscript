<template>
    <CModal :centered="true" :show.sync="show" :close-on-backdrop="true" size="lg">
        <template #header>
            <h5 class="modal-title font-weight-bold" style="color: #111827;">{{ editingEmailId ? 'EditEmailTemplate' :
                'Create Email Template' }}</h5>
            <CButtonClose @click="close" class="text-black" />
        </template>

        <div class="px-3 py-2">
            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">Template Name
                    <span class="text-danger">*</span></label>
                <CInput v-model="title" placeholder="e.g. Acceptance Letter" class="custom-input shadow-sm" />
            </div>

            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">Subject <span
                        class="text-danger">*</span></label>
                <CInput v-model="subject" placeholder="e.g. Regarding your application"
                    class="custom-input shadow-sm" />
            </div>

            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">Insert
                    Variables</label>
                <div class="d-flex flex-wrap" style="gap: 16px;">
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Student Name')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> Student Name
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Student ID')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> Student ID
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('School')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> School
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Program')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> Program
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Academic Year')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> Academic Year
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Evaluation Link')">
                        <CIcon name="cil-link" size="sm" class="mr-1" /> Evaluation Link
                    </CButton>
                </div>
            </div>

            <div>
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">Content <span
                        class="text-danger">*</span></label>
                <CTextarea v-model="template" :rows="8" class="custom-textarea shadow-sm"
                    placeholder="Write your email content here..." style="border-color: #ef4444;" />
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end px-3 py-2">
                <CButton color="light" class="mr-3 filter-card font-weight-bold"
                    style="color: #4b5563; padding: 8px 24px;" @click="close">Cancel</CButton>
                <CButton color="danger" class="font-weight-bold px-4 d-flex align-items-center"
                    style="padding: 8px 24px; border-radius: 6px;" @click="save">
                    <CIcon name="cil-save" class="mr-2" /> {{ editingEmailId ? 'Update Template' : 'Save Template' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'ModalEmailTemplate',
    data() {
        return {
            show: false,
            title: '',
            subject: '',
            template: '',
            editingEmailId: null
        }
    },
    methods: {
        openAdd() {
            this.editingEmailId = null
            this.title = 'Internship Status Update'
            this.subject = 'Update regarding your Internship: {{Academic Year}}'
            this.template = `Dear {{Student Name}},
                We are writing to provide an update regarding your internship status for the {{Academic Year}} academic year.

                Please log in to the Internship Portal to view the latest documents and requirements for your program: {{Program}}.

                {{Evaluation Link}}

                If you have any questions, please contact the Student Affairs office.

                Best regards,
                Student Affairs Department
                {{School}}`
            this.show = true
        },
        openEdit(email = {}) {
            this.editingEmailId = email._id
            this.title = email.title || ''
            this.subject = email.subject || ''
            this.template = email.templete || email.description || ''
            this.show = true
        },
        close() {
            this.show = false
        },
        insertVariable(name) {
            const tag = `{{${name}}}`
            this.template = this.template ? `${this.template} ${tag}` : tag
        },
        save() {
            const payload = {
                title: [{ key: 'th', value: 'ทดสอบ' }, { key: 'en', value: this.title }],
                description: [{ key: 'th', value: this.subject || 'test' }, { key: 'en', value: this.subject || 'test' }],
                templete: this.template,
                active: false,
                group: '69730cdf31640a4d402b0670'
            }

            if (this.editingEmailId) {
                payload._id = this.editingEmailId
                this.$store.dispatch('email/emailStudent/updateEmail', payload).then(() => {
                    alert('Email template updated successfully!');
                    this.show = false
                    this.$emit('refresh')
                })
            } else {
                this.$store.dispatch('email/emailStudent/createEmail', payload).then(() => {
                    alert('Email template created successfully!');
                    this.show = false
                    this.$emit('refresh')
                })
            }
        }
    }
}
</script>

<style scoped>
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
</style>
