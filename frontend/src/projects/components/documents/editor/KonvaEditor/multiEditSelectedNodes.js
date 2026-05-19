export default function multiEditSelectedNodes() {
    const nodes = (this.transformer && typeof this.transformer.nodes === 'function') ? this.transformer.nodes() : [];
    if (!nodes || !nodes.length) return;
    if (nodes.length === 1) {
        const n = nodes[0];
        if (n && typeof n.getClassName === 'function' && n.getClassName() === 'Text') {
            try { this.startEditingText(n) } catch (err) { /* ignore */ }
            return;
        }
    }
    // For multiple selection: ask for replacement text
    const input = window.prompt('Edit text for selected items (will replace existing content)', '');
    if (input === null) return;
    nodes.forEach((n) => {
        try {
            if (n && typeof n.getClassName === 'function' && n.getClassName() === 'Text') {
                n.text(input)
            }
        } catch (err) { /* ignore */ }
    })
    this.layer.batchDraw();
    this.saveHistory();
    try { this.emitSelectionChange() } catch (err) { /* ignore */ }
}
