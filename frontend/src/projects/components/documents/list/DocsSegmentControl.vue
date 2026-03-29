<template>
  <div class="custom-segmented-control">
    <CButtonGroup class="w-100 h-100">
      <CButton v-for="(value, key) in options" :key="key" class="segment-btn font-weight-bold"
        :class="{ 'active': value === valueModel }" @click="$emit('input', value)">{{ value }}</CButton>
    </CButtonGroup>
  </div>
</template>

<script>
export default {
  name: 'DocsSegmentControl',
  props: {
    value: { type: String, default: 'Document' },
    options: { type: Array, default: () => ['Document', 'Certificate'] }
  },
  computed: {
    valueModel() {
      return this.value
    }
  }
}
</script>

<style scoped></style>
