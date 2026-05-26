<template>
    <CCard class="border-0 shadow-sm h-100">
        <CCardBody class="p-3 d-flex flex-column h-100">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h6 class="mb-0 font-weight-bold">{{ $t('components.documents_editor_historylogsidebar_vue_history_log') }}</h6>
                <CButton size="sm" color="light" class="history-clear-btn" @click="$emit('clear')">{{ $t('components.documents_editor_historylogsidebar_vue_clear') }}</CButton>
            </div>

            <div class="history-list flex-grow-1 custom-scrollbar">
                <div v-if="!historyLog || !historyLog.length" class="text-muted small py-2">{{ $t('components.documents_editor_historylogsidebar_vue_no_recorded_actions_y') }}</div>

                <div v-for="entry in historyLog" :key="entry.id" class="history-entry">
                    <div class="history-entry-meta">
                        {{ formatTimestamp(entry.timestamp) }} • #{{ entry.historyIndex }} • {{ entry.actions.length }}
                        action(s)
                    </div>
                    <div v-for="summary in entry.summaries" :key="summary" class="history-entry-action">
                        {{ summary }}
                    </div>
                </div>
            </div>
        </CCardBody>
    </CCard>
</template>

<script>
export default {
    name: 'HistoryLogSidebar',
    props: {
        historyLog: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        formatTimestamp(timestamp) {
            if (!timestamp) return ''
            try {
                return new Date(timestamp).toLocaleTimeString()
            } catch (e) {
                return timestamp
            }
        }
    }
}
</script>

<style scoped>
.history-clear-btn {
    border-radius: 8px;
    padding: 0.2rem 0.65rem;
    font-size: 0.75rem;
}

.history-list {
    overflow-y: auto;
    padding-right: 2px;
}

.history-entry {
    padding: 0.55rem 0;
}

.history-entry+.history-entry {
    border-top: 1px solid #e5e7eb;
}

.history-entry-meta {
    font-size: 12px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.history-entry-action {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.45;
    word-break: break-word;
}
</style>