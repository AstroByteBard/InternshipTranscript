import Konva from 'konva'

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

    try {
        if (safeAttrs && safeAttrs.dataVariableLinked && typeof this.enableManualDataVariableLinking === 'function') {
            this.enableManualDataVariableLinking(node)
        }
    } catch (err) { /* ignore */ }

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

                    // Migration: if saved text contains a leading bullet char, convert to real bullet circle
                    try {
                        const isText = childNode && typeof childNode.getClassName === 'function' && childNode.getClassName() === 'Text';
                        if (isText && typeof childAttrs.text === 'string' && /^\s*•\s+/.test(childAttrs.text)) {
                            // strip bullet char from text
                            const newText = childAttrs.text.replace(/^\s*•\s+/, '');
                            try { childNode.text(newText); } catch (e) { }
                            try { childNode.x((childNode.x && typeof childNode.x === 'function') ? 22 : ''); } catch (e) { }

                            // create a circle bullet and insert into parent (node)
                            try {
                                const Konva = (typeof window !== 'undefined' && window.Konva) ? window.Konva : null;
                                if (Konva && node && typeof node.add === 'function') {
                                    const baseFont = (childNode && typeof childNode.fontSize === 'function') ? (childNode.fontSize() || 12) : 12;
                                    const bulletRadius = Math.max(2, Math.round(baseFont / 4));
                                    const bullet = new Konva.Circle({ x: 10, y: (childNode.y && typeof childNode.y === 'function') ? (childNode.y() + Math.round(baseFont / 2)) : 0, radius: bulletRadius, fill: (childAttrs.fill || '#000'), listening: false });
                                    try { bullet.setAttr('placeholderType', 'suggestion-bullet'); } catch (e) { }
                                    try { node.add(bullet); bullet.zIndex(childNode.zIndex()); } catch (e) { }
                                }
                            } catch (e) { }
                        }
                    } catch (e) { }

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
