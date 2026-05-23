import Konva from 'konva'

export default function saveToJSON() {
    if (!this.stage) return null;
    const bg = this.layer.findOne('.background-rect');
    const elements = [];

    this.layer.children.forEach(node => {
        // Skip transformer, background, and internal nodes
        if (node === this.transformer || node === bg) return;
        if (node && typeof node.getAttr === 'function' && node.getAttr('name') === 'data-variable-connector') return;

        const attrs = node.getAttrs();
        const el = {
            className: node.getClassName(),
            attrs: { ...attrs },
            zIndex: node.zIndex()
        };
        el._orderIndex = elements.length

        // Ensure custom attributes on groups are captured (Konva.Group.getAttrs might skip non-standard ones in some versions)
        if (node instanceof Konva.Group) {
            const gn = node.name() || '';
            if (gn.includes('table')) {
                ['fontSize', 'fontFamily', 'fill', 'fontStyle', 'textDecoration', 'align', 'labels', 'columnWidth', 'variableName'].forEach(attr => {
                    const val = node.getAttr(attr);
                    if (val !== undefined) el.attrs[attr] = val;
                });
            } else if (gn === 'graph-placeholder') {
                ['graphType', 'graphKind', 'graphScope', 'elementType', 'templateKey'].forEach(attr => {
                    const val = node.getAttr(attr);
                    if (val !== undefined) el.attrs[attr] = val;
                });
            }
        }

        // Remove large/circular refs if any
        delete el.attrs.image;

        if (node instanceof Konva.Image) {
            el.src = node.image().src;
        } else if (node instanceof Konva.Group) {
            // For groups, we usually recreate them from attrs like 'name'.
            // Additionally capture immediate child GROUP attrs so we can
            // restore moved/adjusted child positions (e.g., suggestion-table-part).
        }
        // Capture immediate child nodes attrs for groups so nested text/font
        // changes are preserved. Store an array of children { className, attrs }.
        if (node instanceof Konva.Group) {
            try {
                const childrenCollection = (typeof node.getChildren === 'function') ? node.getChildren() : null;
                const childrenArray = (childrenCollection && typeof childrenCollection.toArray === 'function')
                    ? childrenCollection.toArray()
                    : (childrenCollection ? Array.from(childrenCollection) : []);
                const childrenSaved = childrenArray.map((c) => {
                    try {
                        const cAttrs = c && typeof c.getAttrs === 'function' ? { ...c.getAttrs() } : {};
                        // avoid serializing image bitmap data
                        delete cAttrs.image;

                        // also capture immediate children of this child (one level deep)
                        let nested = [];
                        try {
                            const cChildCollection = (typeof c.getChildren === 'function') ? c.getChildren() : null;
                            const cChildArray = (cChildCollection && typeof cChildCollection.toArray === 'function')
                                ? cChildCollection.toArray()
                                : (cChildCollection ? Array.from(cChildCollection) : []);
                            nested = cChildArray.map(cc => {
                                try {
                                    const ccAttrs = cc && typeof cc.getAttrs === 'function' ? { ...cc.getAttrs() } : {};
                                    delete ccAttrs.image;
                                    return { className: cc && typeof cc.getClassName === 'function' ? cc.getClassName() : null, attrs: ccAttrs };
                                } catch (err) {
                                    return null;
                                }
                            }).filter(Boolean);
                        } catch (err) {
                            nested = [];
                        }

                        const saved = { className: c && typeof c.getClassName === 'function' ? c.getClassName() : null, attrs: cAttrs };
                        if (nested && nested.length) saved.children = nested;
                        return saved;
                    } catch (err) {
                        return null;
                    }
                }).filter(Boolean);
                if (childrenSaved.length) el.attrs.children = childrenSaved;
                // If this is a suggestion table, derive current labels from child columns
                try {
                    const name = node.getAttr && node.getAttr('name');
                    if (name === 'suggestion-table') {
                        // find immediate child groups (columns)
                        const cols = childrenArray.filter(c => c && c.getAttr && (c.getAttr('name') === 'suggestion-table-part' || c.getAttr('labels')));
                        const left = [];
                        const right = [];
                        if (cols.length === 1) {
                            // single column -> treat as left
                            const col = cols[0];
                            const header = (col.find && col.find('Text') && col.find('Text')[0]) || null;
                            const hText = header && header.text ? String(header.text()) : null;
                            if (hText) left.push(hText);
                        } else if (cols.length >= 2) {
                            // extract header text from first two columns
                            const colLeft = cols[0];
                            const colRight = cols[1];
                            const hL = (colLeft.find && colLeft.find('Text') && colLeft.find('Text')[0]) || null;
                            const hR = (colRight.find && colRight.find('Text') && colRight.find('Text')[0]) || null;
                            const tL = hL && hL.text ? String(hL.text()) : null;
                            const tR = hR && hR.text ? String(hR.text()) : null;
                            if (tL) left.push(tL);
                            if (tR) right.push(tR);
                        }
                        // Always persist left/right arrays (may be empty) so reload won't fall back to defaults
                        el.attrs.labelsLeft = left;
                        el.attrs.labelsRight = right;
                        el.attrs.labels = (left || []).concat(right || []);
                    }
                    // For individual suggestion column parts, ensure labels attr matches header texts
                    if (node.getAttr && node.getAttr('name') === 'suggestion-table-part') {
                        const header = (childrenArray && childrenArray.find(c => c && c.getClassName && c.getClassName() === 'Text' && !c.getAttr('placeholderType'))) || null;
                        if (header && header.text) {
                            el.attrs.labels = [String(header.text())];
                        }
                    }
                } catch (err) {
                    // ignore extraction errors
                }
            } catch (err) {
                // ignore serialization errors
            }
        }

        elements.push(el);
    });

    elements.sort((a, b) => {
        const aZ = typeof a.zIndex === 'number' ? a.zIndex : 0
        const bZ = typeof b.zIndex === 'number' ? b.zIndex : 0
        if (aZ !== bZ) return aZ - bZ
        const aOrder = typeof a.attrs.createdOrder === 'number' ? a.attrs.createdOrder : a._orderIndex
        const bOrder = typeof b.attrs.createdOrder === 'number' ? b.attrs.createdOrder : b._orderIndex
        return aOrder - bOrder
    })

    elements.forEach(el => { delete el._orderIndex })

    return {
        width: this.stage.width(),
        height: this.stage.height(),
        elements
    };
}