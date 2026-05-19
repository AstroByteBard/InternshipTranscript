export default function updateSuggestionGroupStyle(group, style = {}) {
    if (!group || !group.find) return
    const fontSize = typeof style.fontSize !== 'undefined' ? Number(style.fontSize) : undefined
    const fontFamily = style.fontFamily
    const fill = style.fill
    const fontStyle = style.fontStyle
    const textDecoration = style.textDecoration

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
