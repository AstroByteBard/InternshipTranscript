export default function handleNodeSelection(node, shiftKey) {
    if (!this.transformer) return
    const nodes = this.transformer.nodes().slice()
    if (shiftKey) {
        const index = nodes.indexOf(node)
        if (index >= 0) {
            nodes.splice(index, 1)
        } else {
            nodes.push(node)
        }
        this.transformer.nodes(nodes)
    } else {
        this.transformer.nodes([node])
    }
    this.layer.batchDraw()
    try { this.emitSelectionChange() } catch (err) { /* ignore */ }
}
