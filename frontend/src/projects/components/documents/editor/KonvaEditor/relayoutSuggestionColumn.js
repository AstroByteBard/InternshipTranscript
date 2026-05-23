export default function relayoutSuggestionColumn(group) {
    if (!group || typeof group.getChildren !== 'function') return;
    try {
        const SUGGESTION_HEADER_CONTENT_GAP = 8;
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
        const localWidth = Math.max(1, baseWidth - 15);

        let y = 0;

        for (let i = 0; i < children.length; i++) {
            const c = children[i];
            if (!c || c === hitRect) continue;
            if (!c.getClassName || c.getClassName() !== 'Text') continue;

            const pType = c.getAttr && c.getAttr('placeholderType');

            if (!pType) {
                c.x(0);
                c.y(y);
                c.width(baseWidth);
                const rect = c.getClientRect({ skipTransform: true }) || { height: Math.ceil((c.fontSize && c.fontSize()) || 18) };
                y += Math.ceil(rect.height) + SUGGESTION_HEADER_CONTENT_GAP;
            } else if (pType === 'suggestion-number') {
                c.x(0);
                c.y(y);
            } else if (pType === 'suggestion-item' || pType === 'suggestion') {
                // adjust for real bullet circle on the left
                const textX = 22;
                c.x(textX);
                c.y(y);
                // reserve space for bullet (approx 20px)
                c.width(Math.max(1, localWidth - 10));
                if (typeof c.wrap === 'function') c.wrap('none');
                const rect = c.getClientRect({ skipTransform: true }) || { height: Math.ceil((c.fontSize && c.fontSize()) || 14) };
                // position bullet if previous sibling is a suggestion-bullet circle
                const prev = children[i - 1];
                try {
                    if (prev && prev.getClassName && prev.getClassName() === 'Circle' && prev.getAttr && prev.getAttr('placeholderType') === 'suggestion-bullet') {
                        const centreY = y + (rect.height / 2);
                        prev.x(10);
                        prev.y(centreY);
                    }
                } catch (e) { }
                y += Math.ceil(rect.height) + 2;
            } else {
                c.x(0);
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
