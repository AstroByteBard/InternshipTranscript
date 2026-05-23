export default function computeSelectionStyle() {
    const nodes = (this.transformer && typeof this.transformer.nodes === 'function') ? this.transformer.nodes() : [];
    if (!nodes || !nodes.length) return null;
    const attrs = ['fontSize', 'fontFamily', 'fill', 'fontStyle', 'textDecoration', 'align', 'lineHeight'];
    const result = {};
    attrs.forEach((a) => result[a] = undefined);

    const scaledContextNames = new Set(['graph-placeholder', 'competency-table', 'suggestion-table', 'suggestion-table-part']);

    const getContextScaleY = (targetNode) => {
        try {
            let curr = targetNode;
            while (curr && curr.getClassName && curr.getClassName() !== 'Stage') {
                const elementType = (curr.getAttr && curr.getAttr('elementType')) || '';
                const name = (curr.getAttr && curr.getAttr('name')) || '';
                const isGraphContext = elementType === 'graph' || name === 'graph-placeholder';
                const isDataVariableContext = scaledContextNames.has(name);
                if (isGraphContext || isDataVariableContext) {
                    const scaleY = (typeof curr.scaleY === 'function' && Number.isFinite(curr.scaleY()) && curr.scaleY() !== 0)
                        ? curr.scaleY()
                        : 1;
                    return scaleY;
                }
                curr = curr.getParent ? curr.getParent() : null;
            }
        } catch (e) { }
        return 1;
    };

    nodes.forEach((node, idx) => {
        let targetNode = node;
        if (typeof node.getAttr === 'function' && node.getAttr('graphType')) {
            targetNode = node;
        }
        if (typeof node.getClassName === 'function' && node.getClassName() === 'Group') {
            try {
                // Find first nested Text node to read its actual font styles
                const firstText = node.findOne('Text');
                if (firstText) {
                    targetNode = firstText;
                }
            } catch (e) { }
        }

        const contextScaleY = getContextScaleY(targetNode);

        attrs.forEach((a) => {
            let val;
            try {
                if (targetNode.getAttr && typeof targetNode.getAttr === 'function') {
                    const av = targetNode.getAttr(a);
                    if (typeof av !== 'undefined' && av !== null) {
                        if (a === 'fontSize') {
                            const baseFontSize = Number(av);
                            if (Number.isFinite(baseFontSize)) {
                                val = Math.round(baseFontSize * contextScaleY);
                            }
                        } else {
                            val = av;
                        }
                    } else {
                        if (a === 'fontSize' && targetNode.fontSize) {
                            val = Math.round(targetNode.fontSize() * contextScaleY);
                        } else if (a === 'fontFamily' && targetNode.fontFamily) {
                            val = targetNode.fontFamily();
                        } else if (a === 'fill' && targetNode.fill) {
                            val = targetNode.fill();
                        } else if (a === 'fontStyle' && targetNode.fontStyle) {
                            val = targetNode.fontStyle();
                        } else if (a === 'textDecoration' && targetNode.textDecoration) {
                            val = targetNode.textDecoration();
                        } else if (a === 'align' && targetNode.align) {
                            val = targetNode.align();
                        } else if (a === 'lineHeight' && targetNode.lineHeight) {
                            val = targetNode.lineHeight();
                        }
                    }
                } else if (a === 'fontSize' && targetNode.fontSize) {
                    val = Math.round(targetNode.fontSize() * contextScaleY);
                } else if (a === 'fontFamily' && targetNode.fontFamily) {
                    val = targetNode.fontFamily();
                } else if (a === 'fill' && targetNode.fill) {
                    val = targetNode.fill();
                } else if (a === 'fontStyle' && targetNode.fontStyle) {
                    val = targetNode.fontStyle();
                } else if (a === 'textDecoration' && targetNode.textDecoration) {
                    val = targetNode.textDecoration();
                } else if (a === 'align' && targetNode.align) {
                    val = targetNode.align();
                } else if (a === 'lineHeight' && targetNode.lineHeight) {
                    val = targetNode.lineHeight();
                }
            } catch (err) {
                val = undefined
            }

            if (idx === 0) {
                result[a] = typeof val !== 'undefined' ? val : null;
            } else {
                if (result[a] !== null && typeof val !== 'undefined' && String(result[a]) === String(val)) {
                    // keep
                } else {
                    result[a] = null;
                }
            }
        })
    })

    return { count: nodes.length, style: result };
}
