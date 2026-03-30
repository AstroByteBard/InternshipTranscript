<template>
  <CRow>
    <CCol sm="6" lg="3">
      <CWidgetDropdown
        type="gradient-primary"
        :header="String(softskill)"
        text="Total Softskill"
        class="pb-4 premium-widget"
      >
        <template #default>
          <CIcon name="cil-star" size="xl" class="float-right text-white-50 mt-3" />
        </template>
        <template #footer>
          <div class="px-3 pb-3">
             <div class="text-white-50 small">General Assessment</div>
          </div>
        </template>
      </CWidgetDropdown>
    </CCol>
    <CCol sm="6" lg="3">
      <CWidgetDropdown
        type="gradient-success"
        :header="String(hardskill)"
        text="Total Hardskill"
        class="pb-4 premium-widget"
      >
        <template #default>
          <CIcon name="cil-code" size="xl" class="float-right text-white-50 mt-3" />
        </template>
        <template #footer>
          <div class="px-3 pb-3">
             <div class="text-white-50 small">Program Specific</div>
          </div>
        </template>
      </CWidgetDropdown>
    </CCol>
    <CCol sm="6" lg="3">
      <CWidgetDropdown
        type="gradient-warning"
        :header="String(suggestion)"
        text="Total Suggestions"
        class="pb-4 premium-widget text-white"
      >
        <template #default>
          <CIcon name="cil-chat-bubble" size="xl" class="float-right text-white-50 mt-3" />
        </template>
        <template #footer>
          <div class="px-3 pb-3">
             <div class="text-white-50 small">Student Propositions</div>
          </div>
        </template>
      </CWidgetDropdown>
    </CCol>
    <CCol sm="6" lg="3">
      <CWidgetDropdown
        type="gradient-danger"
        :header="String(years)"
        text="Academic Years"
        class="pb-4 premium-widget"
      >
        <template #default>
          <CIcon name="cil-calendar" size="xl" class="float-right text-white-50 mt-3" />
        </template>
        <template #footer>
          <div class="px-3 pb-3">
             <div class="text-white-50 small">Active Coverage</div>
          </div>
        </template>
      </CWidgetDropdown>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsCompetencies',
  props: {
    softskill: { type: Number, default: 0 },
    hardskill: { type: Number, default: 0 },
    suggestion: { type: Number, default: 0 },
    years: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
.premium-widget {
  border-radius: 20px !important;
  border: none !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.premium-widget:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.gradient-primary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important; }
.gradient-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; }
.gradient-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; }
.gradient-danger { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important; }

::v-deep .card-body {
  padding: 1.5rem !important;
}

::v-deep .text-value-lg {
  font-size: 1.8rem !important;
  font-weight: 800 !important;
  margin-bottom: 0.25rem !important;
}
</style>
