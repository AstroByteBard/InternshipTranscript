import Konva from 'konva'

export default function applyFormatToTextNode(node, type, value) {
    const scaledContextNames = new Set(['graph-placeholder', 'competency-table', 'suggestion-table', 'suggestion-table-part']);

    const refreshTextNode = (textNode) => {
        try {
            if (!textNode || typeof textNode.text !== 'function') return;
            const currentText = textNode.text();
            textNode.text(currentText);
            if (typeof textNode._setTextData === 'function') {
                textNode._setTextData();
            }
            if (typeof textNode.clearCache === 'function') {
                textNode.clearCache();
            }
            const textParent = typeof textNode.getParent === 'function' ? textNode.getParent() : null;
            if (textParent && typeof textParent.clearCache === 'function') {
                textParent.clearCache();
            }
        } catch (err) { /* ignore */ }
    }

    const getContextScaleY = (targetNode) => {
        try {
            let curr = targetNode;
            while (curr && typeof curr.getClassName === 'function' && curr.getClassName() !== 'Stage') {
                const elementType = (typeof curr.getAttr === 'function') ? curr.getAttr('elementType') : null;
                const name = (typeof curr.getAttr === 'function') ? curr.getAttr('name') : null;
                if (elementType === 'graph' || name === 'graph-placeholder' || scaledContextNames.has(name)) {
                    const scaleY = typeof curr.scaleY === 'function' ? Number(curr.scaleY()) : 1;
                    return Number.isFinite(scaleY) && scaleY !== 0 ? scaleY : 1;
                }
                curr = typeof curr.getParent === 'function' ? curr.getParent() : null;
            }
        } catch (err) { }
        return 1;
    }

    if (type === 'bold') {
        const current = node.fontStyle();
        if (current.includes('bold')) {
            node.fontStyle(current.replace('bold', '').trim() || 'normal');
        } else {
            node.fontStyle((current === 'normal' ? 'bold' : current + ' bold').trim());
        }
    } else if (type === 'italic') {
        const current = node.fontStyle();
        if (current.includes('italic')) {
            node.fontStyle(current.replace('italic', '').trim() || 'normal');
        } else {
            node.fontStyle((current === 'normal' ? 'italic' : current + ' italic').trim());
        }
    } else if (type === 'underline') {
        const current = node.textDecoration();
        node.textDecoration(current === 'underline' ? '' : 'underline');
    } else if (type === 'color') {
        node.fill(value);
    } else if (type === 'align') {
        node.align(value);
    } else if (type === 'fontFamily') {
        node.fontFamily(value);
        refreshTextNode(node);
    } else if (type === 'fontSize') {
        const desiredSize = Number(value);
        if (Number.isFinite(desiredSize)) {
            const contextScaleY = getContextScaleY(node);
            node.fontSize(Math.max(1, desiredSize / contextScaleY));
        } else {
            node.fontSize(value);
        }
    }

    // If node is part of a table group, mirror the attribute to the group for saving/persistence
    const parent = node.getParent();
    if (parent && parent instanceof Konva.Group) {
        const groupName = parent.name() || '';
        const shouldMirrorToGroupTexts = type === 'fontFamily' && !groupName.includes('graph-placeholder') && !groupName.includes('competency-table') && !groupName.includes('suggestion-table');
        if (shouldMirrorToGroupTexts && typeof parent.find === 'function') {
            try {
                const textNodes = parent.find('Text');
                if (textNodes && textNodes.length > 1) {
                    textNodes.forEach((textNode) => {
                        try {
                            textNode.fontFamily(value);
                            refreshTextNode(textNode);
                        } catch (err) { /* ignore */ }
                    });
                }
            } catch (err) { /* ignore */ }
        }
        if (type === 'fontFamily' && !groupName.includes('graph-placeholder') && !groupName.includes('competency-table') && !groupName.includes('suggestion-table')) {
            try {
                const descendants = typeof parent.find === 'function' ? parent.find('Text') : [];
                if (descendants && descendants.length) {
                    descendants.forEach((textNode) => {
                        try {
                            textNode.fontFamily(value);
                            refreshTextNode(textNode);
                        } catch (err) { /* ignore */ }
                    });
                }
            } catch (err) { /* ignore */ }
        }
        if (groupName.includes('suggestion-table-part')) {
            if (type === 'bold' || type === 'italic') {
                parent.setAttrs({ fontStyle: node.fontStyle() });
            } else if (type === 'underline') {
                parent.setAttrs({ textDecoration: node.textDecoration() });
            } else if (type === 'color') {
                parent.setAttrs({ fill: value });
            } else if (type === 'align') {
                parent.setAttrs({ align: value });
            } else if (type === 'fontFamily') {
                parent.setAttrs({ fontFamily: value });
            } else if (type === 'fontSize') {
                parent.setAttrs({ fontSize: Number(value) });
            }
            this.relayoutSuggestionColumn(parent);
        } else if (groupName.includes('competency-table')) {
            // competency-table might need its own relayout if implemented, 
            // for now just update attrs
            if (type === 'bold' || type === 'italic') {
                parent.setAttrs({ fontStyle: node.fontStyle() });
            } else if (type === 'fontSize') {
                parent.setAttrs({ fontSize: Number(value) });
            }
        }
    }
    try {
        const layer = typeof node.getLayer === 'function' ? node.getLayer() : null;
        if (layer && typeof layer.batchDraw === 'function') {
            layer.batchDraw();
        }
    } catch (err) { /* ignore */ }
    this.saveHistory();
}