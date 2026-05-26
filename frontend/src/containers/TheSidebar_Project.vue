<template>
  <CSidebar class="bg-style1" :minimize="minimize" unfoldable :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none">
      <!--      <CIcon-->
      <!--          class="c-sidebar-brand-full"-->
      <!--          name="logo"-->
      <!--          size="custom-size"-->
      <!--          :height="35"-->
      <!--          viewBox="0 0 556 134"-->
      <!--      />-->
      <div class="c-sidebar-brand-full">
        <a href="/">
          <CRow>
            <img class="pt-2 pb-2" src="@/assets/logo.svg" height="60px">
            <CCol class="text-white">
              <p class="font-weight-bold mb-0 mt-2 h5">MFU</p>
              <p class="font-weight-bold">{{ $t('components.layout_heroheader_vue_internship_transcript_system') }}</p>
            </CCol>
          </CRow>
        </a>
      </div>


      <!--      <img src="@/assets/logo.svg" height="48"/>-->
      <CIcon class="c-sidebar-brand-minimized" name="logo" size="custom-size" :height="35" viewBox="0 0 110 134" />
    </CSidebarBrand>
    <CRenderFunction flat :contentToRender="nav" />
    <!--    <CSidebarMinimizer-->
    <!--        class="c-d-md-down-none"-->
    <!--        @click.native="$store.commit('toggle', 'sidebarMinimize')"-->
    <!--    />-->
  </CSidebar>
</template>

<script>
import nav from './_nav'

export default {
  name: 'TheSidebar_Project',
  components: {},


  // nav,
  computed: {
    show() {
      return this.$store.state.sidebarShow
    },
    minimize() {
      return this.$store.state.sidebarMinimize
    },
    nav() {
      return [{
        _name: 'CSidebarNav',
        _children: [
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('overview')]
          },
          {
            _name: 'CSidebarNavItem',
            name: this.$t('dashboard'),
            to: '/dashboard',
            icon: 'cil-window-restore'
          },
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('main')]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: this.$t('correspondence'),
            route: '/correspondence',
            icon: 'cil-envelope-closed',
            items: [
              {
                name: this.$t('student'),
                to: '/correspondence/student',
              },
              {
                name: this.$t('adviser'),
                to: '/correspondence/adviser',
              },
            ]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: this.$t('competencies'),
            route: '/Competencies',
            icon: 'cil-lightbulb',
            items: [
              {
                name: this.$t('soft_skill'),
                to: '/Competencies/softskill',
              },
              {
                name: this.$t('hard_skill'),
                to: '/Competencies/hardskill',
              },
              {
                name: this.$t('suggestions'),
                to: "/Competencies/suggestions"
              }
            ]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: this.$t('documents'),
            to: '/documents',
            icon: 'cil-description',
            items: [
              {
                name: this.$t('document'),
                to: '/documents/document',
              },
              {
                name: this.$t('certificate'),
                to: '/documents/certificate',
              },
            ]
          },
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('administrator')]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: this.$t('administrator'),
            route: '/administrator',
            icon: 'cil-lightbulb',
            items: [
              {
                name: this.$t('student'),
                to: '/administrator/student',
              },
              {
                name: this.$t('adviser'),
                to: '/administrator/adviser',
              },
            ]
          },
          {
            _name: 'CSidebarNavTitle',
            _children: [this.$t('project_shortcuts')]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: this.$t('settings'),
            route: '/project/settings',
            icon: 'cil-settings',
            items: [
              {
                name: this.$t('general'),
                // to: '/project//settings/general'
                to: `/project/${this.$route.params.application}/settings/general`
              },
              {
                name: this.$t('permission'),
                // to: '/project/settings/permission'
                to: `/project/${this.$route.params.application}/settings/permission`
              },

            ]
          }
        ]
      }]
    }
  }
}
</script>

<style>
.bg-style1 {
  background: linear-gradient(30deg, #FEC260 0%, #8c1515 60%);
}
</style>
