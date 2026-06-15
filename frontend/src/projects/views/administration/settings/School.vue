<template>
    <div class="settings-page">
        <div class="mb-3">
            <CButton size="sm" variant="ghost" class="btn-back text-dark font-weight-bold pl-0" @click="$router.go(-1)">
                <CIcon name="cil-chevron-left" class="mr-1" /> {{ $i18n.locale === 'th' ? 'กลับ' : 'Back' }}
            </CButton>
        </div>
        <div class="settings-header">
            <div>
                <p class="section-kicker">{{ $i18n.locale === 'th' ? 'การตั้งค่า' : 'SETTINGS' }}</p>
                <h2 class="section-title">{{ $i18n.locale === 'th' ? 'โรงเรียน' : 'SCHOOL' }}</h2>
                <p class="section-description">{{ $i18n.locale === 'th' ? 'จัดการรายการและการดำเนินการของโรงเรียน' :
                    'Manage school items and actions.' }}</p>
            </div>
            <CButton color="danger" @click="handleAdd">
                <CIcon name="cil-plus" class="mr-1" />{{ $i18n.locale === 'th' ? 'เพิ่ม' : 'Add' }}
            </CButton>
        </div>

        <div class="settings-filters mb-3">
            <CRow>
                <CCol sm="6">
                    <CInput v-model="search"
                        :placeholder="$i18n.locale === 'th' ? 'ค้นหาโรงเรียน' : 'Search schools'" />
                </CCol>
            </CRow>
        </div>

        <SettingsTitleTable :items="schoolRows" :count-label="$i18n.locale === 'th' ? 'แห่ง' : 'schools'"
            @edit="openEdit" @delete="handleDelete" />
        <SchoolEditModal :show.sync="showEditModal" :item="editingItem" @save="saveEdit" />
        <SchoolAddModal :show.sync="showAddModal" @save="createSchool" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SettingsTitleTable from '@/projects/components/Table/SettingsTitleTable.vue';
import SchoolEditModal from '@/projects/components/Modal/SchoolEditModal.vue';
import SchoolAddModal from '@/projects/components/Modal/SchoolAddModal.vue';

export default {
    name: 'ProjectSettingsSchool',
    components: { SettingsTitleTable, SchoolEditModal, SchoolAddModal },
    data() {
        return {
            showEditModal: false,
            showAddModal: false,
            search: '',
            editingItem: null
        };
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        schoolRows() {
            const lang = this.$i18n.locale || 'en';
            const rows = (this.storedSchools || []).map(item => {
                const title = Array.isArray(item.title)
                    ? (item.title.find(t => t.key === lang) || item.title.find(t => t.key === 'en') || item.title[0])
                    : null;
                return {
                    ...item,
                    thaiName: Array.isArray(item.title) ? (item.title.find(t => t.key === 'th') || item.title[0])?.value || '-' : '-',
                    englishName: Array.isArray(item.title) ? (item.title.find(t => t.key === 'en') || item.title[0])?.value || '-' : '-',
                    primary: title ? title.value : item._id
                };
            });

            if (!this.search) return rows;
            const q = String(this.search).toLowerCase();
            return rows.filter(r => (String(r.thaiName || '').toLowerCase().includes(q) || String(r.englishName || '').toLowerCase().includes(q)));
        }
    },
    created() {
        this.$store.dispatch('academic/schools/schools');
    },
    methods: {
        buildTitlePayload(title) {
            return [
                { key: 'th', value: title },
                { key: 'en', value: title }
            ];
        },
        refreshList() {
            return this.$store.dispatch('academic/schools/schools');
        },
        openEdit(item) {
            this.editingItem = item;
            this.showEditModal = true;
        },
        saveEdit(payload) {
            if (!this.editingItem) return;
            let titleData;
            if (payload && typeof payload === 'object') {
                titleData = [
                    { key: 'th', value: payload.th || payload.en || '' },
                    { key: 'en', value: payload.en || payload.th || '' }
                ];
            } else {
                titleData = this.buildTitlePayload(payload);
            }
            return this.$store.dispatch('academic/schools/updateSchools', {
                _id: this.editingItem._id,
                title: titleData,
                description: this.editingItem.description || []
            }).then(() => {
                this.showEditModal = false;
                this.editingItem = null;
                return this.refreshList();
            });
        },
        handleAdd() {
            this.showAddModal = true;
        },

        createSchool(payload) {
            const th = payload && payload.th ? payload.th.trim() : '';
            const en = payload && payload.en ? payload.en.trim() : '';
            const titleData = [
                { key: 'th', value: th },
                { key: 'en', value: en }
            ];
            return this.$store.dispatch('academic/schools/createSchools', {
                title: titleData,
                description: []
            }).then(() => {
                this.showAddModal = false;
                return this.refreshList();
            });
        },
        handleEdit(item) {
            const title = window.prompt('Edit school name', item.primary || '');
            if (!title) return;
            return this.$store.dispatch('academic/schools/updateSchools', {
                ...item,
                title: this.buildTitlePayload(title.trim())
            }).then(() => this.refreshList());
        },
        handleDelete(item) {
            if (!window.confirm(`Delete school ${item.primary}?`)) return;
            return this.$store.dispatch('academic/schools/deleteSchools', { _id: item._id })
                .then(() => this.refreshList());
        }
    }
}
</script>

<style scoped>
.settings-page {
    background: #f8fafc;
    padding: 28px;
    min-height: calc(100vh - 120px);
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    border-bottom: 1px solid #d5dce8;
    padding-bottom: 20px;
    margin-bottom: 24px;
}

.section-kicker {
    margin: 0;
    color: #607395;
    letter-spacing: 0.22em;
    font-size: 12px;
    font-weight: 700;
}

.section-title {
    margin: 6px 0 4px;
    color: #0f2345;
    font-size: 34px;
    font-weight: 700;
    line-height: 1.05;
}

.section-description {
    margin: 0;
    color: #597096;
    font-size: 18px;
    font-weight: 500;
}

.btn-add {
    border: 1px solid #b91c1c;
    border-radius: 12px;
    background: #b91c1c;
    color: #ffffff;
    min-height: 44px;
    padding: 0 16px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
}

@media (max-width: 991px) {
    .settings-page {
        padding: 18px;
    }

    .settings-header {
        flex-direction: column;
        align-items: stretch;
    }

    .btn-add {
        width: 100%;
    }
}
</style>
