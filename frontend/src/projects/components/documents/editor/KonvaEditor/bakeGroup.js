export default function bakeGroup(group, parentSx = 1, parentSy = 1) {
    if (!group || !group.getClassName || group.getClassName() !== 'Group') return
    const sx = (typeof group.scaleX === 'function') ? group.scaleX() : 1
    const sy = (typeof group.scaleY === 'function') ? group.scaleY() : 1

    // if there's effectively no scale change and no parent accumulation, skip
    if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001 && Math.abs(parentSx - 1) < 0.001 && Math.abs(parentSy - 1) < 0.001) {
        // still recurse into children if parent accumulation exists
        if (Math.abs(parentSx - 1) < 0.001 && Math.abs(parentSy - 1) < 0.001) return
    }

    const totalSx = parentSx * sx
    const totalSy = parentSy * sy

    const childrenCollection = group.getChildren ? group.getChildren() : []
    const children = (childrenCollection && typeof childrenCollection.toArray === 'function') ? childrenCollection.toArray() : (childrenCollection ? Array.from(childrenCollection) : [])

    children.forEach((child) => {
        if (!child) return

        // multiply child's position by local group scale (keeps absolute positions)
        try { if (typeof child.x === 'function') child.x(child.x() * sx) } catch (e) { }
        try { if (typeof child.y === 'function') child.y(child.y() * sy) } catch (e) { }

        const ccls = (child.getClassName && child.getClassName()) || ''

        if (ccls === 'Group') {
            // recurse: pass accumulated total scales down the tree
            this.bakeGroup(child, totalSx, totalSy)
        } else if (ccls === 'Text') {
            const csx = (typeof child.scaleX === 'function') ? child.scaleX() : 1
            const csy = (typeof child.scaleY === 'function') ? child.scaleY() : 1
            const totalContentY = totalSy * csy
            try {
                // Only bake vertical scaling into fontSize. Do not modify width/lineHeight here.
                if (typeof child.fontSize === 'function' && typeof child.fontSize() === 'number') child.fontSize(Math.max(1, Math.round(child.fontSize() * (totalContentY * (this.fontScaleMultiplier || 1)))))
            } catch (e) { }
            try { if (typeof child.scaleX === 'function') child.scaleX(1) } catch (e) { }
            try { if (typeof child.scaleY === 'function') child.scaleY(1) } catch (e) { }
        } else {
            // Non-text child: preserve size attributes; only adjust positional coords above.
            // Do NOT bake width/height here to avoid layout changes — caller may handle shapes separately.
            // EXCEPT for graph-placeholder components where we need vector shapes to scale perfectly:
            const gName = typeof group.name === 'function' ? group.name() : '';
            if (gName && gName.includes('graph-placeholder')) {
                if (ccls === 'Rect') {
                    try { if (typeof child.width === 'function') child.width(child.width() * sx) } catch (e) { }
                    try { if (typeof child.height === 'function') child.height(child.height() * sy) } catch (e) { }
                } else if (ccls === 'Circle') {
                    try { if (typeof child.radius === 'function') child.radius(child.radius() * Math.min(sx, sy)) } catch (e) { }
                } else if (ccls === 'Line') {
                    try {
                        if (typeof child.points === 'function' && Array.isArray(child.points())) {
                            const newPoints = child.points().map((val, idx) => idx % 2 === 0 ? val * sx : val * sy)
                            child.points(newPoints)
                        }
                        if (typeof child.strokeWidth === 'function') {
                            child.strokeWidth((child.strokeWidth() || 1) * Math.min(sx, sy))
                        }
                    } catch (e) { }
                }
            }
        }
    })

    // reset this group's local scale after baking children
    try { if (typeof group.scaleX === 'function') group.scaleX(1) } catch (e) { }
    try { if (typeof group.scaleY === 'function') group.scaleY(1) } catch (e) { }
}
