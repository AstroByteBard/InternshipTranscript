<template>
  <div class="sidebar-info p-4 bg-white rounded shadow-sm" style="height: 100%; border: 1px solid #e5e7eb;">
    <h6 class="sidebar-heading text-muted text-uppercase mb-3 font-weight-bold">Properties</h6>
    <div class="mb-4">
      <label class="text-muted small font-weight-bold mb-2">Document Title</label>
      <CInput :value="title" @input="$emit('update:title', $event)" placeholder="Enter document title..." />
    </div>

    <div class="mb-4">
      <label class="text-muted small font-weight-bold mb-2">Status</label>
      <CSelect custom class="status-select" :options="['Draft', 'Published', 'Archived']" :value="status"
        @change="$emit('update:status', $event && $event.target ? $event.target.value : $event)"></CSelect>
    </div>

    <hr class="my-4 border-light" />

    <h6 class="sidebar-heading text-muted text-uppercase mb-3 font-weight-bold">Info</h6>
    <div class="info-list text-muted small mb-4">
      <div class="mb-3 d-flex align-items-center font-weight-bold">
        <CIcon name="cil-user" class="mr-3" /> Admin User
      </div>
      <div class="mb-3 d-flex align-items-center font-weight-bold">
        <CIcon name="cil-calendar" class="mr-3" /> {{ currentDate }}
      </div>
      <div class="mb-3 d-flex align-items-center font-weight-bold">
        <CIcon name="cil-clock" class="mr-3" /> {{ currentTime }}
      </div>
    </div>

    <hr class="my-4 border-light" />

    <div class="tip-box p-3 rounded">
      <div class="d-flex align-items-start font-weight-bold text-primary mb-2" style="font-size: 13px;">
        <CIcon name="cil-list" size="sm" class="mr-2 mt-1" /> Formatting Tips
      </div>
      <p class="small text-primary mb-0" style="line-height: 1.5;">
        This is a plain text editor. For rich formatting, please use an external tool and attach the file, or wait
        for our upcoming Markdown update.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentSidebar',
  props: {
    title: { type: String, default: 'Untitled Document' },
    status: { type: String, default: 'Draft' },
    currentDate: { type: String, default: '' },
    currentTime: { type: String, default: '' }
  }
}
</script>

<style scoped></style>
