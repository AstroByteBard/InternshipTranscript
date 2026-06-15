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
                <h2 class="section-title">{{ $i18n.locale === 'th' ? 'สาขาวิชา' : 'MAJOR' }}</h2>
                <p class="section-description">{{ $i18n.locale === 'th' ? 'จัดการรายการและการดำเนินการของสาขาวิชา' :
                    'Manage major items and actions.' }}</p>
            </div>
            <CButton color="danger" @click="handleAdd">
                <CIcon name="cil-plus" class="mr-1" />{{ $i18n.locale === 'th' ? 'เพิ่ม' : 'Add' }}
            </CButton>
        </div>

        <div class="settings-filters mb-3">
            <CRow>
                <CCol sm="6">
                    <CInput v-model="search" :placeholder="$i18n.locale === 'th' ? 'ค้นหาสาขาวิชา' : 'Search majors'" />
                </CCol>
                <CCol sm="6">
                    <CSelect :options="schoolOptions" :value.sync="schoolFilter"
                        :placeholder="$i18n.locale === 'th' ? 'กรองตามโรงเรียน' : 'Filter by school'" />
                </CCol>
            </CRow>
        </div>

        <SettingsTitleTable :items="majorRows" :count-label="$i18n.locale === 'th' ? 'สาขาวิชา' : 'majors'"
            @edit="openEdit" @delete="handleDelete" />
        <MajorEditModal :show.sync="showEditModal" :item="editingItem" @save="saveEdit" />
        <MajorAddModal :show.sync="showAddModal" @save="createMajor" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SettingsTitleTable from '@/projects/components/Table/SettingsTitleTable.vue';
import MajorEditModal from '@/projects/components/Modal/MajorEditModal.vue';
import MajorAddModal from '@/projects/components/Modal/MajorAddModal.vue';

export default {
    name: 'ProjectSettingsMajor',
    components: { SettingsTitleTable, MajorEditModal, MajorAddModal },
    data() {
        return {
            showEditModal: false,
            showAddModal: false,
            search: '',
            schoolFilter: '',
            editingItem: null
        };
    },
    computed: {
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        majorRows() {
            const lang = this.$i18n.locale || 'en';
            const rows = (this.storedPrograms || []).map(item => {
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

            // apply school filter (robustly handle school as id or object)
            let filtered = rows;
            if (this.schoolFilter) {
                filtered = filtered.filter(r => {
                    const schoolField = r.school;
                    const sid = (schoolField && typeof schoolField === 'object') ? (schoolField._id || schoolField) : schoolField;
                    return String(sid || '').toLowerCase() === String(this.schoolFilter).toLowerCase();
                });
            }

            if (!this.search) return filtered;
            const q = String(this.search).toLowerCase();
            return filtered.filter(r => (String(r.thaiName || '').toLowerCase().includes(q) || String(r.englishName || '').toLowerCase().includes(q)));
        }
        ,
        schoolOptions() {
            const lang = this.$i18n.locale || 'en';
            const allSchoolsLabel = lang === 'th' ? 'โรงเรียนทั้งหมด' : 'All schools';
            if (!this.storedSchools) return [{ value: '', label: allSchoolsLabel }];
            return [
                { value: '', label: allSchoolsLabel },
                ...this.storedSchools.map(s => ({ value: s._id, label: s.title?.find(t => t.key === lang)?.value || s.title?.find(t => t.key === 'en')?.value || s._id }))
            ];
        }
    },
    created() {
        this.$store.dispatch('academic/programs/programs');
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
            // reload both programs and schools to keep lists in sync
            return Promise.all([
                this.$store.dispatch('academic/programs/programs'),
                this.$store.dispatch('academic/schools/schools')
            ]);
        },
        openEdit(item) {
            this.editingItem = item;
            this.showEditModal = true;
        },
        saveEdit(payload) {
            const isObject = payload && typeof payload === 'object';
            const titleData = isObject ? [
                { key: 'th', value: payload.th || payload.en || '' },
                { key: 'en', value: payload.en || payload.th || '' }
            ] : this.buildTitlePayload(payload);

            if (!this.editingItem) {
                // create
                return this.$store.dispatch('academic/programs/createPrograms', {
                    title: titleData,
                    description: [],
                    school: isObject ? (payload.school || null) : null
                }).then(() => this.refreshList()).then(() => {
                    this.showEditModal = false;
                    this.editingItem = null;
                });
            }

            // update
            let schoolId = this.editingItem.school || null;
            if (isObject) schoolId = payload.school || schoolId;

            return this.$store.dispatch('academic/programs/updatePrograms', {
                _id: this.editingItem._id,
                title: titleData,
                description: this.editingItem.description || [],
                school: schoolId || null
            }).then(() => {
                this.showEditModal = false;
                this.editingItem = null;
                return this.refreshList();
            });
        },
        handleAdd() {
            this.showAddModal = true;
        },

        createMajor(payload) {
            const isObject = payload && typeof payload === 'object';
            const titleData = isObject ? [
                { key: 'th', value: payload.th || payload.en || '' },
                { key: 'en', value: payload.en || payload.th || '' }
            ] : this.buildTitlePayload(payload);

            return this.$store.dispatch('academic/programs/createPrograms', {
                title: titleData,
                description: [],
                school: isObject ? (payload.school || null) : null
            }).then(() => {
                this.showAddModal = false;
                return this.refreshList();
            });
        },
        handleEdit(item) {
            const title = window.prompt('Edit major name', item.primary || '');
            if (!title) return;
            return this.$store.dispatch('academic/programs/updatePrograms', {
                ...item,
                title: this.buildTitlePayload(title.trim())
            }).then(() => this.refreshList());
        },
        handleDelete(item) {
            if (!window.confirm(`Delete major ${item.primary}?`)) return;
            return this.$store.dispatch('academic/programs/deletePrograms', { _id: item._id })
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
