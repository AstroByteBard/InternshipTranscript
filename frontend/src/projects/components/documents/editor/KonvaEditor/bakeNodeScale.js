export default function bakeNodeScale(node) {
    if (!node || !node.getClassName) return
    const cls = node.getClassName()
    try {
        if (cls === 'Group') {
            const name = (typeof node.name === 'function') ? node.name() : ''
            if (name && name.includes('graph-placeholder')) return
            this.bakeGroup(node, 1, 1)
            return
        }

        // Single non-group node (Text, Image, Shape) transformed directly
        const sx = (typeof node.scaleX === 'function') ? node.scaleX() : 1
        const sy = (typeof node.scaleY === 'function') ? node.scaleY() : 1
        if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) return

        if (cls === 'Text') {
            // Only bake vertical scale into fontSize. Do NOT change width/lineHeight here.
            if (typeof node.fontSize === 'function' && typeof node.fontSize() === 'number') {
                try { node.fontSize(Math.max(1, Math.round(node.fontSize() * (sy * (this.fontScaleMultiplier || 1))))) } catch (e) { }
            }
        } else {
            // generic shape/image
            if (typeof node.width === 'function' && typeof node.width() === 'number') {
                try { node.width(Math.max(1, node.width() * sx)) } catch (e) { }
            }
            if (typeof node.height === 'function' && typeof node.height() === 'number') {
                try { node.height(Math.max(1, node.height() * sy)) } catch (e) { }
            }
        }

        // reset node scale after baking
        try { if (typeof node.scaleX === 'function') node.scaleX(1) } catch (e) { }
        try { if (typeof node.scaleY === 'function') node.scaleY(1) } catch (e) { }
    } catch (err) {
        console.warn('bakeNodeScale error', err)
    }
}
