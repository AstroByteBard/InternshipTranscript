export default function relayoutSuggestionColumn(group) {
    if (!group || typeof group.getChildren !== 'function') return;
    try {
        this.updateSuggestionPlaceholderForGroup(group);

        const childrenCollection = group.getChildren();
        const children = (childrenCollection && typeof childrenCollection.toArray === 'function')
            ? childrenCollection.toArray()
            : (childrenCollection ? Array.from(childrenCollection) : []);

        let hitRect = group.findOne('.hit-area');
        if (!hitRect) {
            for (const c of children) {
                if (c && c.getClassName && c.getClassName() === 'Rect') {
                    hitRect = c; break;
                }
            }
        }

        const baseWidth = Number(group.getAttr('columnWidth')) || 100;
        const localWidth = Math.max(1, baseWidth - 20);

        let y = 0;

        for (let i = 0; i < children.length; i++) {
            const c = children[i];
            if (!c || c === hitRect) continue;
            if (!c.getClassName || c.getClassName() !== 'Text') continue;

            const pType = c.getAttr && c.getAttr('placeholderType');

            if (!pType) {
                c.y(y);
                c.width(baseWidth);
                const rect = c.getClientRect({ skipTransform: true }) || { height: Math.ceil((c.fontSize && c.fontSize()) || 18) };
                y += Math.ceil(rect.height) + 2;
            } else if (pType === 'suggestion-number') {
                c.y(y);
            } else if (pType === 'suggestion-item') {
                c.y(y);
                c.width(localWidth);
                const rect = c.getClientRect({ skipTransform: true }) || { height: Math.ceil((c.fontSize && c.fontSize()) || 14) };
                y += Math.ceil(rect.height) + 2;
            } else {
                c.y(y);
                c.width(localWidth);
                const rect = c.getClientRect({ skipTransform: true }) || { height: Math.ceil((c.fontSize && c.fontSize()) || 14) };
                y += Math.ceil(rect.height) + 2;
            }
        }

        if (hitRect && typeof hitRect.height === 'function') {
            hitRect.height(Math.max(1, y));
            const bW = Number(group.getAttr('columnWidth')) || 0;
            if (bW > 0) hitRect.width(bW);
        }

        if (this.transformer && typeof this.transformer.forceUpdate === 'function') {
            this.transformer.forceUpdate();
        }

        if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw();
    } catch (err) {
        console.warn('relayoutSuggestionColumn error', err);
    }
}
