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
            <button @click="onAuthenGoogle"
              class="google-signin-btn btn w-100 d-flex align-items-center justify-content-center">
              <img src="@/assets/icons/logo-google.png" alt="Google Logo" class="mr-3" width="24px">
              <span class="font-weight-bold">Continue with Admin Lamduan Mail</span>
            </button>
          </div>
          <div class="google-login-btn-container w-100 mt-4">
            <button @click="onAuthenGoogle"
              class="google-signin-btn btn w-100 d-flex align-items-center justify-content-center">
              <img src="@/assets/icons/logo-google.png" alt="Google Logo" class="mr-3" width="24px">
              <span class="font-weight-bold">Continue with Student Lamduan Mail</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="login-footer mt-5 pt-4 text-center w-100">
        <p class="text-muted mb-0" style="font-size: 14px; opacity: 0.8;">
          * Note: You can contact the Student Employment and Internship Division at Email:
          <a href="mailto:Internship@mfu.ac.th" class="font-weight-bold text-dark">Internship@mfu.ac.th</a>
          Tel. <span class="font-weight-bold text-dark">053-916366</span>
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
    return {}
  },
  created() {
    this.onInit();
  },
  methods: {
    onInit() {
      // original init code
    },
    async onAuthenGoogle() {
      try {
        const googleUser = await this.$gAuth.signIn();
        console.log('googleUser', googleUser)
        // Add your login logic here (e.g., dispatching to Vuex)
        // this.$store.dispatch("auth/onLoginWithGoogle", googleUser);
      } catch (err) {
        console.error('Google sign-in error:', err);
        this.$toast?.error('Google Sign-In failed. Please try again.');
      }
    }
  },
  computed: {
    ...mapGetters({
      lang: 'setting/lang',
    })
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


@media (max-width: 768px) {
  .login-actions {
    align-items: center !important;
    text-align: center;
  }
}
</style>
