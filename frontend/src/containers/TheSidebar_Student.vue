<template>
  <CSidebar class="bg-student-style" :minimize="minimize" unfoldable :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none">
      <div class="c-sidebar-brand-full">
        <a href="/">
          <CRow>
            <img class="pt-2 pb-2" src="@/assets/logo.svg" height="60px">
            <CCol class="text-white">
              <p class="font-weight-bold mb-0 mt-2 h5">MFU</p>
              <p class="font-weight-bold">Internship Transcript System</p>
            </CCol>
          </CRow>
        </a>
      </div>
      <CIcon class="c-sidebar-brand-minimized" name="logo" size="custom-size" :height="35" viewBox="0 0 110 134" />
    </CSidebarBrand>
    <CRenderFunction flat :contentToRender="nav" />
  </CSidebar>
</template>

<script>
export default {
  name: 'TheSidebar_Student',
  components: {},

  computed: {
    show() {
      return this.$store.state.sidebarShow
    },
    minimize() {
      return this.$store.state.sidebarMinimize
    }
  },
  data: function () {
    return {
      nav: [{
        _name: 'CSidebarNav',
        _children: [

          {
            _name: 'CSidebarNavItem',
            name: 'Dashboard',
            to: '/student/dashboard',
            icon: 'cil-window-restore'
          }
        ]
      }],
    }
  }
}
</script>

<style scoped>
.bg-student-style {
  background: linear-gradient(30deg,
    #FEC260 0%,
    #8c1515 60%);
}

::v-deep .c-sidebar-brand {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

::v-deep .c-sidebar-nav-link {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

::v-deep .c-sidebar-nav-link:hover {
  color: #ffffff;
  background-color: rgb(0, 35, 189);
}

::v-deep .c-sidebar-nav-link.active {
  color: #c41e3a;
  background-color: rgba(196, 30, 58, 0.2);
  border-left: 4px solid #c41e3a;
}

::v-deep .c-sidebar-nav-title {
  color: rgb(255, 255, 255);
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  padding: 15px 16px 5px;
  letter-spacing: 0.5px;
}
</style>
