export default function updateCompetencyGroupStyle(group, style = {}) {
    if (!group || !group.getChildren) return
    const children = group.getChildren().toArray ? group.getChildren().toArray() : Array.from(group.getChildren())
    const scaleY = (typeof group.scaleY === 'function' && Number.isFinite(group.scaleY()) && group.scaleY() !== 0)
        ? group.scaleY()
        : 1
    const normalizedStyle = Object.assign({}, style)
    if (typeof normalizedStyle.fontSize !== 'undefined') {
        const requested = Number(normalizedStyle.fontSize)
        if (Number.isFinite(requested)) {
            normalizedStyle.fontSize = Math.max(1, requested / scaleY)
        }
    }
    // Update group-level attributes for future insertions
    group.setAttrs({
        fontSize: typeof normalizedStyle.fontSize !== 'undefined' ? normalizedStyle.fontSize : group.getAttr('fontSize'),
        fontFamily: normalizedStyle.fontFamily || group.getAttr('fontFamily'),
        fill: normalizedStyle.fill || group.getAttr('fill'),
        fontStyle: normalizedStyle.fontStyle || group.getAttr('fontStyle')
    })
    // Apply to all text nodes inside
    children.forEach((c) => {
        if (!c || c.getClassName() !== 'Text') return
        this.applyTextStyle(c, normalizedStyle)
    })
    // adjust hit rect and layout heights if needed
    const hitRect = group.findOne('Rect')
    if (hitRect) {
        const rect = group.getClientRect({ skipTransform: true })
        hitRect.width(rect.width)
        hitRect.height(rect.height)
    }
    this.layer.batchDraw()
    this.saveHistory()
}
