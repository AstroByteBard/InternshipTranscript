export default function emitSelectionChange() {
    const info = this.computeSelectionStyle();
    this.$emit('selection-changed', info);
    if (typeof this.updateSelectionHighlights === 'function') {
        this.updateSelectionHighlights();
    }
}
