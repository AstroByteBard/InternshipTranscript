export default function updateSuggestionGroupStyle(group, style = {}) {
    if (!group || !group.find) return
    const scaleY = (typeof group.scaleY === 'function' && Number.isFinite(group.scaleY()) && group.scaleY() !== 0)
        ? group.scaleY()
        : 1
    const normalizedStyle = Object.assign({}, style)
    const fontSize = typeof normalizedStyle.fontSize !== 'undefined' ? Number(normalizedStyle.fontSize) : undefined
    if (Number.isFinite(fontSize)) {
        normalizedStyle.fontSize = Math.max(1, fontSize / scaleY)
    }
    const fontFamily = normalizedStyle.fontFamily
    const fill = normalizedStyle.fill
    const fontStyle = normalizedStyle.fontStyle
    const textDecoration = normalizedStyle.textDecoration

    group.find(node => node.getClassName && node.getClassName() === 'Text')
        .forEach((node) => {
            const isHeader = !node.getAttr || !node.getAttr('placeholderType')
            const s = {}
            if (typeof fontSize !== 'undefined') s.fontSize = isHeader ? Math.max(12, Math.floor(fontSize * 1.4)) : fontSize
            if (fontFamily) s.fontFamily = fontFamily
            if (fill) s.fill = fill
            if (fontStyle) s.fontStyle = fontStyle
            if (typeof textDecoration !== 'undefined') s.textDecoration = textDecoration
            this.applyTextStyle(node, s)
        })

    // relayout to apply new sizing
    this.relayoutSuggestionColumn(group)
    this.layer.batchDraw()
    this.saveHistory()
}
