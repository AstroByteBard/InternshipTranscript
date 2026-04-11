<template>
    <div>
        <CertificatesHeader @create-click="$router.push('/documents/certificate/create')" />

        <WidgetsCertificates 
            :total="certificatesData.length" 
            :issued="issuedCount" 
            :draft="draftCount" 
            :revoked="revokedCount" 
        />

        <CRow class="mb-4">
            <CCol>
                <DocsFilterCard @search="(q) => { }" />

                <DocumentsTable 
                    :items="certificatesData" 
                    :fields="documentFields" 
                    @download="onDownload"
                    @edit="onEdit" 
                    @copy="onCopy" 
                    @delete="onDelete" 
                />
            </CCol>
        </CRow>
    </div>
</template>

<script>
import CertificatesHeader from '../../../components/Layout/CertificatesHeader.vue'
import WidgetsCertificates from '../../../components/widgets/WidgetsCertificates.vue'
import DocsFilterCard from '../../../components/documents/list/DocsFilterCard.vue'
import DocumentsTable from '../../../components/documents/list/DocumentsTable.vue'

export default {
    name: 'CertificatesIndex',
    components: {
        CertificatesHeader,
        WidgetsCertificates,
        DocsFilterCard,
        DocumentsTable
    },
    data() {
        return {
            documentFields: [
                { key: 'nameContent', label: 'NAME' },
                { key: 'status', label: 'STATUS' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-right pe-4', sorter: false, filter: false },
            ],
            certificatesData: []
        }
    },
    mounted() {
        this.loadCertificates();
    },
    methods: {
        async loadCertificates() {
            try {
                // Fetching from the same documents endpoint for now
                // In a real scenario, this might be filtered by type: 'Certificate'
                const res = await this.$api.documents('get');
                if (res.data && res.data.data) {
                    // For now, we show all, but we could filter here:
                    // this.certificatesData = res.data.data.filter(d => d.type === 'Certificate');
                    this.certificatesData = res.data.data;
                }
            } catch (err) {
                console.error('Failed to load certificates', err);
            }
        },
        onDownload(item) {
            console.log('download', item)
        },
        onEdit(item) {
            this.$router.push(`/documents/certificate/edit/${item._id}`);
        },
        onCopy(item) {
            if (!confirm(`Copy "${item.title}"?`)) return;
            const payload = {
                title: item.title + ' (Copy)',
                status: 'Draft',
                content: item.content,
            };
            this.$api.documents('post', payload)
                .then(() => this.loadCertificates())
                .catch(err => console.error('Copy failed', err));
        },
        async onDelete(item) {
            if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
            try {
                await this.$api.documents('delete', { _id: item._id });
                this.loadCertificates();
            } catch (err) {
                console.error('Delete failed', err);
            }
        }
    },
    computed: {
        issuedCount() {
            return this.certificatesData.filter(d => d.status === 'Active' || d.status === 'Published').length;
        },
        draftCount() {
            return this.certificatesData.filter(d => d.status === 'Draft').length;
        },
        revokedCount() {
            return this.certificatesData.filter(d => d.status === 'Archived' || d.status === 'Revoked').length;
        }
    }
}
</script>

<style scoped>
/* Table and layout styles are consistent with Document.vue */
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
</style>
