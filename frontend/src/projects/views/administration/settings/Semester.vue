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
                <h2 class="section-title">{{ $i18n.locale === 'th' ? 'ภาคการศึกษา' : 'SEMESTER' }}</h2>
                <p class="section-description">{{ $i18n.locale === 'th' ? 'จัดการรายการและการดำเนินการของภาคการศึกษา' :
                    'Manage semester items and actions.' }}</p>
            </div>
            <CButton color="danger" @click="handleAdd">
                <CIcon name="cil-plus" class="mr-1" />{{ $i18n.locale === 'th' ? 'เพิ่ม' : 'Add' }}
            </CButton>
        </div>

        <div class="settings-filters mb-3">
            <CRow>
                <CCol sm="6">
                    <CInput v-model="search"
                        :placeholder="$i18n.locale === 'th' ? 'ค้นหาภาคการศึกษา' : 'Search semesters'" />
                </CCol>
            </CRow>
        </div>

        <SettingsTitleTable :items="semesterRows" :count-label="$i18n.locale === 'th' ? 'เทอม' : 'semesters'"
            @edit="openEdit" @delete="handleDelete" />
        <SemesterEditModal :show.sync="showEditModal" :item="editingItem" @save="saveEdit" />
        <SemesterAddModal :show.sync="showAddModal" @save="createSemester" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SettingsTitleTable from '@/projects/components/Table/SettingsTitleTable.vue';
import SemesterEditModal from '@/projects/components/Modal/SemesterEditModal.vue';
import SemesterAddModal from '@/projects/components/Modal/SemesterAddModal.vue';

export default {
    name: 'ProjectSettingsSemester',
    components: { SettingsTitleTable, SemesterEditModal, SemesterAddModal },
    data() {
        return {
            showEditModal: false,
            showAddModal: false,
            search: '',
            editingItem: null
        };
    },
    computed: {
        ...mapGetters('setting/semester', { storedSemesters: 'item' }),
        semesterRows() {
            const rows = (this.storedSemesters || []).map((item, index) => {
                const title = Array.isArray(item.title)
                    ? (item.title.find(t => t.key === (this.$i18n.locale || 'en')) || item.title.find(t => t.key === 'en') || item.title[0])
                    : null;
                return {
                    ...item,
                    thaiName: Array.isArray(item.title) ? (item.title.find(t => t.key === 'th') || item.title[0])?.value || item.value || `Semester ${index + 1}` : (item.value || `Semester ${index + 1}`),
                    englishName: Array.isArray(item.title) ? (item.title.find(t => t.key === 'en') || item.title[0])?.value || item.value || `Semester ${index + 1}` : (item.value || `Semester ${index + 1}`),
                    primary: title ? title.value : item.value || item._id || `Semester ${index + 1}`
                };
            });

            if (!this.search) return rows;
            const q = String(this.search).toLowerCase();
            return rows.filter(r => (String(r.thaiName || '').toLowerCase().includes(q) || String(r.englishName || '').toLowerCase().includes(q)));
        }
    },
    created() {
        this.$store.dispatch('setting/semester/get');
    },
    methods: {
        buildTitlePayload(title) {
            return [
                { key: 'th', value: title },
                { key: 'en', value: title }
            ];
        },
        refreshList() {
            return this.$store.dispatch('setting/semester/get');
        },
        openEdit(item) {
            this.editingItem = item;
            this.showEditModal = true;
        },
        saveEdit(payload) {
            if (!this.editingItem) return;
            const titleData = (payload && typeof payload === 'object') ? [
                { key: 'th', value: payload.th || payload.en || '' },
                { key: 'en', value: payload.en || payload.th || '' }
            ] : this.buildTitlePayload(payload);

            return this.$store.dispatch('setting/semester/put', {
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

        createSemester(payload) {
            if (!payload) return;
            const titleData = (payload && typeof payload === 'object') ? [
                { key: 'th', value: payload.th || payload.en || '' },
                { key: 'en', value: payload.en || payload.th || '' }
            ] : this.buildTitlePayload(payload.trim());

            return this.$store.dispatch('setting/semester/post', {
                title: titleData,
                description: []
            }).then(() => {
                this.showAddModal = false;
                return this.refreshList();
            });
        },
        handleEdit(item) {
            const title = window.prompt('Edit semester name', item.primary || '');
            if (!title) return;
            return this.$store.dispatch('setting/semester/put', {
                ...item,
                title: this.buildTitlePayload(title.trim())
            }).then(() => this.refreshList());
        },
        handleDelete(item) {
            if (!window.confirm(`Delete semester ${item.primary}?`)) return;
            return this.$store.dispatch('setting/semester/delete', { _id: item._id })
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
