<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center">
    <div class="login-container shadow-none p-4 d-flex flex-column align-items-center">
      <div class="login-content d-flex align-items-center justify-content-center flex-wrap">
        <!-- Left Side: Illustration -->
        <div class="login-illustration p-4 d-md-block">
          <img src="@/assets/banner/INTERNSHIP COOPERATION.png" alt="Internship Cooperation" class="img-fluid"
            style="max-width: 450px;">
        </div>

        <!-- Right Side: Login Actions -->
        <div class="login-actions p-4 d-flex flex-column align-items-start">
          <img src="@/assets/banner/MFU INTERNSHIP BANNER.png" alt="MFU Internship Banner" class="mb-4" height="100px">

          <div class="google-login-btn-container w-100 mt-4">
            <button @click="loginAsAdmin"
              class="google-signin-btn btn w-100 d-flex align-items-center justify-content-center">
              <img src="@/assets/icons/logo-google.png" alt="Google Logo" class="mr-3" width="24px">
              <span class="font-weight-bold">{{ $t('continue_admin_lamduan_mail') }}</span>
            </button>
          </div>
          <div class="google-login-btn-container w-100 mt-4">
            <button @click="openStudentLoginModal"
              class="google-signin-btn btn w-100 d-flex align-items-center justify-content-center">
              <img src="@/assets/icons/logo-google.png" alt="Google Logo" class="mr-3" width="24px">
              <span class="font-weight-bold">{{ $t('continue_student_lamduan_mail') }}</span>
            </button>
          </div>
        </div>
      </div>

      <CModal :show.sync="showStudentLoginModal" centered :close-on-backdrop="false" title="Select Student">
        <div class="p-3">
          <div class="mb-3">
            <label class="font-weight-bold text-uppercase text-muted mb-2" style="font-size: 0.8rem;">
              Select the student account to log in
            </label>
            <div class="autocomplete-wrapper" ref="autocomplete">
              <input
                v-model="studentQuery"
                type="text"
                class="form-control"
                :placeholder="$t('select_or_type_student')"
                :disabled="studentLoading || !studentOptions.length"
                @focus="onFocus"
                @input="onInput"
                @keydown.enter="onEnter"
                @keydown.escape="showDropdown = false"
                @keydown.down.prevent="onArrowDown"
                @keydown.up.prevent="onArrowUp"
              />
              <ul v-if="showDropdown && filteredOptions.length" class="autocomplete-dropdown">
                <li
                  v-for="(student, idx) in filteredOptions"
                  :key="student.value"
                  :class="{ active: idx === highlightIndex }"
                  @mousedown.prevent="selectStudent(student)"
                  @mouseenter="highlightIndex = idx"
                >
                  {{ student.label }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="studentLoading" class="text-muted">
            Loading students...
          </div>
          <div v-else-if="!studentOptions.length" class="text-muted">
            No student accounts found.
          </div>
        </div>
        <template #footer-wrapper>
          <div class="d-flex justify-content-end w-100 p-3">
            <CButton color="light" class="mr-2" @click="showStudentLoginModal = false">
              Cancel
            </CButton>
            <CButton color="primary" :disabled="(!selectedStudentEmail && !studentQuery) || studentLoading" @click="confirmStudentLogin">
              Login
            </CButton>
          </div>
        </template>
      </CModal>

      <!-- Footer Note -->
      <div class="login-footer mt-5 pt-4 text-center w-100">
        <p class="text-muted mb-0" style="font-size: 14px; opacity: 0.8;">
          {{ $t('contact_note_prefix') }}
          <a :href="`mailto:${$t('internship_email')}`" class="font-weight-bold text-dark">{{ $t('internship_email')
            }}</a>
          <span class="ml-2">{{ $t('internship_phone') }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      showStudentLoginModal: false,
      studentLoading: false,
      students: [],
      selectedStudentEmail: '',
      studentQuery: '',
      showDropdown: false,
      highlightIndex: -1
    }
  },
  created() {
    this.onInit();
    document.addEventListener('click', this.onClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onClickOutside);
  },
  methods: {
    onInit() {
      // original init code
    },

    async openStudentLoginModal() {
      this.showStudentLoginModal = true;
      this.studentQuery = '';
      this.showDropdown = false;
      this.highlightIndex = -1;
      if (!this.students.length) {
        await this.loadStudentAccounts();
      }
    },

    async loadStudentAccounts() {
      try {
        this.studentLoading = true;
        const students = await this.$store.dispatch('member/students/students');
        this.students = Array.isArray(students) ? students : [];
      } catch (err) {
        console.error('Failed to load student accounts:', err);
        this.$toast?.error('Failed to load student accounts');
      } finally {
        this.studentLoading = false;
      }
    },

    async confirmStudentLogin() {
      const email = this.selectedStudentEmail || this.studentQuery;
      if (!email) return;
      try {
        await this.$store.dispatch('auth/loginAsStudent', email);
        this.showStudentLoginModal = false;
        this.$router.push('/student/dashboard');
      } catch (err) {
        console.error('Student Login Error:', err);
        this.$toast?.error(err.response?.data?.message || 'Student Login Failed');
      }
    },

    selectStudent(student) {
      this.selectedStudentEmail = student.value;
      this.studentQuery = student.label;
      this.showDropdown = false;
      this.highlightIndex = -1;
    },

    onFocus() {
      if (this.filteredOptions.length) {
        this.showDropdown = true;
      }
    },

    onInput() {
      this.selectedStudentEmail = '';
      this.showDropdown = true;
      this.highlightIndex = -1;
    },

    onEnter() {
      if (this.highlightIndex >= 0 && this.filteredOptions[this.highlightIndex]) {
        this.selectStudent(this.filteredOptions[this.highlightIndex]);
      }
      this.showDropdown = false;
    },

    onArrowDown() {
      if (!this.filteredOptions.length) return;
      this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredOptions.length - 1);
    },

    onArrowUp() {
      this.highlightIndex = Math.max(this.highlightIndex - 1, -1);
    },

    onClickOutside(e) {
      const el = this.$refs.autocomplete;
      if (el && !el.contains(e.target)) {
        this.showDropdown = false;
      }
    },

    async loginAsAdmin() {
      try {
        await this.$store.dispatch('auth/loginAsAdmin');
        // Navigate to admin dashboard after successful login
        this.$router.push('/dashboard');
      } catch (err) {
        console.error('Admin Login Error:', err);
        this.$toast?.error(err.response?.data?.message || 'Admin Login Failed');
      }
    },

    async onAuthenGoogle() {
      try {
        const googleUser = await this.$gAuth.signIn();
        console.log('googleUser', googleUser)
        // Add your Google OAuth login logic here
        // this.$store.dispatch("auth/onLoginWithGoogle", googleUser);
      } catch (err) {
        console.error('Google sign-in error:', err);
        this.$toast?.error('Google Sign-In failed. Please try again.');
      }
    },

    getStudentLabel(student) {
      const name = this.getLocalizedName(student?.name) || student?.nameEnglish || student?.nameTh || student?.studentID || student?.email || 'Student';
      const identifier = student?.studentID || student?.email || student?.id || '';
      return identifier ? `${name} (${identifier})` : name;
    },

    getLocalizedName(nameValue) {
      if (!nameValue) return '';
      if (typeof nameValue === 'string') return nameValue;
      if (Array.isArray(nameValue)) {
        const currentLang = (this.$i18n.locale || 'en').toLowerCase();
        const match = nameValue.find(entry => entry && String(entry.key).toLowerCase() === currentLang);
        return match ? match.value : (nameValue[0] ? nameValue[0].value : '');
      }
      return '';
    }
  },
  computed: {
    ...mapGetters({
      lang: 'setting/lang',
    }),
    studentOptions() {
      return this.students.map(student => ({
        value: student.email || student.studentID || student.id || '',
        label: this.getStudentLabel(student)
      }));
    },
    filteredOptions() {
      const q = (this.studentQuery || '').toLowerCase().trim();
      if (!q) return this.studentOptions;
      return this.studentOptions.filter(s =>
        s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
      );
    }
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background-color: #ffffff;
  /* Page Background is now pure white */
  font-family: 'Sarabun', sans-serif;
  padding: 40px 20px;
}

.login-container {
  max-width: 1000px;
  width: 100%;
  border-radius: 0;
  background: transparent;
}

.login-content {
  width: 100%;
}


.google-signin-btn {
  background-color: #ffffff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 16px;
  color: #3c4b64;
}

.google-signin-btn:hover {
  background-color: #f8f9fa;
  border-color: #c0c0c0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}


.autocomplete-wrapper {
  position: relative;
  width: 100%;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
  border: 1px solid #d8dbe0;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.autocomplete-dropdown li {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  color: #3c4b64;
  transition: background 0.1s;
}

.autocomplete-dropdown li:hover,
.autocomplete-dropdown li.active {
  background: #ebedef;
}

@media (max-width: 768px) {
  .login-actions {
    align-items: center !important;
    text-align: center;
  }
}
</style>
