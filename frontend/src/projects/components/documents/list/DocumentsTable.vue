<template>
  <CCard class="mb-4" style="overflow: visible;">
    <CCardBody class="p-0" style="overflow: visible;">
      <CDataTable class="custom-table mb-0" :items="items" :fields="fields" :items-per-page="5" hover>
        <template #nameContent="{ item }">
          <td class="align-middle px-4 py-3">
            <div class="d-flex align-items-center">
              <div class="mr-3 doc-icon-wrapper doc-icon-word">
                <CIcon name="cil-description" class="doc-icon-svg" />
              </div>
              <div>
                <div class="font-weight-bold" style="color: #1f2937; font-size: 14px;">{{ item.title }}</div>
                <div class="text-muted small">Document Template &bull; {{ (item.update && item.update.datetime) ?
                  moment(item.update.datetime).fromNow() : '-' }}</div>
              </div>
            </div>
          </td>
        </template>

        <template #status="{ item }">
          <td class="align-middle">
            <CBadge :color="item.status === 'Active' ? 'success' : (item.status === 'Published' ? 'info' : 'secondary')"
              class="custom-badge">
              {{ item.status }}
            </CBadge>
          </td>
        </template>

        <template #actions="{ item }">
          <td class="align-middle text-right px-4 py-3">

            <!-- Options Button with Dropdown -->
            <div class="dropdown-wrapper d-inline-block" :ref="'dropdown_' + item._id">
              <CButton class="btn-action-icon" title="Options" @click.stop="toggleDropdown(item._id)">
                <CIcon name="cil-options" />
              </CButton>

              <transition name="dropdown-fade">
                <div v-if="openDropdownId === item._id" class="action-dropdown shadow">
                  <button class="dropdown-item-btn" @click.stop="handleAction('edit', item)">
                    <CIcon name="cil-pencil" class="mr-2" />
                    Edit
                  </button>
                  <button class="dropdown-item-btn" @click.stop="handleAction('copy', item)">
                    <CIcon name="cil-copy" class="mr-2" />
                    Copy
                  </button>
                  <div class="dropdown-divider" />
                  <button class="dropdown-item-btn text-danger" @click.stop="handleAction('delete', item)">
                    <CIcon name="cil-trash" class="mr-2" />
                    Delete
                  </button>
                </div>
              </transition>
            </div>
          </td>
        </template>
      </CDataTable>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'DocumentsTable',
  props: {
    items: { type: Array, default: () => [] },
    fields: { type: Array, default: () => [] }
  },
  data() {
    return {
      openDropdownId: null
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdown)
  },
  methods: {
    toggleDropdown(id) {
      this.openDropdownId = this.openDropdownId === id ? null : id
    },
    closeDropdown() {
      this.openDropdownId = null
    },
    handleAction(action, item) {
      this.openDropdownId = null
      this.$emit(action, item)
    }
  }
}
</script>

<style scoped>
.custom-badge {
  background-color: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
}

.doc-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.doc-icon-svg {
  width: 18px;
  height: 18px;
}

.doc-icon-pdf {
  background-color: #fef2f2;
  color: #dc2626;
}

.doc-icon-word {
  background-color: #eff6ff;
  color: #2563eb;
}

.doc-icon-excel {
  background-color: #f0fdf4;
  color: #16a34a;
}

.doc-icon-default {
  background-color: #f3f4f6;
  color: #6b7280;
}

.btn-action-icon {
  background-color: transparent !important;
  border: none !important;
  color: #9ca3af !important;
  border-radius: 6px;
  padding: 6px 8px;
  transition: all 0.2s;
  box-shadow: none !important;
}

.btn-action-icon:hover {
  color: #4b5563 !important;
  background-color: #f3f4f6 !important;
}

.btn-action-icon:focus {
  box-shadow: none !important;
}

/* Dropdown */
.dropdown-wrapper {
  position: relative;
}

.action-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-width: 148px;
  z-index: 9999;
  overflow: hidden;
  padding: 4px 0;
}

.dropdown-item-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: left;
  transition: background 0.15s;
}

.dropdown-item-btn:hover {
  background-color: #f9fafb;
}

.dropdown-item-btn.text-danger {
  color: #dc2626 !important;
}

.dropdown-item-btn.text-danger:hover {
  background-color: #fef2f2;
}

.dropdown-divider {
  height: 1px;
  background-color: #f3f4f6;
  margin: 4px 0;
}

/* Transition */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Fix table overflow so dropdown doesn't create scrollbar */
::v-deep .table-responsive {
  overflow: visible !important;
}

::v-deep table {
  overflow: visible !important;
}
</style>
