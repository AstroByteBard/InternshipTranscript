<template>
    <CTabs variant="tabs" class="custom-tabs mt-4">
        <CTab :title="$t('components.correspondence_emailtemplatessection_vue_studentdata')" active>
            <CRow class="mt-3">
                <CCol>
                    <slot name="student-table"></slot>
                </CCol>
            </CRow>
        </CTab>

        <CTab :title="$t('components.correspondence_emailtemplatessection_vue_email')">
            <!-- Empty State -->
            <div v-if="emailsData.length === 0" class="mt-4">
                <CCard class="text-center border-0 shadow-sm" style="border-radius: 8px;">
                    <CCardBody class="d-flex flex-column justify-content-center align-items-center"
                        style="padding: 3rem 2rem;">
                        <CIcon name="cil-envelope-open" size="4xl" style="color: #e5e7eb;" class="mb-3" />
                        <h4 class="font-weight-bold mb-2" style="color: #6b7280;">{{
                            $t('components.correspondence_emailtemplatessection_vue_no_email_templates') }}</h4>
                        <p class="text-muted mb-4" style="max-width: 400px;">{{
                            $t('components.correspondence_emailtemplatessection_vue_create_your_first_e') }}</p>
                        <CButton color="danger" class="font-weight-bold px-4" @click="$emit('add-template')">
                            <CIcon name="cil-plus" class="mr-2" />{{
                                $t('components.correspondence_emailtemplatessection_vue_create_email_templa') }}
                        </CButton>
                    </CCardBody>
                </CCard>
            </div>

            <!-- Templates List -->
            <div v-else>
                <CCard class="table-card border-0 shadow-sm mt-4">
                    <CCardHeader class="bg-white border-bottom d-flex justify-content-between align-items-center"
                        style="padding: 1.25rem 1.5rem;">
                        <h5 class="mb-0 font-weight-bold" style="color: #374151;">{{
                            $t('components.correspondence_emailtemplatessection_vue_email_templates') }}</h5>
                        <CButton color="danger" size="sm" class="font-weight-bold" @click="$emit('add-template')">
                            <CIcon name="cil-plus" size="sm" class="mr-1" />{{
                                $t('components.correspondence_emailtemplatessection_vue_add_template') }}
                        </CButton>
                    </CCardHeader>
                    <CCardBody class="p-0">
                        <table class="table table-borderless custom-template-table mb-0">
                            <thead>
                                <tr>
                                    <th width="35%">{{
                                        $t('components.correspondence_emailtemplatessection_vue_template') }}</th>
                                    <th width="20%">{{ $t('components.correspondence_emailtemplatessection_vue_status')
                                        }}</th>
                                    <th width="25%">{{
                                        $t('components.correspondence_emailtemplatessection_vue_last_updated') }}</th>
                                    <th width="20%" class="text-center">{{
                                        $t('components.correspondence_emailtemplatessection_vue_actions') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="email in emailsData" :key="email._id">
                                    <td>
                                        <div>
                                            <h6 class="mb-1 font-weight-bold cursor-pointer" style="color: #374151;"
                                                @click="$emit('edit-template', email)">
                                                {{ email.title }}
                                            </h6>
                                            <p class="text-muted small mb-0">{{ email.description }}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span v-if="email.active"
                                            class="badge badge-success bg-success text-white font-weight-bold px-3 py-2"
                                            style="border-radius: 12px;">{{
                                                $t('components.correspondence_emailtemplatessection_vue_active') }}</span>
                                        <span v-else
                                            class="badge badge-light bg-light text-muted font-weight-bold px-3 py-2"
                                            style="border-radius: 12px; border: 1px solid #e5e7eb;">{{
                                                $t('components.correspondence_emailtemplatessection_vue_draft') }}</span>
                                    </td>
                                    <td class="text-muted">{{ email.updatedAt }}</td>
                                    <td class="text-center">
                                        <CButton v-if="!email.active" size="sm" color="success" class="mr-1"
                                            @click="$emit('use-template', email._id)"
                                            :title="$t('components.correspondence_emailtemplatessection_vue_use_template')">
                                            <CIcon name="cil-check" />
                                        </CButton>
                                        <CButton size="sm" color="light" class="mr-1"
                                            @click="$emit('edit-template', email)"
                                            :title="$t('components.correspondence_emailtemplatessection_vue_edit')">
                                            <CIcon name="cil-pencil" />
                                        </CButton>
                                        <CButton size="sm" color="light" class="mr-1"
                                            @click="$emit('duplicate', email._id)"
                                            :title="$t('components.correspondence_emailtemplatessection_vue_duplicate')">
                                            <CIcon name="cil-copy" />
                                        </CButton>
                                        <CButton size="sm" color="danger" @click="$emit('delete-template', email._id)"
                                            :title="$t('components.correspondence_emailtemplatessection_vue_delete')">
                                            <CIcon name="cil-trash" />
                                        </CButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CCardBody>
                </CCard>
            </div>
        </CTab>
    </CTabs>
</template>

<script>
export default {
    name: 'EmailTemplatesSection',
    props: {
        emailsData: { type: Array, default: () => [] },
        activeEmails: { type: Array, default: () => [] },
        inactiveEmails: { type: Array, default: () => [] }
    }
}
</script>

<style scoped>
::v-deep .custom-tabs .nav-tabs {
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 1rem;
}

::v-deep .custom-tabs .nav-link {
    color: #6b7280;
    font-weight: 600;
    border: none;
    padding: 0.75rem 1.5rem;
    margin-bottom: -2px;
}

::v-deep .custom-tabs .nav-link.active {
    color: #db2777;
    background: transparent;
    border-bottom: 2px solid #db2777;
}

::v-deep .custom-tabs .nav-link:hover:not(.active) {
    color: #374151;
    border-bottom: 2px solid #d1d5db;
}

.table-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
}

/* Template Table Styling */
.custom-template-table thead th {
    background-color: #f8fafc !important;
    color: #64748b !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: 1px solid #f1f5f9 !important;
    border-bottom: 1px solid #f1f5f9 !important;
    padding: 12px 16px !important;
    vertical-align: middle;
}

.custom-template-table tbody td {
    padding: 20px 16px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    vertical-align: middle;
}

.custom-template-table tbody tr:hover td {
    background-color: #f8fafc !important;
}

.cursor-pointer {
    cursor: pointer;
}
</style>