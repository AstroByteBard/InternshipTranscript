<template>
  <div class="c-app" :class="{ 'c-dark-theme': $store.state.darkMode }">
    <TheSidebar_Student />
    <TheAside />
    <CWrapper>
      <TheHeader_Student />
      <div class="c-body">
        <main class="c-main bg-gray-50">
          <CContainer fluid>
            <transition name="fade">
              <router-view></router-view>
            </transition>
          </CContainer>
        </main>
        <!-- <TheFooter/> -->
      </div>
    </CWrapper>
    <CenterLoading />
    <DialogMessage />
    <SignIn />

  </div>
</template>

<script>
import TheSidebar_Student from '@/containers/TheSidebar_Student.vue'
import TheHeader_Student from '@/containers/TheHeader_Student.vue'
import TheFooter from '@/containers/TheFooter.vue'
import TheAside from './TheAside'
import DialogMessage from '@/projects/components/dialog/DialogMessage.vue'
import CenterLoading from '@/projects/components/dialog/CenterLoading.vue'
import SignIn from '@/projects/components/dialog/SignIn.vue'

export default {
  name: 'TheContainer_Student',
  components: {
    TheSidebar_Student,
    TheHeader_Student,
    TheFooter,
    TheAside,
    CenterLoading,
    DialogMessage,
    SignIn
  }
}
</script>

<style>
.c-app {
  display: flex;
}

.c-main {
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
