<template>
    <div class="settings-page">
        <div class="mb-4 d-flex justify-content-between align-items-start">
            <div>
                <p class="text-muted font-weight-bold text-uppercase mb-1"
                    style="font-size: 0.85rem; letter-spacing: 0.1em;">SETTINGS</p>
                <h2 class="font-weight-bold text-dark mb-2">{{ pageTitle }}</h2>
                <p class="text-muted">{{ description }}</p>
            </div>
            <CButton color="danger" @click="$emit('add')">
                <CIcon name="cil-plus" class="mr-1" />Add
            </CButton>
        </div>

        <CCard>
            <CCardHeader
                class="d-flex justify-content-between align-items-center bg-transparent border-bottom-0 pt-4 pb-0">
                <div>
                    <p class="text-muted font-weight-bold text-uppercase mb-1"
                        style="font-size: 0.75rem; letter-spacing: 0.1em;">{{ listKicker }}</p>
                    <h4 class="font-weight-bold text-dark mb-0">{{ listTitle }}</h4>
                </div>
                <div class="text-muted font-weight-bold bg-light rounded px-3 py-2">
                    {{ items.length }} {{ listCountLabel }}
                </div>
            </CCardHeader>

            <CCardBody>
                <div v-if="items && items.length">
                    <div v-for="item in items" :key="getItemKey(item)"
                        class="d-flex justify-content-between align-items-center py-3 border-bottom">
                        <div>
                            <slot name="primary" :item="item">
                                <div class="font-weight-bold text-dark" style="font-size: 1.1rem;">{{ item.primary ||
                                    '-' }}</div>
                            </slot>
                            <slot name="secondary" :item="item">
                                <div class="text-muted small mt-1" v-if="item.secondary">{{ item.secondary }}</div>
                            </slot>
                        </div>
                        <div class="d-flex">
                            <CButton color="secondary" variant="ghost" class="mr-2" @click="$emit('edit', item)">
                                <CIcon name="cil-pencil" class="mr-1" />
                                <span>Edit</span>
                            </CButton>
                            <CButton color="danger" variant="ghost" @click="$emit('delete', item)">
                                <CIcon name="cil-trash" class="mr-1" />
                                <span>Delete</span>
                            </CButton>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center text-muted py-5">
                    No items found.
                </div>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
export default {
    name: 'SettingsListPage',
    props: {
        pageTitle: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        listKicker: {
            type: String,
            required: true
        },
        listTitle: {
            type: String,
            required: true
        },
        listCountLabel: {
            type: String,
            default: 'items'
        },
        items: {
            type: Array,
            default: () => []
        },
        itemKey: {
            type: Function,
            default: (item) => item._id || item.id || item.key || item.title || JSON.stringify(item)
        }
    },
    methods: {
        getItemKey(item) {
            return this.itemKey(item);
        }
    }
};
</script>

<style scoped>
.settings-page {
    padding: 24px;
}
</style>
