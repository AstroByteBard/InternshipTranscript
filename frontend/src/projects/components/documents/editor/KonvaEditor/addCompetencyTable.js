import Konva from 'konva'

export default function addCompetencyTable(variableName, opts = {}) {
    return new Promise((resolve) => {
        const locale = String(opts.locale || this.templateLocale || 'th').toLowerCase()
        const isThai = locale.startsWith('th')
        const localeFontFamily = typeof opts.fontFamily === 'string' && opts.fontFamily.trim() ? opts.fontFamily.trim() : undefined
        const isGeneral = variableName.includes('General');
        const title = isGeneral
            ? (isThai ? 'ทักษะทั่วไป' : 'General Competencies')
            : (isThai ? 'ทักษะเฉพาะ' : 'Specific Competencies');

        const maxW = this.stage.width();
        const defaultW = 450;
        const hasX = typeof opts.x !== 'undefined' || typeof opts.left !== 'undefined'
        const hasY = typeof opts.y !== 'undefined' || typeof opts.top !== 'undefined'
        const x = hasX ? Number(typeof opts.x !== 'undefined' ? opts.x : opts.left) : Math.max(10, Math.floor((maxW - defaultW) / 2));
        const y = hasY ? Number(typeof opts.y !== 'undefined' ? opts.y : opts.top) : 50;

        const competencies = isGeneral
            ? this.getGeneralCompetencyLabels()
            : (isThai ? this.getSpecificCompetencyLabels() : this.getSpecificCompetencyPlaceholders());

        const group = new Konva.Group({ x, y, draggable: true, name: 'competency-table', variableName });
        group.setAttrs({
            fontSize: opts.fontSize || 14,
            fill: opts.fill || '#64748b',
            fontStyle: opts.fontStyle || 'normal'
        });
        if (localeFontFamily) {
            group.setAttr('fontFamily', localeFontFamily);
        }
        this.assignCreationOrder(group);

        const hitRect = new Konva.Rect({ width: defaultW, height: 100, fill: 'rgba(0,0,0,0)', listening: true, name: 'hit-area', historyIgnore: true });
        group.add(hitRect);

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

        const titleTextAttrs = { text: title, fontSize: 18, fontStyle: '600', fill: '#4b5563', y: 0 };
        if (localeFontFamily) titleTextAttrs.fontFamily = localeFontFamily;
        const titleText = new Konva.Text(titleTextAttrs);
        this.assignCreationOrder(titleText);
        group.add(titleText);
        setupTextNodeTransform(titleText);
        titleText.on('click tap', (e) => { this.handleNodeSelection(titleText, e.evt.shiftKey) });
        titleText.on('dblclick dbltap', (e) => { this.handleNodeSelection(titleText, e.evt.shiftKey); this.startEditingText(titleText); });
        titleText.on('mousedown touchstart', (e) => { e.cancelBubble = true; this.handleNodeSelection(titleText, e.evt.shiftKey); });

        const scoreHeaderAttrs = { text: isThai ? 'คะแนน' : 'Score', fontSize: 18, fontStyle: '600', fill: '#4b5563', x: 350, y: 0 };
        if (localeFontFamily) scoreHeaderAttrs.fontFamily = localeFontFamily;
        const scoreHeader = new Konva.Text(scoreHeaderAttrs);
        this.assignCreationOrder(scoreHeader);
        group.add(scoreHeader);
        setupTextNodeTransform(scoreHeader);
        scoreHeader.on('click tap', (e) => { this.handleNodeSelection(scoreHeader, e.evt.shiftKey) });
        scoreHeader.on('dblclick dbltap', (e) => { this.handleNodeSelection(scoreHeader, e.evt.shiftKey); this.startEditingText(scoreHeader); });
        scoreHeader.on('mousedown touchstart', (e) => { e.cancelBubble = true; this.handleNodeSelection(scoreHeader, e.evt.shiftKey); });

        let currentY = 50;
        const rowFontSize = opts.fontSize ? Number(opts.fontSize) : 14;
        const rowFontFamily = localeFontFamily;
        const rowFill = opts.fill || '#64748b';
        const rowFontStyle = opts.fontStyle || 'normal';

        competencies.forEach((comp) => {
            const nameNode = new Konva.Text({
                text: comp,
                fontSize: rowFontSize,
                ...(rowFontFamily ? { fontFamily: rowFontFamily } : {}),
                fill: rowFill,
                fontStyle: rowFontStyle,
                y: currentY,
                width: 320
            });
            this.assignCreationOrder(nameNode);
            group.add(nameNode);
            setupTextNodeTransform(nameNode);
            nameNode.on('click tap', (e) => { this.handleNodeSelection(nameNode, e.evt.shiftKey) });
            nameNode.on('dblclick dbltap', (e) => { this.handleNodeSelection(nameNode, e.evt.shiftKey); this.startEditingText(nameNode); });
            nameNode.on('mousedown touchstart', (e) => { e.cancelBubble = true; this.handleNodeSelection(nameNode, e.evt.shiftKey); });

            const scoreNode = new Konva.Text({
                text: 'X.X',
                fontSize: rowFontSize,
                ...(rowFontFamily ? { fontFamily: rowFontFamily } : {}),
                fill: rowFill,
                fontStyle: rowFontStyle,
                x: 350,
                y: currentY
            });
            this.assignCreationOrder(scoreNode);
            group.add(scoreNode);
            setupTextNodeTransform(scoreNode);
            scoreNode.on('click tap', (e) => { this.handleNodeSelection(scoreNode, e.evt.shiftKey) });
            scoreNode.on('dblclick dbltap', (e) => { this.handleNodeSelection(scoreNode, e.evt.shiftKey); this.startEditingText(scoreNode); });
            scoreNode.on('mousedown touchstart', (e) => { e.cancelBubble = true; this.handleNodeSelection(scoreNode, e.evt.shiftKey); });

            currentY += Math.max(30, rowFontSize * 3);
        });
        hitRect.height(currentY + 10);
        hitRect.width(420);

        this.layer.add(group);
        if (typeof opts.onCreate === 'function') opts.onCreate(group);

        group.on('click tap', (e) => {
            const tgt = e.target;
            if (tgt && tgt !== group && tgt !== hitRect) return;
            this.handleNodeSelection(group, e.evt.shiftKey)
        });
        group.on('mousedown touchstart', (e) => {
            const tgt = e.target;
            if (tgt && tgt !== group && tgt !== hitRect) return;
            this.handleNodeSelection(group, e.evt.shiftKey)
        });
        group.on('dragend', () => {
            this.layer.draw();
            this.saveHistory();
        });
        group.on('transformend', () => {
            try {
                const sx = group.scaleX();
                const sy = group.scaleY();
                if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) {
                    this.layer.draw();
                    this.saveHistory();
                    try { this.emitSelectionChange() } catch (e) { }
                    return;
                }
                const texts = group.find('Text') || [];
                texts.forEach((t) => {
                    try {
                        if (typeof t.fontSize === 'function' && typeof t.fontSize() === 'number') t.fontSize(Math.max(1, Math.round(t.fontSize() * (sy * (this.fontScaleMultiplier || 1)))))
                        if (typeof t.width === 'function' && typeof t.width() === 'number') {
                            try { t.width(Math.max(1, Math.round(t.width() * sx))) } catch (e) { }
                        }
                        if (typeof t.x === 'function') t.x(t.x() * sx)
                        if (typeof t.y === 'function') t.y(t.y() * sy)
                        try { if (typeof t.scaleX === 'function') t.scaleX(1) } catch (e) { }
                        try { if (typeof t.scaleY === 'function') t.scaleY(1) } catch (e) { }
                    } catch (err) { }
                })

                try {
                    const fontSizes = texts.map(t => (typeof t.fontSize === 'function' ? t.fontSize() : null)).filter(Boolean)
                    if (fontSizes.length) {
                        const rep = Math.round(fontSizes[0])
                        group.setAttr('fontSize', rep)
                    }
                } catch (e) { }

                const hitRect = group.findOne('Rect')
                if (hitRect) {
                    try {
                        const rect = group.getClientRect({ skipTransform: true })
                        hitRect.width(Math.max(1, rect.width))
                        hitRect.height(Math.max(1, rect.height))
                        try { group.setAttr('width', Math.round(rect.width)) } catch (e) { }
                    } catch (err) { }
                }

                try { group.scaleX(1); group.scaleY(1); } catch (e) { }

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
                console.warn('competency transformend error', err)
                this.layer.draw();
                this.saveHistory();
            }
        });
        this.layer.draw();
        this.saveHistory();
        resolve(group);
    });
}
