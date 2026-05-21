export default function computeSelectionStyle() {
    const nodes = (this.transformer && typeof this.transformer.nodes === 'function') ? this.transformer.nodes() : [];
    if (!nodes || !nodes.length) return null;
    const attrs = ['fontSize', 'fontFamily', 'fill', 'fontStyle', 'textDecoration', 'align', 'lineHeight'];
    const result = {};
    attrs.forEach((a) => result[a] = undefined);

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
            } catch (e) {}
        }

        let scaleY = 1;
        try {
            let curr = targetNode;
            while (curr && curr.getClassName && curr.getClassName() !== 'Stage') {
                scaleY *= (typeof curr.scaleY === 'function' ? curr.scaleY() : 1);
                curr = curr.getParent ? curr.getParent() : null;
            }
        } catch (e) { scaleY = 1; }

        attrs.forEach((a) => {
            let val;
            try {
                if (targetNode.getAttr && typeof targetNode.getAttr === 'function') {
                    const av = targetNode.getAttr(a);
                    if (typeof av !== 'undefined' && av !== null) {
                        if (a === 'fontSize') {
                            val = Math.round(Number(av) * scaleY);
                        } else {
                            val = av;
                        }
                    } else {
                        if (a === 'fontSize' && targetNode.fontSize) {
                            val = Math.round(targetNode.fontSize() * scaleY);
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
                    val = Math.round(targetNode.fontSize() * scaleY);
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
