export const applyManualLinkedVariableExportLayout = (renderedNodesByOrder, getVisibleTextWidth) => {
    const gap = 20;
    const linkedSources = [];

    renderedNodesByOrder.forEach((node) => {
        try {
            const attrs = node && typeof node.getAttrs === 'function' ? node.getAttrs() : null;
            if (!attrs) return;
            if (attrs.linkedConnectionMode !== 'manual') return;
            if (typeof attrs.linkedTargetCreatedOrder === 'undefined' || attrs.linkedTargetCreatedOrder === null) return;
            linkedSources.push(node);
        } catch (err) { /* ignore */ }
    });

    linkedSources.sort((a, b) => {
        const aOrder = Number(a.getAttr && a.getAttr('createdOrder')) || 0;
        const bOrder = Number(b.getAttr && b.getAttr('createdOrder')) || 0;
        return aOrder - bOrder;
    });

    linkedSources.forEach((sourceNode) => {
        try {
            const sourceAttrs = sourceNode.getAttrs ? sourceNode.getAttrs() : {};
            const targetOrder = Number(sourceAttrs.linkedTargetCreatedOrder);
            if (!Number.isFinite(targetOrder)) return;

            const targetNode = renderedNodesByOrder.get(targetOrder);
            if (!targetNode) return;

            const sourceX = typeof sourceNode.x === 'function' ? sourceNode.x() : Number(sourceAttrs.x || 0);
            const sourceY = typeof sourceNode.y === 'function' ? sourceNode.y() : Number(sourceAttrs.y || 0);
            const sourceBox = typeof sourceNode.getClientRect === 'function' ? sourceNode.getClientRect({ skipTransform: false }) : null;
            const targetBox = typeof targetNode.getClientRect === 'function' ? targetNode.getClientRect({ skipTransform: false }) : null;
            if (!sourceBox || !targetBox) return;

            const sourceVisibleWidth = Math.max(0, getVisibleTextWidth(sourceNode));
            const targetVisibleWidth = Math.max(0, getVisibleTextWidth(targetNode));
            const shouldPlaceRight = targetBox.x >= sourceBox.x;
            const nextX = shouldPlaceRight
                ? Math.max(0, Math.round(sourceBox.x + (sourceVisibleWidth || sourceBox.width) + gap))
                : Math.max(0, Math.round(sourceBox.x - (targetVisibleWidth || targetBox.width) - gap));
            const nextY = Math.round(sourceY);

            if (typeof targetNode.position === 'function') {
                targetNode.position({ x: nextX, y: nextY });
            } else {
                if (typeof targetNode.x === 'function') targetNode.x(nextX);
                if (typeof targetNode.y === 'function') targetNode.y(nextY);
            }
        } catch (err) { /* ignore */ }
    });
};