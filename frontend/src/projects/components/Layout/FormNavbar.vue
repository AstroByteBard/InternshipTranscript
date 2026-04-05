<template>
  <nav class="form-navbar sticky-top">
    <div class="container-fluid px-4 py-2 d-flex align-items-center justify-content-between h-100">
      
      <!-- Left: Logo & Branding -->
      <div class="navbar-branding d-flex align-items-center">
        <div class="logo-box mr-3">
          <CIcon name="cil-school" size="lg" class="text-white" />
        </div>
        <div>
          <h1 class="logo-text mb-0">Internship Evaluation</h1>
          <p class="logo-subtext text-muted mb-0">Digital University Program</p>
        </div>
      </div>

      <!-- Right: Language Switcher -->
      <div class="navbar-actions d-flex align-items-center">
        <div class="lang-pill border d-flex align-items-center p-1 rounded-pill bg-light shadow-sm">
          <button 
            class="btn btn-sm rounded-pill lang-btn px-3" 
            :class="{ 'active bg-danger text-white': lang === 'th' }"
            @click="switchLang('th')"
          >TH</button>
          <button 
            class="btn btn-sm rounded-pill lang-btn px-3" 
            :class="{ 'active bg-danger text-white': lang === 'en' }"
            @click="switchLang('en')"
          >EN</button>
        </div>
      </div>

    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'FormNavbar',
  props: {
    studentName: { type: String, default: 'Assessue' },
    studentID: { type: String, default: 'TEMP-ID' }
  },
  computed: {
    ...mapGetters('setting', ['lang']),
    avatarInitial() {
      return this.studentName ? this.studentName.charAt(0).toUpperCase() : 'S';
    }
  },
  methods: {
    switchLang(val) {
      this.$store.commit('setting/lang', val);
      this.$i18n.locale = val;
    }
  }
}
</script>

<style scoped>
.form-navbar {
  height: 72px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  z-index: 1030;
}

.logo-box {
  width: 40px;
  height: 40px;
  background: #dc2626;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #1e293b;
}

.logo-subtext {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #dc2626;
}

.context-label {
  line-height: 1;
  margin-bottom: 2px;
}

.context-value {
  line-height: 1;
  font-size: 14px;
}

.lang-pill {
  gap: 4px;
}

.lang-btn {
  font-size: 12px;
  font-weight: 800;
  border: none;
  background: transparent;
  color: #64748b;
  height: 28px;
  display: flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.lang-btn.active {
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.lang-btn:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

@media (max-width: 576px) {
  .logo-text { font-size: 15px; }
  .logo-subtext { display: none; }
}
</style>
