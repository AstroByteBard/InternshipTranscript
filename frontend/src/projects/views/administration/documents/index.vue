<template>
    <div>
        <CRow class="mb-4 align-items-center">
            <CCol sm="6">
                <DocsSegmentControl v-model="selected" />
            </CCol>
            <CCol sm="6" class="d-flex justify-content-end">
                <CButton class="btn-filter-action btn-filter-red" @click="$router.push('/documents/create')">
                    <CIcon name="cil-plus" class="mr-2" /> Create New Document
                </CButton>
            </CCol>
        </CRow>

        <div v-if="selected === 'Document'">
            <CRow>
                <CCol>
                    <DocsFilterCard @search="(q) => { }" />

                    <DocumentsTable :items="documentsData" :fields="documentFields" @download="onDownload"
                        @edit="onEdit" @copy="onCopy" @delete="onDelete" />
                </CCol>
            </CRow>
        </div>

        <div v-if="selected === 'Certificate'">
            <CRow>
                <CCol>
                    <CCard class="mb-4">
                        <CCardHeader>
                            <h4 class="mb-0">Certificates</h4>
                        </CCardHeader>
                        <CCardBody>
                            <p>Certificate content goes here.</p>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </div>
    </div>
</template>

<script>
import DocsSegmentControl from '../../../components/documents/list/DocsSegmentControl.vue'
import DocsFilterCard from '../../../components/documents/list/DocsFilterCard.vue'
import DocumentsTable from '../../../components/documents/list/DocumentsTable.vue'

export default {
    name: 'DocumentsIndex',
    components: {
        DocsSegmentControl,
        DocsFilterCard,
        DocumentsTable
    },
    data() {
        return {
            selected: 'Document',
            documentFields: [
                { key: 'nameContent', label: 'NAME' },
                { key: 'status', label: 'STATUS' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-right pe-4', sorter: false, filter: false },
            ],
            documentsData: []
        }
    },
    mounted() {
        this.loadDocuments();
    },
    methods: {
        getIconClass(type) {
            if (type === 'PDF') return 'doc-icon-pdf';
            if (type === 'Word') return 'doc-icon-word';
            if (type === 'Excel') return 'doc-icon-excel';
            return 'doc-icon-default';
        },
        getIconName(type) {
            if (type === 'PDF') return 'cil-file';
            if (type === 'Word') return 'cil-description';
            if (type === 'Excel') return 'cil-spreadsheet';
            return 'cil-file';
        },
        async loadDocuments() {
            try {
                const res = await this.$api.documents('get');
                if (res.data && res.data.data) {
                    this.documentsData = res.data.data;
                }
            } catch (err) {
                console.error('Failed to load documents', err);
            }
        },
        onDownload(item) {
            console.log('download', item)
        },
        onEdit(item) {
            this.$router.push(`/documents/edit/${item._id}`);
        },
        onCopy(item) {
            if (!confirm(`Copy "${item.title}"?`)) return;
            const payload = {
                title: item.title + ' (Copy)',
                status: 'Draft',
                content: item.content,
            };
            this.$api.documents('post', payload)
                .then(() => this.loadDocuments())
                .catch(err => console.error('Copy failed', err));
        },
        async onDelete(item) {
            if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
            try {
                await this.$api.documents('delete', { _id: item._id });
                this.loadDocuments();
            } catch (err) {
                console.error('Delete failed', err);
            }
        },
        onOptions(item) {
            this.$router.push(`/administration/documents/edit/${item._id}`);
        }
    }
}
</script>

<style scoped>
/* segment, filter and action button styles moved into component files */

.btn-filter-action {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 16px;
    display: inline-flex;
    align-items: center;
}

.btn-filter-action:hover {
    background-color: #f9fafb;
    color: #111827;
}

.btn-filter-red {
    background-color: #dc2626;
    border-color: #dc2626;
    color: #ffffff;
}

.btn-filter-red:hover {
    background-color: #b91c1c;
    border-color: #b91c1c;
    color: #ffffff;
}

/* Data Table Overrides */
::v-deep .custom-table table {
    margin-bottom: 0;
}

::v-deep .custom-table thead th {
    background-color: #ffffff !important;
    color: #9ca3af !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody td {
    color: #374151 !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 12px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody tr:hover td {
    background-color: #f9fafb !important;
}

::v-deep .custom-table tbody tr:last-child td {
    border-bottom: none !important;
}

/* table row / icon styles moved to DocumentsTable.vue */
</style>
