<template>
    <CModal :centered="true" :show.sync="show" :close-on-backdrop="true" size="lg">
        <template #header>
            <h5 class="modal-title font-weight-bold" style="color: #111827;">Email Preview</h5>
            <CButtonClose @click="close" class="text-black" />
        </template>

        <div class="px-4 py-3 bg-light rounded-lg m-3 border shadow-sm">
            <div class="mb-3 pb-2 border-bottom">
                <div class="d-flex mb-1">
                    <span class="font-weight-bold mr-2 text-muted text-uppercase" style="font-size: 11px; min-width: 60px;">To:</span>
                    <span class="text-primary font-weight-bold">{{ recipientEmail }}</span>
                </div>
                <div class="d-flex mb-1">
                    <span class="font-weight-bold mr-2 text-muted text-uppercase" style="font-size: 11px; min-width: 60px;">Subject:</span>
                    <span class="font-weight-bold">{{ resolvedSubject }}</span>
                </div>
            </div>

            <div class="email-body-preview p-3 bg-white rounded border" style="min-height: 300px; white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155;">
                {{ resolvedBody }}
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end px-3 py-2">
                <CButton color="secondary" variant="ghost" class="mr-3 font-weight-bold" @click="close">Close</CButton>
                <CButton color="danger" class="font-weight-bold px-4" style="border-radius: 6px;" @click="close">Done Rendering</CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'ModalEmailPreview',
    data() {
        return {
            show: false,
            template: null,
            recipient: null,
            isAdviser: false
        }
    },
    computed: {
        recipientEmail() {
            return this.recipient ? (this.recipient.email || 'N/A') : 'N/A';
        },
        resolvedSubject() {
            if (!this.template) return '';
            const sub = this.template.description || this.template.title || '';
            return this.resolveVariables(sub);
        },
        resolvedBody() {
            if (!this.template) return '';
            const body = this.template.templete || this.template.description || '';
            return this.resolveVariables(body);
        }
    },
    methods: {
        open(template, recipient, isAdviser = false) {
            this.template = template;
            this.recipient = recipient;
            this.isAdviser = isAdviser;
            this.show = true;
        },
        close() {
            this.show = false;
        },
        resolveVariables(text) {
            if (!text || !this.recipient) return text || '';
            
            let result = String(text);
            const r = this.recipient;

            // Common variables
            const studentName = r.studentName || r.student || 'N/A';
            const studentID = r.studentID || r.id || '2567-001';
            const academicYear = r.academicYear || (r.info && r.info.year) || '2567';
            const school = r.schoolName || 'School of Information Technology';
            const program = r.programName || 'Computer Engineering';
            const evalLink = `http://localhost:8080/#/fill-form?studentID=${r._id || 'SAMPLE_ID'}`;

            result = result
                .replace(/{{Student Name}}/g, studentName)
                .replace(/{{Student ID}}/g, studentID)
                .replace(/{{Academic Year}}/g, academicYear)
                .replace(/{{School}}/g, school)
                .replace(/{{Program}}/g, program)
                .replace(/{{Evaluation Link}}/g, evalLink);

            if (this.isAdviser) {
                const adviserName = r.organizationName || r.name || 'John Doe (Advisor)';
                result = result.replace(/{{Adviser Name}}/g, adviserName);
            }

            return result;
        }
    }
}
</script>

<style scoped>
.email-body-preview {
    font-size: 14px;
}
</style>
