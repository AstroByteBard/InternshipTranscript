export default function updateCompetencyGroupStyle(group, style = {}) {
    if (!group || !group.getChildren) return
    const children = group.getChildren().toArray ? group.getChildren().toArray() : Array.from(group.getChildren())
    // Update group-level attributes for future insertions
    group.setAttrs({
        fontSize: style.fontSize || group.getAttr('fontSize'),
        fontFamily: style.fontFamily || group.getAttr('fontFamily'),
        fill: style.fill || group.getAttr('fill'),
        fontStyle: style.fontStyle || group.getAttr('fontStyle')
    })
    // Apply to all text nodes inside
    children.forEach((c) => {
        if (!c || c.getClassName() !== 'Text') return
        this.applyTextStyle(c, style)
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
