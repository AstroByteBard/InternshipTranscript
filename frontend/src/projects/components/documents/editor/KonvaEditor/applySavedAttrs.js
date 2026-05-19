export default function applySavedAttrs(node, attrs, zIndex) {
    if (!node || !attrs) return
    // Support both legacy childrenAttrs and new children arrays
    const savedChildren = attrs.children || attrs.childrenAttrs || null;

    // Build safe attrs for setAttrs (remove nested children blobs and large images)
    const safeAttrs = { ...attrs }
    delete safeAttrs.image
    delete safeAttrs.children
    delete safeAttrs.childrenAttrs

    try {
        node.setAttrs(safeAttrs)
    } catch (err) {
        // ignore if setAttrs fails for some attrs
    }

    if (typeof zIndex === 'number') {
        const bg = this.layer ? this.layer.findOne('.background-rect') : null
        const minZ = bg ? bg.zIndex() + 1 : 1
        node.zIndex(Math.max(minZ, zIndex))
    }

    // If saved children data exists, attempt to apply them to immediate children
    if (Array.isArray(savedChildren) && typeof node.getChildren === 'function') {
        try {
            const childrenCollection = node.getChildren();
            const childrenArray = (childrenCollection && typeof childrenCollection.toArray === 'function')
                ? childrenCollection.toArray()
                : (childrenCollection ? Array.from(childrenCollection) : []);

            savedChildren.forEach((savedChild, idx) => {
                const childNode = childrenArray[idx];
                if (childNode && savedChild && savedChild.attrs) {
                    // remove potential image blobs before applying
                    const childAttrs = { ...savedChild.attrs };
                    delete childAttrs.image;
                    // apply attrs to child node
                    try {
                        childNode.setAttrs(childAttrs)
                    } catch (err) {
                        // fallback to recursive application
                        this.applySavedAttrs(childNode, childAttrs)
                    }

                    // If the saved child has nested children, apply recursively
                    if (Array.isArray(savedChild.children) && typeof childNode.getChildren === 'function') {
                        this.applySavedAttrs(childNode, { children: savedChild.children })
                    }
                }
            });
        } catch (err) {
            // ignore
        }
    }
}
