export default function applyTextStyle(node, style = {}) {
    if (!node || typeof node.setAttrs !== 'function') return
    const refreshNode = () => {
        try {
            if (typeof node.text === 'function') {
                node.text(node.text());
            }
            if (typeof node._setTextData === 'function') {
                node._setTextData();
            }
            if (typeof node.clearCache === 'function') {
                node.clearCache();
            }
            const parent = typeof node.getParent === 'function' ? node.getParent() : null;
            if (parent && typeof parent.clearCache === 'function') {
                parent.clearCache();
            }
        } catch (err) { /* ignore */ }
    }
    const attrs = {}
    if (typeof style.fontSize !== 'undefined') attrs.fontSize = Number(style.fontSize) || node.fontSize()
    if (typeof style.fontFamily !== 'undefined') attrs.fontFamily = style.fontFamily
    if (typeof style.fill !== 'undefined') attrs.fill = style.fill
    if (typeof style.fontStyle !== 'undefined') attrs.fontStyle = style.fontStyle
    if (typeof style.textDecoration !== 'undefined') attrs.textDecoration = style.textDecoration
    if (typeof style.lineHeight !== 'undefined') attrs.lineHeight = style.lineHeight
    node.setAttrs(attrs)
    if (typeof style.fontFamily !== 'undefined' || typeof style.fontSize !== 'undefined' || typeof style.fontStyle !== 'undefined' || typeof style.textDecoration !== 'undefined') {
        refreshNode()
    }
}
