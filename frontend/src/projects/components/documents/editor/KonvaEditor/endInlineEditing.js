export default function endInlineEditing(commit = true) {
    if (!this.editingNode) return
    if (this.caret) {
        try { this.caret.destroy() } catch (e) { }
        this.caret = null
    }
    if (this.caretInterval) {
        clearInterval(this.caretInterval)
        this.caretInterval = null
    }
    this.editingNode = null
    this.layer.draw()
}
