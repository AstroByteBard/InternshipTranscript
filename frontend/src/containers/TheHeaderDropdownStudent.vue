<template>
    <CDropdown inNav class="c-header-nav-items" placement="bottom-end" :caret="false">
        <template #toggler>
            <CHeaderNavLink class="px-0">
                <div class="d-flex align-items-center">
                    <div class="c-avatar custom-avatar mr-2">
                        <span class="avatar-text">{{ initials }}</span>
                    </div>
                    <div class="user-info mr-2 d-none d-sm-flex">
                        <div class="user-name">{{ displayName }}</div>
                        <div class="user-role">Student</div>
                    </div>
                    <CIcon name="cil-chevron-bottom" size="sm" class="text-muted d-none d-sm-block"
                        style="width: 12px; height: 12px;" />
                </div>
            </CHeaderNavLink>
        </template>

        <CDropdownItem @click="handleLogout">
            <CIcon name="cil-lock-locked" size="xl" /> Logout
        </CDropdownItem>
    </CDropdown>
</template>

<script>
export default {
    name: 'TheHeaderDropdownStudent',
    computed: {
        displayName() {
            const user = this.$store.state.auth?.user;
            return user?.name || user?.email || 'Student';
        },
        initials() {
            const name = this.displayName.trim();
            if (!name) return 'ST';
            const parts = name.split(' ').filter(Boolean);
            const first = parts[0]?.[0] || '';
            const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
            return (first + last).toUpperCase();
        }
    },
    methods: {
        handleLogout() {
            this.$store.dispatch('auth/logout');
            this.$router.push('/login');
        }
    }
}
</script>

<style scoped>
.c-icon {
    margin-right: 0.3rem;
}

.c-header-nav .dropdown-item {
    min-width: 220px;
}

.c-header-nav-link {
    cursor: pointer;
}

.custom-avatar {
    width: 38px;
    height: 38px;
    background-color: #e0e7ff;
    color: #4338ca;
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
