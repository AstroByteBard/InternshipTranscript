export default {
    // Bake scale into node/group children: convert visual scale to real attributes (fontSize, width, height)
    bakeNodeScale(node) {
        if (!node || !node.getClassName) return
        const cls = node.getClassName()
        try {
            if (cls === 'Group') {
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
    },

    // Bake scale for groups recursively. parentSx/parentSy are accumulated ancestor scales
    bakeGroup(group, parentSx = 1, parentSy = 1) {
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
            }
        })

        // reset this group's local scale after baking children
        try { if (typeof group.scaleX === 'function') group.scaleX(1) } catch (e) { }
        try { if (typeof group.scaleY === 'function') group.scaleY(1) } catch (e) { }
    }
}
