<template>
    <div class="custom-segmented-control">
        <CButtonGroup class="w-100 h-100">
            <CButton v-for="(value, key) in options" :key="key" class="segment-btn font-weight-bold"
                :class="{ 'active': value === selected }" @click="$emit('update:selected', value)">
                {{ value }}
            </CButton>
        </CButtonGroup>
    </div>
</template>

<script>
export default {
    name: 'SegmentedControl',
    props: {
        selected: { type: String, required: true },
        options: { type: Array, default: () => ['Student', 'Advisor'] }
    }
}
</script>

<style scoped>
.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
    width: 100%;
    max-width: 250px;
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
</style>