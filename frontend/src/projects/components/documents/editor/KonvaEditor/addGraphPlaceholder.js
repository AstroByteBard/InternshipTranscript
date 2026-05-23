import Konva from 'konva'

export default function addGraphPlaceholder(graphType, opts = {}) {
    return new Promise((resolve) => {
        const RADAR_LABEL_OUTER_MARGIN = 40
        const GRAPH_HEADER_TOP_Y = 0
        const baseFontSize = Number(opts.fontSize) || 14
        const fontFamily = opts.fontFamily || 'Inter, Arial'
        const fill = opts.fill || '#1e293b'
        const fontStyle = opts.fontStyle || 'normal'
        const textDecoration = opts.textDecoration || ''

        const makeText = (text, extra = {}) => new Konva.Text({
            text: text ?? '',
            fontFamily,
            fill,
            fontSize: baseFontSize,
            fontStyle,
            textDecoration,
            listening: true,
            draggable: false,
            ...extra
        })

        const makeEditableText = (text, extra = {}, selectionTarget = null) => {
            const node = makeText(text, extra)
            const resolveSelectionTarget = (evt) => {
                if (!selectionTarget) return node
                const additive = !!(evt && (evt.shiftKey || evt.ctrlKey || evt.metaKey))
                // Normal click selects the text itself; additive click selects the parent group.
                return additive ? selectionTarget : node
            }
            node.on('click tap', (e) => {
                e.cancelBubble = true
                this.handleNodeSelection(resolveSelectionTarget(e.evt), e.evt)
            })
            node.on('dblclick dbltap', (e) => {
                e.cancelBubble = true
                // Keep text node selected for editing UX.
                this.handleNodeSelection(node, e.evt)
                // Always start editing the text node on double-click
                // even if selection was routed to a parent `selectionTarget`.
                try { this.startEditingText(node) } catch (err) { /* ignore */ }
            })
            node.on('mousedown touchstart', (e) => {
                e.cancelBubble = true
                this.handleNodeSelection(resolveSelectionTarget(e.evt), e.evt)
            })
            this.assignCreationOrder(node)
            return node
        }

        const isRadar = String(graphType).includes('Radar');
        const isGeneral = String(graphType).includes('General');
        const graphKind = isRadar ? 'radar' : 'bar';
        const graphScope = isGeneral ? 'general' : 'specific';
        const title = isGeneral ? 'General Competencies' : 'Specific Competencies';

        const group = new Konva.Group({
            x: Number(opts.x ?? 0),
            y: Number(opts.y ?? 0),
            width: Number(opts.width ?? 600),
            height: Number(opts.height ?? 450),
            draggable: true,
            name: 'graph-placeholder',
            graphType,
            graphKind,
            graphScope,
            elementType: 'graph',
            templateKey: graphType,
            fontFamily,
            fontSize: baseFontSize,
            fill,
            fontStyle,
            textDecoration
        })

        // Background card rect
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: group.width(),
            height: group.height(),
            fill: '#ffffff',
            name: 'graph-bg',
            listening: true
        })
        group.add(bg)

        // Select parent group on click of bg or lines
        group.on('click tap', (e) => {
            if (e.target.getClassName() !== 'Text') {
                this.handleNodeSelection(group, e.evt)
            }
        })
        group.on('mousedown touchstart', (e) => {
            if (e.target.getClassName() !== 'Text') {
                this.handleNodeSelection(group, e.evt)
            }
        })

        if (isRadar) {
            const width = group.width()
            const height = group.height()
            const layoutScale = Math.max(0.55, Math.min(1.25, Math.min(width / 600, height / 450)))

            let legendY = Math.round(50 * layoutScale)
            let showDocName = false
            if (isGeneral && this.generalCompetencyDocName) {
                const nameNorm = String(this.generalCompetencyDocName).trim().toLowerCase()
                if (nameNorm && nameNorm !== 'soft skills' && nameNorm !== 'soft skill') {
                    showDocName = true
                }
            }

            group.add(makeEditableText(title, { x: Math.round(50 * layoutScale), y: GRAPH_HEADER_TOP_Y, fontSize: Math.max(20, Math.round(baseFontSize * 1.5 * layoutScale)), fontStyle: 'bold' }, group))
            if (showDocName) {
                group.add(makeEditableText(this.generalCompetencyDocName, { x: Math.round(50 * layoutScale), y: Math.round(30 * layoutScale), fontSize: Math.max(12, Math.round(baseFontSize * 1.1 * layoutScale)) }, group))
                legendY = Math.round(70 * layoutScale)
            }

            const centerX = width / 2
            const centerY = Math.round(height * 0.72)
            const radius = Math.max(40, Math.min(width, height) * 0.34 * layoutScale)

            const legendYouX = Math.round(centerX - radius * 0.55)
            const legendAvgX = Math.round(centerX + radius * 0.15)
            const legendFontSize = Math.max(10, Math.round(baseFontSize * 0.95 * layoutScale))

            // Legend You
            group.add(new Konva.Circle({ x: legendYouX, y: legendY, radius: 5, fill: '#7c3aed', listening: false }))
            group.add(makeEditableText('You', { x: legendYouX + 12, y: legendY - 7, fontSize: legendFontSize }, group))

            // Legend Average
            group.add(new Konva.Circle({ x: legendAvgX, y: legendY, radius: 5, fill: '#fb7185', listening: false }))
            group.add(makeEditableText('Average', { x: legendAvgX + 12, y: legendY - 7, fontSize: legendFontSize }, group))

            // Get labels
            let labels = isGeneral ? this.getGeneralCompetencyLabels() : this.getSpecificCompetencyPlaceholders()
            if (!Array.isArray(labels) || !labels.length) {
                labels = isGeneral
                    ? ['Creativity', 'Problem Solving', 'Digital Literacy', 'Learning', 'Agility', 'Communication']
                    : ['Programming', 'Frameworks', 'Database', 'Version Control', 'Architecture', 'Testing']
            }
            const sides = Math.max(3, labels.length)

            // Draw radar concentric pentagons/hexagons (levels)
            for (let r = 1; r <= 5; r++) {
                const currentR = (radius / 5) * r
                const points = []
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
                    points.push(centerX + currentR * Math.cos(angle), centerY + currentR * Math.sin(angle))
                }
                group.add(new Konva.Line({ points, closed: true, stroke: '#e2e8f0', strokeWidth: 1, listening: false }))
            }

            // Draw radial spokes from center to outer vertices
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
                const x = centerX + radius * Math.cos(angle)
                const y = centerY + radius * Math.sin(angle)
                group.add(new Konva.Line({ points: [centerX, centerY, x, y], stroke: '#e2e8f0', strokeWidth: 1, listening: false }))
            }

            // Draw radial ticks (values 20, 40, 60, 80, 100) along the vertical spoke
            for (let r = 1; r <= 5; r++) {
                const val = r * 20
                const tickY = centerY - (radius / 5) * r
                group.add(makeEditableText(String(val), {
                    x: centerX - Math.max(18, Math.round(25 * layoutScale)),
                    y: tickY - 6,
                    fontSize: Math.max(9, Math.round(baseFontSize * 0.75 * layoutScale)),
                    fill: '#64748b',
                    width: 20,
                    align: 'right'
                }, group))
            }

            // Draw average & you polygons
            const samplePattern = [0.75, 0.65, 0.85, 0.72, 0.68, 0.82]
            const avgValues = labels.map((_, i) => samplePattern[i % samplePattern.length])
            const youValues = labels.map((_, i) => Math.min(1, (samplePattern[(i + 1) % samplePattern.length] || 0.75) + 0.12))

            const buildPolygonPoints = (vals) => {
                const points = []
                for (let i = 0; i < sides; i++) {
                    const v = vals[i] || 0
                    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
                    points.push(centerX + (radius * v) * Math.cos(angle), centerY + (radius * v) * Math.sin(angle))
                }
                return points
            }

            const avgPoints = buildPolygonPoints(avgValues)
            group.add(new Konva.Line({ points: avgPoints, closed: true, fill: 'rgba(251, 113, 133, 0.3)', stroke: '#fb7185', strokeWidth: 2, listening: false }))

            const youPoints = buildPolygonPoints(youValues)
            group.add(new Konva.Line({ points: youPoints, closed: true, fill: 'rgba(124, 58, 237, 0.35)', stroke: '#7c3aed', strokeWidth: 2.5, listening: false }))

            // Draw labels around the radar chart
            const maxLabelWidth = Math.max(70, Math.round(120 * layoutScale))
            const outerOffsetX = Math.max(12, Math.round(25 * layoutScale))
            const outerOffsetY = Math.max(10, Math.round(20 * layoutScale))
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
                const labelX = centerX + (radius + outerOffsetX) * Math.cos(angle)
                const labelY = centerY + (radius + outerOffsetY) * Math.sin(angle)

                const cos = Math.cos(angle);
                let align = 'center'
                if (Math.abs(cos) < 0.25) {
                    align = 'center'
                } else if (cos > 0) {
                    align = 'left'
                } else {
                    align = 'right'
                }

                const raw = String(labels[i] || '')
                const textX = align === 'center' ? labelX - maxLabelWidth / 2 : (align === 'left' ? labelX : labelX - maxLabelWidth)
                const labelFontSize = Math.max(10, Math.round(baseFontSize * 0.85 * layoutScale))
                let textY = labelY - Math.round(8 * layoutScale)

                const labelNode = makeEditableText(raw, {
                    x: textX,
                    y: textY,
                    width: maxLabelWidth,
                    align: align,
                    fontSize: labelFontSize,
                    fontStyle: 'bold',
                    wrap: 'word'
                }, group)

                // Keep label center outside polygon by a fixed margin so text does not overlap the radar shape.
                const labelHeight = Math.max(labelNode.height(), Math.round(labelFontSize * (labelNode.lineHeight() || 1)))
                const labelCenterX = textX + (maxLabelWidth / 2)
                const labelCenterY = textY + (labelHeight / 2)
                const dx = labelCenterX - centerX
                const dy = labelCenterY - centerY
                const dist = Math.sqrt(dx * dx + dy * dy)
                const minDist = radius + RADAR_LABEL_OUTER_MARGIN + Math.max(0, Math.round(labelHeight / 2))
                if (dist < minDist) {
                    const targetDist = minDist
                    const newCenterX = centerX + targetDist * Math.cos(angle)
                    const newCenterY = centerY + targetDist * Math.sin(angle)
                    const newX = align === 'center' ? newCenterX - (maxLabelWidth / 2) : (align === 'left' ? newCenterX : newCenterX - maxLabelWidth)
                    textY = newCenterY - (labelHeight / 2)
                    labelNode.x(newX)
                    labelNode.y(textY)
                }

                group.add(labelNode)
            }


        } else {
            const width = group.width()

            let labels = isGeneral ? this.getGeneralCompetencyLabels() : this.getSpecificCompetencyPlaceholders()
            if (!Array.isArray(labels) || !labels.length) {
                labels = isGeneral
                    ? ['Creativity', 'Problem Solving', 'Digital Literacy', 'Learning', 'Agility', 'Communication']
                    : ['Programming', 'Frameworks', 'Database', 'Version Control', 'Architecture', 'Testing']
            }
            const competencies = labels.map(l => ({ name: String(l || ''), desc: '' }))

            const topOffset = 70
            const rowHeight = 55
            const lastRowBottom = competencies.length
                ? topOffset + ((competencies.length - 1) * rowHeight) + 22 + 8
                : topOffset + 22 + 8
            const requiredHeight = lastRowBottom + 1

            group.height(requiredHeight)
            bg.height(requiredHeight)

            group.add(makeEditableText(title, { x: 0, y: GRAPH_HEADER_TOP_Y, fontSize: Math.max(18, Math.round(baseFontSize * 1.5)), fontStyle: 'bold' }))

            const percentages = competencies.map(() => 80)
            const percentFontSize = Math.max(11, Math.round(baseFontSize * 1.0))
            // measure percent text width dynamically to make bar fill reach close to the percent label
            const samplePercentText = '100%'
            let percentWidth = 36
            try {
                if (typeof this.measureTextWidth === 'function') {
                    percentWidth = Math.ceil(this.measureTextWidth(samplePercentText, percentFontSize, fontFamily)) + 6
                }
            } catch (e) { /* fallback to default */ }
            const barW = width
            const barH = 8

            competencies.forEach((item, idx) => {
                const startY = topOffset + idx * rowHeight

                // Competency Name
                group.add(makeEditableText(item.name, { x: 0, y: startY, fontSize: Math.max(12, Math.round(baseFontSize * 1.15)), fontStyle: 'bold' }))

                // Score text xx%
                const percent = percentages[idx] || 0
                group.add(makeEditableText(`${percent}%`, { x: width - percentWidth, y: startY, fontSize: percentFontSize, align: 'right', width: percentWidth }))

                // Description (if any)
                if (item.desc) {
                    group.add(makeEditableText(item.desc, { x: 0, y: startY + 20, fontSize: Math.max(10, Math.round(baseFontSize * 0.95)) }))
                }

                // Background Track Rect
                group.add(new Konva.Rect({ x: 0, y: startY + 22, width: barW, height: barH, fill: '#f1f5f9', cornerRadius: 4, listening: false }))

                // Colored Fill Rect
                const fillW = Math.max(4, Math.floor(barW * (percent / 100)))
                group.add(new Konva.Rect({ x: 0, y: startY + 22, width: fillW, height: barH, fill: '#dc2626', cornerRadius: 4, listening: false }))
            })
        }

        this.assignCreationOrder(group)
        this.layer.add(group)
        if (typeof opts.onCreate === 'function') opts.onCreate(group)
        this.layer.draw()
        this.saveHistory()
        resolve(group)
    })
}
