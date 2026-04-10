<template>
  <CDropdown inNav class="c-header-nav-items" placement="bottom-end" :caret="false">
    <template #toggler>
      <CHeaderNavLink class="px-0">
        <div class="d-flex align-items-center">
          <div class="c-avatar custom-avatar mr-2">
            <span class="avatar-text">AD</span>
          </div>
          <div class="user-info mr-2 d-none d-sm-flex">
            <div class="user-name">Admin User</div>
            <div class="user-role">System Administrator</div>
          </div>
          <CIcon name="cil-chevron-bottom" size="sm" class="text-muted d-none d-sm-block"
            style="width: 12px; height: 12px;" />
        </div>
      </CHeaderNavLink>
    </template>

    <!--    <CDropdownItem  @click="onAccounts">-->
    <!--&lt;!&ndash;      <CDropdownItem  @click="$store.commit('toggle', 'asideShow')">&ndash;&gt;-->
    <!--      <div >-->
    <!--        <div class="pt-1 mr-3 float-left">-->
    <!--          <div class="c-avatar">-->
    <!--            <img :src="(profile.userinfo.imageProfile != undefined)?profile.userinfo.imageProfile.src:defualt"  class="c-avatar-img" style="height: 100%"/>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div>-->
    <!--          <h6 class="text-muted mt-2">{{profile.userinfo.profile}} {{profile.userinfo.firstName}} {{profile.userinfo.lastName}}</h6>-->
    <!--&lt;!&ndash;          <small class="text-muted float-right mt-1">5 minutes ago</small>&ndash;&gt;-->
    <!--        </div>-->
    <!--        <h6 class=" font-weight-bold">Account : {{subAccount.zid}}  </h6>-->
    <!--      </div>-->
    <!--    </CDropdownItem>-->
    <!--    <CDropdownDivider/>-->

    <!--    <div class="pl-3 pr-3 pt-2 pb-2 "  style="cursor: pointer" @click="cardCollapse = !cardCollapse" >-->
    <!--      <div class="text-info">-->
    <!--        Other Profile-->
    <!--        <CBadge color="info" class="ml-auto">{{profile.subAccount.length}}</CBadge>-->
    <!--      </div>-->
    <!--      <div class="float-right">-->
    <!--&lt;!&ndash;        <CIcon name="cil-chevron-circle-right-alt"  />&ndash;&gt;-->
    <!--      </div>-->
    <!--    </div>-->
    <!--    <CCollapse :show="cardCollapse" class="overflow-auto" style="max-height: 150px; ">-->
    <!--      <div style="cursor: pointer" class="btn-ghost-dark  pl-3 pr-3 pt-2 pb-2 float-left w-100 "  v-for="item in profile.subAccount" @click="switAccount(item)">-->
    <!--&lt;!&ndash;        <div class="c-avatar float-left mr-2">&ndash;&gt;-->
    <!--&lt;!&ndash;          <img :src="(profile.userinfo.imageProfile != undefined)?profile.userinfo.imageProfile.src:defualt"  class="c-avatar-img" style="height: 100%"/>&ndash;&gt;-->
    <!--&lt;!&ndash;        </div>&ndash;&gt;-->
    <!--        <div class="float-left">-->
    <!--          <CRow>-->
    <!--            <CCol>-->
    <!--              <h6>Account : {{item.zid}} </h6>-->
    <!--            </CCol>-->
    <!--          </CRow>-->
    <!--          <CRow>-->
    <!--            <CCol>-->
    <!--              <h6>Level : <CBadge color="success" class="ml-auto pl-2 pr-2 " shape="pill"> {{ item.package }} </CBadge></h6>-->
    <!--            </CCol>-->
    <!--          </CRow>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </CCollapse>-->


    <!--    <div class="pl-4 pr-3 pt-2 pb-2 "  style="cursor: pointer"  @click="accountCollapse = !accountCollapse">-->
    <!--      <div>-->
    <!--        <CIcon name="cil-user-follow" size="xl"/>Create New ZID-->
    <!--      </div>-->
    <!--      <div class="float-right">-->
    <!--        &lt;!&ndash;        <CIcon name="cil-chevron-circle-right-alt"  />&ndash;&gt;-->
    <!--      </div>-->
    <!--    </div>-->
    <!--    <CCollapse :show="accountCollapse" class="overflow-auto" >-->
    <!--      <div style="cursor: pointer" class="bg-zdrive  pl-3 pr-3 pt-2 pb-2 float-left w-100 " >-->
    <!--        <CRow>-->
    <!--          <CCol  class="text-center">-->
    <!--            You want to create new profile?-->
    <!--          </CCol>-->
    <!--        </CRow>-->
    <!--        <CRow>-->
    <!--          <CCol class="text-center">-->
    <!--            <CButton variant="ghost"  color="success" class="mr-3 font-weight-bold" @click="createSubAccount" >YES</CButton>-->
    <!--            <CButton variant="ghost"  color="danger" class="font-weight-bold"  @click="accountCollapse = !accountCollapse" > NO </CButton>-->
    <!--          </CCol>-->
    <!--        </CRow>-->
    <!--      </div>-->
    <!--    </CCollapse>-->


    <!--    <CDropdownDivider/>-->
    <!--    <CDropdownItem>-->
    <!--      <CIcon name="cil-shield-alt" size="xl" /> Lock Account-->
    <!--    </CDropdownItem>-->
    <CDropdownItem @click="handleLogout">
      <CIcon name="cil-lock-locked" size="xl" /> Logout
    </CDropdownItem>
  </CDropdown>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: 'TheHeaderDropdownAccnt',

  data() {
    return {
      defualt: "https://demo.zdrive.fund/assets/images/brand/logo.png",
      itemsCount: 42,
      cardCollapse: true,
      accountCollapse: false
    }
  },

  mounted() {

  },

  created() {
    this.$store.dispatch("profile/onGetProfile")

  },
  beforeDestroy() {

  },

  methods: {
    handleLogout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    },
    replaceByDefault(e) {
      e.target.src = "https://demo.zdrive.fund/assets/images/brand/logo.png"
    },


    switAccount(subAccount) {
      this.$store.commit("profile/setSubAccount", subAccount)
    },

    createSubAccount() {
      this.accountCollapse = !this.accountCollapse;
      this.$store.dispatch("profile/onCreateSubAccounts")
    },

    onAccounts() {
      // this.$store.commit("profile/showProfile", true)
      this.$store.commit("auth/isSignIn", true)
    }
  },

  computed: {
    ...mapGetters({
      subAccount: 'profile/objSubAccount',
      profile: 'profile/objProfile',
    })
  },

  watch: {

  }
}
</script>

<style scoped>
.c-icon {
  margin-right: 0.3rem;
}

.c-header-nav .dropdown-item {
  min-width: 250px;
}

.c-header-nav-link {
  cursor: pointer;
}

.custom-avatar {
  width: 38px;
  height: 38px;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.avatar-text {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  margin-top: 2px;
}
</style>
