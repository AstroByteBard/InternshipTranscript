<template>
    <div>
        <CRow class="mb-4 align-items-center">
            <CCol md="6">
                <div class="custom-segmented-control">
                    <CButtonGroup class="w-100 h-100">
                        <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'StudentData' }"
                            @click="selected = 'StudentData'">
                            Student
                        </CButton>
                        <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'AdviserData' }"
                            @click="selected = 'AdviserData'">
                            Adviser
                        </CButton>
                    </CButtonGroup>
                </div>
            </CCol>
            <CCol md="6" class="d-flex justify-content-end">
                <CButton v-if="selected === 'AdviserData'" class="btn-filter-action mr-2">
                    <CIcon name="cil-file" class="mr-2" /> PreviewForm
                </CButton>
                <CButton class="btn-filter-action btn-filter-red">
                    <CIcon name="cil-envelope-open" class="mr-2" /> PreviewEmail
                </CButton>
            </CCol>
        </CRow>
        <StudentEmailSection v-if="selected === 'StudentData'" />

        <AdviserEmailSection v-else-if="selected === 'AdviserData'" />
    </div>
</template>

<script>
import StudentEmailSection from '@/projects/components/Correspondence/StudentEmailSection.vue'
import AdviserEmailSection from '@/projects/components/Correspondence/AdviserEmailSection.vue'

export default {
    name: 'Correspondence',
    components: {
        StudentEmailSection,
        AdviserEmailSection,
    },
    data() {
        return {
            selected: 'StudentData',
        }
    },
}
</script>

<style scoped>
.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
    width: 100%;
    max-width: 300px;
}

.segment-btn {
    background-color: transparent;
    color: #6b7280;
    border: none;
    padding: 7px 18px;
    font-size: 14px;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    box-shadow: none;
}

.segment-btn:hover {
    color: #374151;
    background-color: transparent;
}

.segment-btn.active {
    background-color: #ffffff !important;
    color: #111827 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
    border: none !important;
}

.segment-btn:focus,
.segment-btn.focus {
    box-shadow: none !important;
}

.btn-filter-action {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 16px;
    display: inline-flex;
    align-items: center;
}

.btn-filter-action:hover {
    background-color: #f9fafb;
    color: #111827;
}

.btn-filter-red {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.btn-filter-red:hover {
    background-color: #fee2e2;
    color: #b91c1c;
}
</style>
```