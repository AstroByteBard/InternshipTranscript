<template>
    <CModal :centered="true" :show="show" @update:show="$emit('update:show', $event)" :close-on-backdrop="true"
        size="lg">
        <template #header>
            <div>
                <h5 class="modal-title font-weight-bold mb-1" style="color: #111827;">{{ isEdit ?
                    $t('components.modal_modalsuggestions_vue_edit_suggestions') :
                    $t('components.modal_modalsuggestions_vue_create_suggestions') }}</h5>
                <p class="mb-0 text-muted" style="font-size: 13px;">{{ isEdit ?
                    $t('components.modal_modalsuggestions_vue_update_suggestions_assessment_criteria') :
                    $t('components.modal_modalsuggestions_vue_add_new_bilingual_suggestions_assessment_criteria') }}</p>
            </div>
            <CButtonClose @click="$emit('update:show', false)" class="text-black" />
        </template>

        <div class="px-3 py-3">
            <!-- Basic Information Section -->
            <div class="modal-section mb-4">
                <div class="section-header mb-3">
                    <span class="section-bar"></span>
                    <span class="section-title">{{ $t('components.modal_modalsuggestions_vue_basic_information')
                    }}</span>
                </div>
                <CRow class="mb-3">
                    <CCol md="6">
                        <label class="modal-field-label">{{ $t('components.modal_modalsuggestions_vue_thai_title') }}
                            <span class="text-danger">*</span></label>
                        <CInput v-model="form.titleTh" placeholder="e.g. หัวเรื่องข้อเสนอแนะ" class="modal-input" />
                    </CCol>
                    <CCol md="6">
                        <label class="modal-field-label">{{ $t('components.modal_modalsuggestions_vue_english_title') }}
                            <span class="text-danger">*</span></label>
                        <CInput v-model="form.titleEn" placeholder="e.g. Suggestion Title" class="modal-input" />
                    </CCol>
                </CRow>
                <CRow class="mb-3">
                    <CCol md="6">
                        <label class="modal-field-label">{{ $t('components.modal_modalsuggestions_vue_thai_description')
                        }}</label>
                        <CTextarea v-model="form.descriptionTh" placeholder="Description in Thai..." class="modal-input"
                            rows="2" />
                    </CCol>
                    <CCol md="6">
                        <label class="modal-field-label">{{
                            $t('components.modal_modalsuggestions_vue_english_description')
                        }}</label>
                        <CTextarea v-model="form.descriptionEn" placeholder="Description in English..."
                            class="modal-input" rows="2" />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol md="6">
                        <label class="modal-field-label">{{ $t('components.modal_modalsuggestions_vue_academic_year') }}
                            <span class="text-danger">*</span></label>
                        <CInput v-model="form.year" placeholder="e.g. 2026" class="modal-input" />
                    </CCol>
                </CRow>
            </div>

            <!-- Assessment Questions Section -->
            <div class="modal-section">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="section-header d-flex align-items-center">
                        <span class="section-bar"></span>
                        <span class="section-title">{{ $t('components.modal_modalsuggestions_vue_suggestion_items')
                        }}</span>
                    </div>
                    <button type="button" class="btn btn-link d-flex align-items-center font-weight-bold p-0"
                        style="color: #dc2626; font-size: 14px; text-decoration: none;" @click="$emit('add-question')">
                        <CIcon name="cil-plus" size="sm" class="mr-2" /> {{
                            $t('components.modal_modalsuggestions_vue_add_suggestion') }}
                    </button>
                </div>

                <div v-if="form.questions.length === 0" class="text-center text-muted py-4"
                    style="border: 1px dashed #e2e8f0; border-radius: 8px; font-size: 14px;">
                    {{ $t('components.modal_modalsuggestions_vue_no_suggestions_yet_click_add_suggestion_to_begin') }}
                </div>

                <div v-for="(q, idx) in form.questions" :key="idx" class="question-card mb-3">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="question-number-badge">{{ idx + 1 }}</span>
                        <CButton size="sm" variant="ghost" color="secondary" class="p-0" style="line-height:1;"
                            @click="$emit('remove-question', idx)" :title="$t('remove')">
                            <CIcon name="cil-x" size="sm" style="color:#94a3b8;" />
                        </CButton>
                    </div>
                    <CRow class="mb-3">
                        <CCol md="6">
                            <label class="modal-field-label-sm">{{
                                $t('components.modal_modalsuggestions_vue_variable_thai')
                            }}</label>
                            <CInput v-model="q.categoryTh" placeholder="e.g. การสื่อสาร" class="modal-input" />
                        </CCol>
                        <CCol md="6">
                            <label class="modal-field-label-sm">{{
                                $t('components.modal_modalsuggestions_vue_variable_english')
                            }}</label>
                            <CInput v-model="q.categoryEn" placeholder="e.g. Communication" class="modal-input" />
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol md="6">
                            <label class="modal-field-label-sm">{{
                                $t('components.modal_modalsuggestions_vue_suggestion_thai')
                            }} <span class="text-danger">*</span></label>
                            <CInput v-model="q.th" placeholder="คำแนะนำ..." class="modal-input" />
                        </CCol>
                        <CCol md="6">
                            <label class="modal-field-label-sm">{{
                                $t('components.modal_modalsuggestions_vue_suggestion_english') }} <span
                                    class="text-danger">*</span></label>
                            <CInput v-model="q.en" placeholder="Suggestion..." class="modal-input" />
                        </CCol>
                    </CRow>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end px-3 py-2">
                <CButton color="light" class="mr-3 font-weight-bold"
                    style="color: #374151; padding: 10px 24px; border-radius: 6px; border: 1px solid #e5e7eb;"
                    @click="$emit('update:show', false)">
                    {{ $t('cancel') }}
                </CButton>
                <CButton color="danger" class="font-weight-bold d-flex align-items-center"
                    style="padding: 10px 24px; border-radius: 6px;" @click="$emit('save')">
                    <CIcon name="cil-save" class="mr-2" /> {{ isEdit ? $t('update') : $t('create_new') }} {{
                        $t('suggestions') }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'ModalSuggestions',
    props: {
        show: { type: Boolean, default: false },
        isEdit: { type: Boolean, default: false },
        form: { type: Object, required: true }
    }
}
</script>

<style scoped>
.modal-field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.modal-field-label-sm {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.modal-input>>>.form-control {
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-size: 14px;
    color: #1e293b;
    background-color: #ffffff;
    padding: 8px 12px;
    transition: border-color 0.15s;
}

.modal-input>>>.form-control:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.08);
}

.modal-section {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    padding: 20px;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.section-bar {
    display: inline-block;
    width: 4px;
    height: 18px;
    background-color: #dc2626;
    border-radius: 2px;
    flex-shrink: 0;
}

.section-title {
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    letter-spacing: 0.6px;
    text-transform: uppercase;
}

.question-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;
    background: #ffffff;
}

.question-number-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background-color: #f1f5f9;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
}
</style>
