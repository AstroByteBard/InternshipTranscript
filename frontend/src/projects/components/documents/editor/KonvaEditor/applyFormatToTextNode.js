import Konva from 'konva'

export default function applyFormatToTextNode(node, type, value) {
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
    } else if (type === 'fontSize') {
        node.fontSize(value);
    }

    // If node is part of a table group, mirror the attribute to the group for saving/persistence
    const parent = node.getParent();
    if (parent && parent instanceof Konva.Group) {
        const groupName = parent.name() || '';
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
    this.saveHistory();
}