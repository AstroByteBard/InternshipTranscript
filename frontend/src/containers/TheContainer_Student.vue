<template>
  <div class="c-app c-default-layout">
    <TheSidebar_Student />
    <CWrapper>
      <TheHeader_Student />
      <CContainer class="c-main">
        <transition name="fade">
          <router-view />
        </transition>
      </CContainer>
      <TheFooter />
    </CWrapper>
  </div>
</template>

<script>
import TheSidebar_Student from '@/containers/TheSidebar_Student'
import TheHeader_Student from '@/containers/TheHeader_Student.vue'
import TheFooter from '@/containers/TheFooter.vue'

export default {
  name: 'TheContainer_Student',
  components: {
    TheSidebar_Student,
    TheHeader_Student,
    TheFooter
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
