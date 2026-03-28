<template>
  <CHeader with-subheader class="bg-white border-bottom custom-header-container">
    <div class="d-flex align-items-center w-100 pr-4 custom-header-height">
      <!-- Sidebar Toggle -->
      <CToggler in-header class="ml-3 mr-3 d-md-down-none" @click="$store.commit('toggleSidebarDesktop')" />

      <!-- Left Side: Title and Subtitle -->
      <div class="mr-auto d-flex flex-column justify-content-center">
        <h4 class="mb-0 font-weight-bold page-title">{{ routeTitle }}</h4>
        <div class="text-muted small page-subtitle">Academic Year {{ currentAcademicYear }}</div>
      </div>

      <!-- Right Side: Search, Lang, Notif, User -->
      <div class="d-flex align-items-center right-actions-group">

        <!-- Language Selector -->
        <div class="lang-selector-btn d-flex align-items-center justify-content-center mr-4" @click="onSwitchLang">
          <CIcon name="cil-globe-alt" class="mr-2" size="sm" />
          <span class="lang-text">{{ (lang || 'TH').toUpperCase() }}</span>
        </div>

        <!-- Notification -->
        <div class="header-notif-btn mr-4 position-relative cursor-pointer">
          <CIcon name="cil-bell" size="lg" class="notif-icon" />
          <span class="notif-dot"></span>
        </div>

        <!-- User Dropdown (TheHeaderDropdownAccnt) -->
        <TheHeaderDropdownAccnt />
      </div>
    </div>
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'
import { mapGetters } from "vuex";

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt,
  },
  computed: {
    ...mapGetters({
      lang: "setting/lang",
    }),
    routeTitle() {
      // Return the current route name like 'Dashboard' or fallback
      const name = (this.$route && this.$route.name) ? this.$route.name : null;
      if (name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
      return 'Dashboard';
    },
    currentAcademicYear() {
      const currentYear = new Date().getFullYear();
      return currentYear;
    }
  },
  methods: {
    onSwitchLang() {
      switch (this.lang) {
        case "th":
          this.$store.commit("setting/lang", "en");
          break;
        case "en":
          this.$store.commit("setting/lang", "th");
          break;
      }
    }
  }
}
</script>

<style scoped>
.custom-header-height {
  height: 64px;
}

.page-title {
  color: #111827;
  font-size: 20px;
  letter-spacing: -0.01em;
}

.page-subtitle {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
}

.header-search-wrapper {
  position: relative;
  width: 300px;
  display: flex;
  align-items: center;
}

.header-search-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  width: 18px;
  height: 18px;
  pointer-events: none;
}

.header-search-input {
  width: 100%;
  padding-left: 42px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 14px;
  box-shadow: none;
  transition: all 0.2s ease-in-out;
}

.header-search-input:focus {
  background-color: #ffffff;
  border-color: #d1d5db;
  box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.4);
  outline: none;
}

.header-divider {
  width: 1px;
  height: 28px;
  background-color: #e5e7eb;
}

.lang-selector-btn {
  height: 38px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.lang-selector-btn:hover {
  background-color: #f9fafb;
  color: #111827;
  border-color: #d1d5db;
}

.lang-text {
  font-size: 14px;
}

.header-notif-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.notif-icon {
  color: #4b5563;
  transition: color 0.2s;
}

.header-notif-btn:hover .notif-icon {
  color: #111827;
}

.notif-dot {
  position: absolute;
  top: 0;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #dc2626;
  border: 2px solid #ffffff;
  border-radius: 50%;
}
</style>
