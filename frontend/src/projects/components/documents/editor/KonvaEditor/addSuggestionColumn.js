import Konva from 'konva'

export default function addSuggestionColumn(opts = {}) {
    if (!this.layer || !opts.labels || !opts.labels.length) return null;
    const columnWidth = Number(opts.columnWidth);
    const x = typeof opts.x !== 'undefined' ? Number(opts.x) : 0;
    const y = typeof opts.y !== 'undefined' ? Number(opts.y) : 0;

    const group = new Konva.Group({ x, y, draggable: true, name: 'suggestion-table-part' });
    this.assignCreationOrder(group);
    group.setAttr('labels', opts.labels);
    group.setAttr('columnWidth', columnWidth);

    const hitRect = new Konva.Rect({
        width: columnWidth,
        height: 1,
        fill: 'rgba(0,0,0,0)',
        listening: true,
        name: 'hit-area',
        historyIgnore: true
    });
    group.add(hitRect);
    let currentY = 0;
    const baseFontSize = (opts.fontSize && !isNaN(Number(opts.fontSize))) ? Number(opts.fontSize) : 12;
    const labelFontSize = opts.fontSize ? baseFontSize : Math.max(16, Math.floor(baseFontSize * 1.4));
    const locale = String(opts.locale || this.templateLocale || 'en').toLowerCase();
    const fontFamily = typeof opts.fontFamily === 'string' && opts.fontFamily.trim() ? opts.fontFamily.trim() : undefined;
    const fill = opts.fill || '#1e293b';
    const fontStyle = opts.fontStyle || 'normal';
    const textDecoration = opts.textDecoration || '';
    const INNER_EDIT_DOUBLE_DBL_MS = 1200;

    const setupTextNodeTransform = (txtNode) => {
        txtNode.on('transform', () => {
            this.layer.batchDraw();
        });
        txtNode.on('transformend', () => {
            try {
                const scaleX = txtNode.scaleX();
                const scaleY = txtNode.scaleY();
                const newW = Math.max(10, Math.round(txtNode.width() * scaleX));
                const newFontSize = Math.max(6, Math.round(txtNode.fontSize() * (scaleY * (this.fontScaleMultiplier || 1))));
                txtNode.width(newW);
                txtNode.fontSize(newFontSize);
                txtNode.scaleX(1);
                txtNode.scaleY(1);
                this.layer.batchDraw();
                this.saveHistory();
                try { this.emitSelectionChange() } catch (err) { }
            } catch (e) { }
        });
    };

    opts.labels.forEach((label) => {

        const bindInnerTextInteraction = (txtNode) => {
            txtNode.on('click tap', (e) => {
                e.cancelBubble = true;
                this.handleNodeSelection(group, e.evt);
            });

            txtNode.on('mousedown touchstart', (e) => {
                e.cancelBubble = true;
                this.handleNodeSelection(group, e.evt);
            });

            txtNode.on('dblclick dbltap', (e) => {
                e.cancelBubble = true;
                const now = Date.now();
                const lastTs = Number(txtNode.__innerEditLastDblTs || 0);
                const prevCount = Number(txtNode.__innerEditDblCount || 0);
                const withinWindow = (now - lastTs) <= INNER_EDIT_DOUBLE_DBL_MS;
                const nextCount = withinWindow ? (prevCount + 1) : 1;

                txtNode.__innerEditLastDblTs = now;
                txtNode.__innerEditDblCount = nextCount;

                // Require double-click twice before allowing direct inner-text editing.
                if (nextCount < 2) {
                    this.handleNodeSelection(group, e.evt);
                    return;
                }

                txtNode.__innerEditDblCount = 0;
                this.handleNodeSelection(txtNode, e.evt);
                this.startEditingText(txtNode);
            });
        };
        const labelNode = new Konva.Text({
            text: label,
            fontSize: labelFontSize,
            fontStyle: fontStyle.includes('bold') ? fontStyle : (fontStyle === 'normal' ? '600' : fontStyle + ' 600'),
            fill: fill,
            textDecoration: textDecoration,
            y: currentY,
            width: columnWidth
        });
        if (fontFamily) labelNode.setAttr('fontFamily', fontFamily);
        this.assignCreationOrder(labelNode);
        group.add(labelNode);
        setupTextNodeTransform(labelNode);
        bindInnerTextInteraction(labelNode);
        currentY += (labelFontSize * 1.4);

        // create 3 suggestion items (bullet circle + text) as placeholders
        const itemCount = 3;
        const bulletRadius = Math.max(2, Math.round(baseFontSize / 4));
        for (let ii = 0; ii < itemCount; ii++) {
            const itemY = currentY;
            const bullet = new Konva.Circle({
                x: 10,
                y: itemY + Math.round(baseFontSize / 2),
                radius: bulletRadius,
                fill: fill,
                listening: false
            });
            bullet.setAttr('placeholderType', 'suggestion-bullet');
            this.assignCreationOrder(bullet);
            group.add(bullet);

            const textNode = new Konva.Text({
                text: '',
                fontSize: baseFontSize,
                fontStyle: fontStyle,
                fill: fill,
                textDecoration: textDecoration,
                x: 22,
                y: itemY,
                width: columnWidth - 20,
                lineHeight: 1.4,
                wrap: 'none'
            });
            if (fontFamily) textNode.setAttr('fontFamily', fontFamily);
            textNode.setAttr('placeholderType', 'suggestion-item');
            this.assignCreationOrder(textNode);
            group.add(textNode);
            setupTextNodeTransform(textNode);
            bindInnerTextInteraction(textNode);
            currentY += baseFontSize + Math.round(baseFontSize * 0.8);
        }
    });

    hitRect.height(currentY + 10);
    hitRect.width(columnWidth);
    this.layer.add(group);

    this.relayoutSuggestionColumn(group);

    group.on('click tap', (e) => {
        const tgt = e.target;
        if (tgt && tgt !== group && tgt !== hitRect) return;
        this.handleNodeSelection(group, e.evt)
    });
    group.on('mousedown touchstart', (e) => {
        const tgt = e.target;
        if (tgt && tgt !== group && tgt !== hitRect) return;
        this.handleNodeSelection(group, e.evt)
    });
    group.on('dragend', () => {
        this.layer.draw();
        this.saveHistory();
    });
    group.on('transform', () => {
        this.layer.batchDraw();
    });
    group.on('transformend', () => {
        try {
            const scaleX = group.scaleX();
            const scaleY = group.scaleY();
            if (Math.abs(scaleX - 1) < 0.001 && Math.abs(scaleY - 1) < 0.001) {
                this.layer.draw();
                this.saveHistory();
                try { this.emitSelectionChange() } catch (e) { }
                return;
            }

            const textNodes = group.find('Text') || [];
            const baseWidth = Number(group.getAttr('columnWidth')) || 100;
            const newWidth = Math.max(50, Math.round(baseWidth * scaleX));

            textNodes.forEach((tn) => {
                try {
                    if (typeof tn.fontSize === 'function' && typeof tn.fontSize() === 'number') {
                        tn.fontSize(Math.max(1, Math.round(tn.fontSize() * (scaleY * (this.fontScaleMultiplier || 1)))));
                    }
                    if (typeof tn.width === 'function' && typeof tn.width() === 'number') {
                        try { tn.width(Math.max(1, Math.round(tn.width() * scaleX))) } catch (e) { }
                    }
                    if (typeof tn.x === 'function') tn.x(tn.x() * scaleX);
                    if (typeof tn.y === 'function') tn.y(tn.y() * scaleY);
                    try { if (typeof tn.scaleX === 'function') tn.scaleX(1) } catch (e) { }
                    try { if (typeof tn.scaleY === 'function') tn.scaleY(1) } catch (e) { }
                } catch (err) { }
            });

            try {
                const fontSizes = textNodes.map(tn => (typeof tn.fontSize === 'function' ? tn.fontSize() : null)).filter(Boolean)
                if (fontSizes.length) {
                    group.setAttr('fontSize', Math.round(fontSizes[0]))
                }
            } catch (e) { }

            try { group.setAttr('columnWidth', newWidth) } catch (e) { }

            group.scaleX(1);
            group.scaleY(1);

            this.relayoutSuggestionColumn(group);

            try {
                if (this.transformer && typeof this.transformer.forceUpdate === 'function') {
                    const cur = (typeof this.transformer.nodes === 'function') ? (this.transformer.nodes() || []) : [];
                    try { this.transformer.nodes([]) } catch (e) { }
                    setTimeout(() => {
                        try { this.transformer.nodes(cur && cur.length ? cur : [group]); this.transformer.forceUpdate(); } catch (e) { }
                        try { if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw(); } catch (e) { }
                        try { this.emitSelectionChange() } catch (err) { }
                    }, 0);
                }
            } catch (e) { }

            this.layer.draw();
            this.saveHistory();
            try { this.emitSelectionChange() } catch (e) { }
        } catch (err) {
            console.warn('suggestion transformend error', err);
            this.layer.draw();
            this.saveHistory();
        }
    });

    return group;
}
