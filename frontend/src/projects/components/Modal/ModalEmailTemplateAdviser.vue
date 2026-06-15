<template>
    <CModal :centered="true" :show.sync="show" :close-on-backdrop="true" size="lg">
        <template #header>
            <h5 class="modal-title font-weight-bold" style="color: #111827;">{{ editingEmailId ?
                $t('edit_email_template') :
                $t('create_email_template') }}</h5>
            <CButtonClose @click="close" class="text-black" />
        </template>

        <div class="px-3 py-2">
            <div class="mb-4">
                <div class="d-flex align-items-center justify-content-between">
                    <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">{{
                        $t('template_name')
                        }}
                        <span class="text-danger">*</span></label>
                    <div class="d-flex align-items-center mb-2">
                        <span class="text-muted font-weight-bold mr-2" style="font-size: 12px;">{{ $t('locale') }}:</span>
                        <div class="d-flex border rounded" style="gap: 0;">
                            <CButton size="sm"
                                :class="locale === 'en' ? 'btn-lang-active' : 'btn-lang'"
                                @click="onLocaleChange('en')" style="border-radius: 3px 0 0 3px; padding: 2px 10px; font-size: 12px; font-weight: 700;">EN</CButton>
                            <CButton size="sm"
                                :class="locale === 'th' ? 'btn-lang-active' : 'btn-lang'"
                                @click="onLocaleChange('th')" style="border-radius: 0 3px 3px 0; padding: 2px 10px; font-size: 12px; font-weight: 700;">TH</CButton>
                        </div>
                    </div>
                </div>
                <CInput v-model="title" placeholder="e.g. Acceptance Letter" class="custom-input shadow-sm" />
            </div>

            <div class="mb-4">
                <div class="d-flex align-items-center mb-2">
                    <label class="font-weight-bold text-muted text-uppercase mb-0" style="font-size: 13px;">{{
                        $t('insert_variables') }}
                        <span class="text-muted font-weight-normal" style="font-size: 11px; text-transform: none;">
                            ({{ activeField === 'subject' ? $t('inserting_into_subject') : $t('inserting_into_content') }})
                        </span>
                    </label>
                </div>
                <div class="d-flex flex-wrap" style="gap: 16px;">
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Adviser Name')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ $t('adviser_name') }}
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Student Name')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ $t('student_name') }}
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Student ID')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ $t('student_id') }}
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('School')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ $t('school') }}
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Program')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ $t('program') }}
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Academic Year')">
                        <CIcon name="cil-plus" size="sm" class="mr-1" /> {{ $t('academicYear') }}
                    </CButton>
                    <CButton class="variable-btn shadow-sm" size="sm" @click="insertVariable('Evaluation Link')">
                        <CIcon name="cil-link" size="sm" class="mr-1" /> {{ $t('evaluation_link') }}
                    </CButton>
                </div>
            </div>

            <div class="mb-4">
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">{{ $t('subject')
                    }}
                    <span class="text-danger">*</span></label>
                <CInput ref="subjectInput" v-model="subject" placeholder="e.g. Regarding your application"
                    class="custom-input shadow-sm" @focus="onFieldFocus('subject')"
                    @click="trackCursor('subject', $event)" @keyup="trackCursor('subject', $event)" />
            </div>

            <div>
                <label class="font-weight-bold text-muted mb-2 text-uppercase" style="font-size: 13px;">{{ $t('content')
                    }}
                    <span class="text-danger">*</span></label>
                <CTextarea ref="contentTextarea" v-model="template" :rows="8" class="custom-textarea shadow-sm"
                    placeholder="Write your email content here..." style="border-color: #ef4444;"
                    @focus="onFieldFocus('template')"
                    @click="trackCursor('template', $event)" @keyup="trackCursor('template', $event)" />
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end px-3 py-2">
                <CButton color="light" class="mr-3 filter-card font-weight-bold"
                    style="color: #4b5563; padding: 8px 24px;" @click="close">{{ $t('cancel') }}</CButton>
                <CButton color="danger" class="font-weight-bold px-4 d-flex align-items-center"
                    style="padding: 8px 24px; border-radius: 6px;" @click="save">
                    <CIcon name="cil-save" class="mr-2" /> {{ editingEmailId ? $t('update_template') :
                        $t('save_template') }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'ModalEmailTemplateAdviser',
    data() {
        return {
            show: false,
            title: '',
            subject: '',
            template: '',
            editingEmailId: null,
            activeField: 'template',
            cursorPos: { subject: 0, template: 0 },
            locale: 'en',
            varPairs: [
                { en: '{{Adviser Name}}', th: '{{ชื่อผู้ให้คำปรึกษา}}' },
                { en: '{{Student Name}}', th: '{{ชื่อนักศึกษา}}' },
                { en: '{{Student ID}}', th: '{{รหัสนักศึกษา}}' },
                { en: '{{School}}', th: '{{โรงเรียน}}' },
                { en: '{{Program}}', th: '{{หลักสูตร}}' },
                { en: '{{Academic Year}}', th: '{{ปีการศึกษา}}' },
                { en: '{{Evaluation Link}}', th: '{{ลิงก์ประเมินผล}}' },
            ],
            defaults: {
                en: {
                    title: 'Internship Evaluation Request',
                    subject: 'Internship Evaluation for {{Student Name}}',
                    template: `Dear {{Adviser Name}},

We are writing to request your evaluation for {{Student Name}}, who is currently an intern at your organization.

Your feedback is essential for the student's academic progress and our university records. Please complete the evaluation by clicking the link below:

{{Evaluation Link}}

If you have any questions, please feel free to reply to this email.

Best regards,
Internship Coordinator
{{School}}`
                },
                th: {
                    title: 'คำขอประเมินผลการฝึกงาน',
                    subject: 'การประเมินผลการฝึกงานสำหรับ {{ชื่อนักศึกษา}}',
                    template: `เรียน {{ชื่อผู้ให้คำปรึกษา}}

ทางมหาวิทยาลัยขอความอนุเคราะห์ท่านในการประเมินผลการฝึกงานของ {{ชื่อนักศึกษา}} ซึ่งกำลังฝึกงานอยู่ที่องค์กรของท่าน

ความคิดเห็นของท่านมีความสำคัญต่อความก้าวหน้าทางวิชาการของนักศึกษาและบันทึกของมหาวิทยาลัย กรุณาประเมินผลโดยคลิกลิงก์ด้านล่าง:

{{ลิงก์ประเมินผล}}

หากมีข้อสงสัย กรุณาตอบกลับอีเมลนี้

ขอแสดงความนับถือ
ผู้ประสานงานฝึกงาน
{{โรงเรียน}}`
                }
            },
            varMap: {
                en: {
                    'Adviser Name': '{{Adviser Name}}',
                    'Student Name': '{{Student Name}}',
                    'Student ID': '{{Student ID}}',
                    'School': '{{School}}',
                    'Program': '{{Program}}',
                    'Academic Year': '{{Academic Year}}',
                    'Evaluation Link': '{{Evaluation Link}}',
                },
                th: {
                    'Adviser Name': '{{ชื่อผู้ให้คำปรึกษา}}',
                    'Student Name': '{{ชื่อนักศึกษา}}',
                    'Student ID': '{{รหัสนักศึกษา}}',
                    'School': '{{โรงเรียน}}',
                    'Program': '{{หลักสูตร}}',
                    'Academic Year': '{{ปีการศึกษา}}',
                    'Evaluation Link': '{{ลิงก์ประเมินผล}}',
                }
            }
        }
    },
    methods: {
        onFieldFocus(field) {
            this.activeField = field
        },
        trackCursor(field, $event) {
            if ($event && $event.target) {
                this.cursorPos[field] = $event.target.selectionStart
            }
        },
        openAdd() {
            this.editingEmailId = null
            const d = this.defaults.en
            this.title = d.title
            this.locale = 'en'
            this.subject = d.subject
            this.template = d.template
            this.show = true
        },
        openEdit(email = {}) {
            this.editingEmailId = email._id
            this.title = email.title || ''
            this.subject = email.description || ''
            this.template = email.template || ''
            this.locale = email.locale || 'en'
            this.show = true
        },
        onLocaleChange(newLocale) {
            const oldLocale = this.locale
            if (oldLocale === newLocale) return
            const other = this.defaults[oldLocale]
            const next = this.defaults[newLocale]
            ;['title', 'subject', 'template'].forEach(field => {
                if (this[field] === other[field]) {
                    this[field] = next[field]
                } else if (this[field]) {
                    let val = this[field]
                    this.varPairs.forEach(p => {
                        if (newLocale === 'th') {
                            val = val.split(p.en).join(p.th)
                        } else {
                            val = val.split(p.th).join(p.en)
                        }
                    })
                    this[field] = val
                }
            })
            this.locale = newLocale
        },
        close() {
            this.show = false
        },
        insertVariable(name) {
            const map = this.varMap[this.locale] || this.varMap.en
            const tag = map[name] || `{{${name}}}`
            const target = this.activeField === 'subject' ? 'subject' : 'template'
            const pos = this.cursorPos[target]
            const val = this[target]
            this[target] = val
                ? val.slice(0, pos) + tag + val.slice(pos)
                : tag
            const newPos = pos + tag.length
            this.cursorPos[target] = newPos
            this.$nextTick(() => {
                let el = null
                if (target === 'subject' && this.$refs.subjectInput) {
                    el = this.$refs.subjectInput.$el.querySelector('input')
                } else if (this.$refs.contentTextarea) {
                    el = this.$refs.contentTextarea.$el.querySelector('textarea')
                }
                if (el) {
                    el.focus()
                    el.setSelectionRange(newPos, newPos)
                }
            })
        },
        save() {
            const payload = {
                title: this.title,
                locale: this.locale || 'en',
                description: this.subject || '',
                template: this.template,
                active: false,
                group: '69730cdf31640a4d402b0670'
            }

            if (this.editingEmailId) {
                payload._id = this.editingEmailId
                this.$store.dispatch('email/emailAdviser/updateEmail', payload).then(() => {
                    alert('Email template updated successfully!');
                    this.show = false
                    this.$emit('refresh')
                })
            } else {
                this.$store.dispatch('email/emailAdviser/createEmail', payload).then(() => {
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

.btn-lang {
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #64748b;
}

.btn-lang-active {
    background-color: #dc2626;
    border: 1px solid #dc2626;
    color: #ffffff;
}
</style>
