export default function getStoreList(getterKey) {
    const list = this.$store && this.$store.getters
        ? this.$store.getters[getterKey]
        : null;
    return Array.isArray(list) ? list : [];
}