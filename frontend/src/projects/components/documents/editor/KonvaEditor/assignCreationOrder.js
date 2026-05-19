export default function assignCreationOrder(node) {
    if (!node) return
    const existing = node.getAttr('createdOrder')
    if (typeof existing === 'number') return
    node.setAttr('createdOrder', this.creationSeq)
    this.creationSeq += 1
}
