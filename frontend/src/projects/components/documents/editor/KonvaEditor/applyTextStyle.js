export default function applyTextStyle(node, style = {}) {
    if (!node || typeof node.setAttrs !== 'function') return
    const attrs = {}
    if (typeof style.fontSize !== 'undefined') attrs.fontSize = Number(style.fontSize) || node.fontSize()
    if (typeof style.fontFamily !== 'undefined') attrs.fontFamily = style.fontFamily
    if (typeof style.fill !== 'undefined') attrs.fill = style.fill
    if (typeof style.fontStyle !== 'undefined') attrs.fontStyle = style.fontStyle
    if (typeof style.textDecoration !== 'undefined') attrs.textDecoration = style.textDecoration
    if (typeof style.lineHeight !== 'undefined') attrs.lineHeight = style.lineHeight
    node.setAttrs(attrs)
}
