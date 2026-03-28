<template>
    <div class="text-right align-self-center d-flex justify-content-end align-items-center">
        <div v-if="selectedType === 'Student'">
            <input type="file" ref="fileInput" style="display: none" accept=".xlsx, .xls, .csv"
                @change="$emit('file-change', $event)" />

            <CButton class="btn-import mr-2" @click="$refs.fileInput.click()">
                <CIcon name="cil-cloud-upload" class="mr-2" /> Import
            </CButton>
            <CButton class="btn-add-student" @click="$emit('add-student')">
                <CIcon name="cil-user" class="mr-2" /> Add Student
            </CButton>
        </div>

        <div v-if="selectedType === 'Advisor'">
            <input type="file" ref="fileInputAdvisor" style="display: none" accept=".xlsx, .xls, .csv"
                @change="$emit('file-change', $event)" />

            <CButton class="btn-import mr-2" @click="$refs.fileInputAdvisor.click()">
                <CIcon name="cil-cloud-upload" class="mr-2" /> Import
            </CButton>
            <CButton class="btn-add-student" @click="$emit('add-advisor')">
                <CIcon name="cil-user" class="mr-2" /> Add Advisor
            </CButton>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ActionButtons',
    props: {
        selectedType: { type: String, required: true }
    }
}
</script>

<style scoped>
/* Action Buttons (Import & Add Student) */
.btn-import {
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    color: #4b5563;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 18px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-import:hover {
    background-color: #f9fafb;
    color: #111827;
    border-color: #9ca3af;
}

.btn-add-student {
    background-color: #c82333;
    border: 1px solid #c82333;
    color: #ffffff;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 18px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-add-student:hover {
    background-color: #bd2130;
    border-color: #b21f2d;
    color: #ffffff;
}
</style>