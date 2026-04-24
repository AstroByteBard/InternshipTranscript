<template>
    <div class="konva-editor-root">
        <div ref="stageContainer" class="konva-stage-container"></div>
    </div>
</template>

<script>
import Konva from 'konva'

export default {
    name: 'KonvaEditor',
    props: {
        isPreview: { type: Boolean, default: false }
    },
    data() {
        return {
            stage: null,
            layer: null,
            transformer: null,
            // inline editing (no DOM overlay)
            inlineEditMode: true,
            editingNode: null,
            caret: null,
            caretInterval: null,
            caretIndex: 0,
            creationSeq: 0,
            history: [],
            historyIndex: -1,
            isLoading: false,
            generalCompetencyLabels: [],
            generalCompetencyDocName: '',
            specificCompetencyLabels: [],
            suggestionLabels: [],
            suggestionCharCount: 200,
            // Example data from database
            exampleData: {
                studentName: 'Name',
                studentID: 'Student ID',
                school: 'School',
                program: 'Major',
                academyYear: new Date().getFullYear().toString(),
                competencies: {
                    programWithMostCompetencies: 'Major',
                    competenciesCount: 0,
                    competenciesList: []
                }
            }
        }
    },
    mounted() {
        this.createStage()
        this.fetchExampleData().then(() => this.fetchTemplateData())
        window.addEventListener('resize', this.onResize)
        window.addEventListener('keydown', this.onKeyDown)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
        window.removeEventListener('keydown', this.onKeyDown)
        if (this.stage) this.stage.destroy()
    },
    methods: {
        // measure width of given text with font settings from Konva.Text
        measureTextWidth(text, fontSize, fontFamily) {
            try {
                const canvas = this._textMeasureCanvas || (this._textMeasureCanvas = document.createElement('canvas'))
                const ctx = canvas.getContext('2d')
                ctx.font = `${fontSize}px ${fontFamily}`
                return ctx.measureText(text).width
            } catch (e) {
                return text.length * (fontSize * 0.6)
            }
        },

        // compute caret character index from a stage pointer position (for non-wrapping text)
        getCaretIndexFromPointer(konvaText, pointerPos) {
            if (!pointerPos) return konvaText.text().length
            const padding = konvaText.padding() || 0
            const localX = pointerPos.x - konvaText.x() - padding
            const localY = pointerPos.y - konvaText.y() - padding
            const lines = konvaText.text().split('\n')
            const fontSize = konvaText.fontSize() || 16
            const lineHeight = (konvaText.lineHeight() || 1.2) * fontSize
            let lineIndex = Math.max(0, Math.min(lines.length - 1, Math.floor(localY / lineHeight)))
            // clamp
            if (lineIndex < 0) lineIndex = 0
            const line = lines[lineIndex] || ''
            // find char position within line by measuring widths
            let acc = 0
            let idxInLine = line.length
            for (let i = 0; i <= line.length; i++) {
                const substr = line.slice(0, i)
                const w = this.measureTextWidth(substr, fontSize, konvaText.fontFamily())
                if (w >= localX) {
                    idxInLine = i
                    break
                }
            }
            // compute global index
            let idx = 0
            for (let i = 0; i < lineIndex; i++) idx += lines[i].length + 1
            idx += idxInLine
            return Math.max(0, Math.min(konvaText.text().length, idx))
        },

        updateCaretPosition() {
            if (!this.editingNode || !this.caret) return
            const t = this.editingNode.text()
            const padding = this.editingNode.padding() || 0
            const fontSize = this.editingNode.fontSize() || 16
            const lines = t.split('\n')
            let idx = Math.max(0, Math.min(this.caretIndex || 0, t.length))
            // determine line and pos
            let lineIdx = 0
            let acc = 0
            for (let i = 0; i < lines.length; i++) {
                const nl = lines[i].length + 1
                if (idx <= acc + lines[i].length) {
                    lineIdx = i
                    break
                }
                acc += nl
            }
            const inLineIndex = idx - acc
            const substr = (lines[lineIdx] || '').slice(0, inLineIndex)
            const textWidth = this.measureTextWidth(substr, fontSize, this.editingNode.fontFamily())
            const x = this.editingNode.x() + padding + textWidth
            const y = this.editingNode.y() + padding + lineIdx * ((this.editingNode.lineHeight() || 1.2) * fontSize)
            this.caret.x(x)
            this.caret.y(y)
            this.caret.height(fontSize)
            this.layer.batchDraw()
        },
        mmToPx(mm) {
            return Math.round(mm * (96 / 25.4))
        },
        createStage() {
            const container = this.$refs.stageContainer
            // Lock stage to A4 standard width (210mm) and height (297mm) in px at 96 PPI
            const width = 794;
            const height = 1123;

            this.stage = new Konva.Stage({
                container: container,
                width,
                height,
            })

            this.layer = new Konva.Layer()
            this.stage.add(this.layer)

            // white background rect to represent A4
            const bg = new Konva.Rect({
                x: 0,
                y: 0,
                width: width,
                height: height,
                fill: 'white',
                name: 'background-rect'
            })
            this.layer.add(bg)

            // Initial history state
            this.$nextTick(() => {
                this.saveHistory();
            });

            this.transformer = new Konva.Transformer({
                enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'],
                rotateEnabled: true,
                ignoreStroke: true,
                keepRatio: true,
                boundBoxFunc: function (oldBox, newBox) {
                    // prevent negative or too-small sizes
                    const minSize = 16
                    if (newBox.width < minSize || newBox.height < minSize) {
                        return oldBox
                    }
                    return newBox
                }
            })
            this.layer.add(this.transformer)
            this.layer.draw()

            this.stage.on('mousedown touchstart', (e) => {
                // If inline editing is active
                if (this.editingNode) {
                    if (e.target === this.editingNode) {
                        // Move caret to clicked position within the editing node
                        const pos = this.stage.getPointerPosition()
                        const idx = this.getCaretIndexFromPointer(this.editingNode, pos)
                        this.caretIndex = idx
                        this.updateCaretPosition()
                        return
                    } else {
                        // clicked outside editing node -> commit and end editing
                        this.endInlineEditing(true)
                    }
                }

                if (e.target === this.stage || e.target === bg) {
                    this.transformer.nodes([])
                    this.layer.draw()
                }
            })

            this.stage.on('dblclick dbltap', (e) => {
                // Now unselect for everything (even text/variables)
                this.transformer.nodes([])
                this.layer.draw()
            })

            // setup HTML5 drag and drop on the container
            container.addEventListener('dragover', (e) => {
                e.preventDefault() // required to allow drop
            })

            container.addEventListener('drop', (e) => {
                e.preventDefault()
                const data = e.dataTransfer.getData('application/json')
                if (!data) return
                try {
                    const parsed = JSON.parse(data)
                    if (parsed.type === 'variable') {
                        // get pointer position relative to stage
                        this.stage.setPointersPositions(e)
                        const pos = this.stage.getPointerPosition()
                        // convert absolute pointer position to stage coordinates taking scale into account
                        const scale = this.stage.scaleX()
                        const x = (pos.x - this.stage.x()) / scale
                        const y = (pos.y - this.stage.y()) / scale

                        // Use unified insertVariable logic
                        this.insertVariable(parsed.value, { left: x, top: y })
                    }
                } catch (err) {
                    console.error('Invalid drop data', err)
                }
            })
        },
        onResize() {
            if (!this.stage) return
            // Stage size is FIXED to A4 (794x1123). 
            // Scaling is handled by the parent container's CSS transform.
            this.layer.batchDraw()
        },
        applySavedAttrs(node, attrs, zIndex) {
            if (!node || !attrs) return
            const safeAttrs = { ...attrs }
            delete safeAttrs.image
            node.setAttrs(safeAttrs)
            if (typeof zIndex === 'number') {
                const bg = this.layer ? this.layer.findOne('.background-rect') : null
                const minZ = bg ? bg.zIndex() + 1 : 1
                node.zIndex(Math.max(minZ, zIndex))
            }
        },
        assignCreationOrder(node) {
            if (!node) return
            const existing = node.getAttr('createdOrder')
            if (typeof existing === 'number') return
            node.setAttr('createdOrder', this.creationSeq)
            this.creationSeq += 1
        },
        handleNodeSelection(node, shiftKey) {
            if (!this.transformer) return
            const nodes = this.transformer.nodes().slice()
            if (shiftKey) {
                const index = nodes.indexOf(node)
                if (index >= 0) {
                    nodes.splice(index, 1)
                } else {
                    nodes.push(node)
                }
                this.transformer.nodes(nodes)
            } else {
                this.transformer.nodes([node])
            }
            this.layer.batchDraw()
        },
        addImage(dataUrl, opts = {}) {
            return new Promise((resolve) => {
                const imageObj = new window.Image()
                imageObj.src = dataUrl
                imageObj.onload = () => {
                    const page = this.stage
                    const maxW = page.width()
                    const maxH = page.height()

                    // If it's a banner-like image (very wide), default to full width
                    const isBanner = imageObj.naturalWidth > imageObj.naturalHeight * 2;
                    const defaultW = opts.width ? Number(opts.width) : (isBanner ? maxW : Math.min(600, imageObj.naturalWidth, maxW))
                    const defaultH = opts.height ? Number(opts.height) : Math.floor((imageObj.naturalHeight / imageObj.naturalWidth) * defaultW)
                    const lockResize = opts.lockResize === true || (opts.lockResize !== false && isBanner);

                    const hasX = typeof opts.x !== 'undefined' || typeof opts.left !== 'undefined'
                    const hasY = typeof opts.y !== 'undefined' || typeof opts.top !== 'undefined'
                    const x = hasX ? Number(typeof opts.x !== 'undefined' ? opts.x : opts.left) : Math.max(0, Math.floor((maxW - defaultW) / 2))
                    const y = hasY ? Number(typeof opts.y !== 'undefined' ? opts.y : opts.top) : 20

                    const konvaImage = new Konva.Image({
                        image: imageObj,
                        x,
                        y,
                        width: defaultW,
                        height: defaultH,
                        draggable: true,
                        // ensure images are borderless by default
                        stroke: null,
                        strokeWidth: 0,
                        imageSmoothingEnabled: isBanner ? false : undefined,
                    })

                    this.assignCreationOrder(konvaImage)

                    konvaImage.on('click tap', (e) => {
                        this.handleNodeSelection(konvaImage, e.evt.shiftKey)
                    });

                    konvaImage.on('dragmove', () => {
                        // keep inside bounds while dragging
                        const pos = konvaImage.position()
                        const curW = konvaImage.width() * konvaImage.scaleX()
                        const curH = konvaImage.height() * konvaImage.scaleY()
                        const nx = Math.max(0, Math.min(pos.x, maxW - curW))
                        const ny = Math.max(0, Math.min(pos.y, maxH - curH))
                        if (nx !== pos.x || ny !== pos.y) konvaImage.position({ x: nx, y: ny })
                    })

                    konvaImage.on('transform', () => {
                        if (lockResize) {
                            // prevent scaling for banner images
                            konvaImage.scaleX(1);
                            konvaImage.scaleY(1);
                            return;
                        }
                        // keep transform within bounds and enforce min size
                        const minSize = 16
                        const scaleX = konvaImage.scaleX()
                        const scaleY = konvaImage.scaleY()
                        const curW = konvaImage.width() * scaleX
                        const curH = konvaImage.height() * scaleY
                        if (curW < minSize || curH < minSize) {
                            konvaImage.scaleX(Math.max(1, minSize / konvaImage.width()))
                            konvaImage.scaleY(Math.max(1, minSize / konvaImage.height()))
                        }
                        // keep within page during transform
                        const pos = konvaImage.position()
                        const nw = Math.max(0, Math.min(pos.x, maxW - curW))
                        const nh = Math.max(0, Math.min(pos.y, maxH - curH))
                        if (nw !== pos.x || nh !== pos.y) konvaImage.position({ x: nw, y: nh })
                    })

                    konvaImage.on('transformend', () => {
                        if (lockResize) {
                            konvaImage.scaleX(1);
                            konvaImage.scaleY(1);
                            this.layer.draw()
                            this.saveHistory()
                            return
                        }
                        // apply scale to width/height and reset scale
                        const scaleX = konvaImage.scaleX()
                        const scaleY = konvaImage.scaleY()
                        let newW = konvaImage.width() * scaleX
                        let newH = konvaImage.height() * scaleY
                        // clamp to page size
                        if (newW > maxW) {
                            const ratio = maxW / newW
                            newW = maxW
                            newH = Math.max(1, Math.floor(newH * ratio))
                        }
                        if (newH > maxH) {
                            const ratio = maxH / newH
                            newH = maxH
                            newW = Math.max(1, Math.floor(newW * ratio))
                        }
                        konvaImage.width(newW)
                        konvaImage.height(newH)
                        konvaImage.scaleX(1)
                        konvaImage.scaleY(1)
                        // ensure position still inside after resizing
                        const pos = konvaImage.position()
                        const nx = Math.max(0, Math.min(pos.x, maxW - konvaImage.width()))
                        const ny = Math.max(0, Math.min(pos.y, maxH - konvaImage.height()))
                        if (nx !== pos.x || ny !== pos.y) konvaImage.position({ x: nx, y: ny })
                        this.layer.draw()
                        this.saveHistory()
                    })

                    konvaImage.on('dragend', () => {
                        this.layer.draw()
                        this.saveHistory()
                    })

                    this.layer.add(konvaImage)

                    // IMPORTANT: Call onCreate AFTER adding to parent
                    if (typeof opts.onCreate === 'function') {
                        opts.onCreate(konvaImage)
                    }

                    // Add an invisible tag to identify graph variables for future replacement
                    if (opts.isGraphPlaceholder && opts.graphType) {
                        konvaImage.setAttr('name', 'graph-placeholder')
                        konvaImage.setAttr('graphType', opts.graphType)
                    }
                    if (opts.variableName) {
                        konvaImage.setAttr('variableName', opts.variableName)
                        konvaImage.setAttr('placeholder', opts.variableName)
                    }

                    if (isBanner) {
                        konvaImage.setAttr('isBanner', true)
                    }
                    if (lockResize) {
                        konvaImage.setAttr('lockResize', true)
                    }

                    this.layer.draw()
                    this.saveHistory()
                    resolve(konvaImage)
                }
            })
        },
        addGraphPlaceholder(graphType, opts = {}) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                canvas.width = 1000;
                canvas.height = 700;
                let ctx = canvas.getContext('2d');

                const isRadar = graphType.includes('Radar');
                const isGeneral = graphType.includes('General');
                const title = isGeneral ? 'General Competencies' : 'Specific Competencies';

                if (isRadar) {
                    // ensure background when radar is drawn
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // ... (keep radar chart logic)
                    ctx.fillStyle = '#1e293b';
                    ctx.font = 'bold 32px Inter, Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(title, 50, 60);

                    // Subtitle: show active softskill model name for General radar (if available)
                    // Skip drawing the generic 'Soft Skills' title to avoid duplication
                    let legendY = 110;
                    let showDocName = false;
                    if (isGeneral && this.generalCompetencyDocName) {
                        const nameNorm = String(this.generalCompetencyDocName).trim().toLowerCase();
                        if (nameNorm && nameNorm !== 'soft skills' && nameNorm !== 'soft skill') {
                            showDocName = true;
                        }
                    }
                    if (showDocName) {
                        ctx.font = '18px Inter, Arial';
                        ctx.fillStyle = '#475569';
                        ctx.fillText(this.generalCompetencyDocName, 50, 100);
                        legendY = 150;
                    }

                    // Legend
                    ctx.fillStyle = '#7c3aed';
                    ctx.beginPath();
                    ctx.arc(380, legendY, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#64748b';
                    ctx.font = '18px Inter, Arial';
                    ctx.fillText('You', 405, legendY + 6);
                    ctx.fillStyle = '#fb7185';
                    ctx.beginPath();
                    ctx.arc(520, legendY, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#64748b';
                    ctx.fillText('Average', 545, legendY + 6);

                    const centerX = canvas.width / 2;
                    let centerY = canvas.height / 2 + 50;
                    const radius = 180;

                    // Ensure there's extra space below the legend (You/Average)
                    // so the radar doesn't overlap the legend. Compute minimal
                    // centerY required and move the chart down if needed.
                    const legendTextHeight = showDocName ? 28 : 18;
                    const extraGap = 80; // pixels of extra spacing under legend (increased to avoid overlap)
                    const minCenterY = radius + legendY + legendTextHeight + extraGap;
                    if (centerY < minCenterY) {
                        centerY = minCenterY;
                    }
                    // Prefer active labels from the store/config when available
                    // For Specific radar previews, use placeholder 'XXX' entries instead of real labels
                    let labels = isGeneral ? this.getGeneralCompetencyLabels() : this.getSpecificCompetencyPlaceholders();
                    if (!Array.isArray(labels) || !labels.length) {
                        labels = isGeneral
                            ? ['Creativity', 'Problem Solving', 'Digital Literacy', 'Learning', 'Agility', 'Communication']
                            : ['Programming', 'Frameworks', 'Database', 'Version Control', 'Architecture', 'Testing'];
                    }
                    const sides = Math.max(3, labels.length);

                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 1.5;
                    for (let r = 1; r <= 5; r++) {
                        const currentR = (radius / 5) * r;
                        ctx.beginPath();
                        for (let i = 0; i < sides; i++) {
                            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                            const x = centerX + currentR * Math.cos(angle);
                            const y = centerY + currentR * Math.sin(angle);
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }

                    // Draw radial spokes and labels with wrapping and smarter alignment
                    ctx.font = 'bold 14px Inter, Arial';
                    const lineHeight = 18;
                    const maxLabelWidth = 140; // max pixel width per label line
                    const outerOffsetX = 65; // how far labels sit from the radius
                    const outerOffsetY = 45;
                    for (let i = 0; i < sides; i++) {
                        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY);
                        ctx.lineTo(x, y);
                        ctx.stroke();

                        // compute base label position (pushed out from the radius)
                        const labelX = centerX + (radius + outerOffsetX) * Math.cos(angle);
                        const labelY = centerY + (radius + outerOffsetY) * Math.sin(angle);

                        // choose text alignment based on angle (left/right/center)
                        const cos = Math.cos(angle);
                        if (Math.abs(cos) < 0.25) {
                            ctx.textAlign = 'center';
                        } else if (cos > 0) {
                            ctx.textAlign = 'left';
                        } else {
                            ctx.textAlign = 'right';
                        }

                        // wrap long labels into multiple lines (word-based, fallback to char-split)
                        const raw = String(labels[i] || '');
                        const words = raw.split(/\s+/).filter(Boolean);
                        const lines = [];
                        if (words.length === 0) {
                            lines.push('');
                        } else {
                            let cur = words[0] || '';
                            for (let w = 1; w < words.length; w++) {
                                const test = cur + ' ' + words[w];
                                if (ctx.measureText(test).width <= maxLabelWidth) {
                                    cur = test;
                                } else {
                                    lines.push(cur);
                                    cur = words[w];
                                }
                            }
                            if (cur) lines.push(cur);
                            // fallback: if single very long token (e.g., XXXXXX...), split by chars
                            if (lines.length === 1 && ctx.measureText(lines[0]).width > maxLabelWidth) {
                                const token = lines[0];
                                lines.length = 0;
                                const approxChars = Math.max(6, Math.floor(maxLabelWidth / 8));
                                for (let p = 0; p < token.length; p += approxChars) {
                                    lines.push(token.slice(p, p + approxChars));
                                }
                            }
                        }

                        // draw lines vertically centered around labelY
                        const totalH = lines.length * lineHeight;
                        let drawY = labelY - (totalH / 2) + (lineHeight / 2);
                        ctx.fillStyle = '#1e293b';
                        ctx.font = 'bold 14px Inter, Arial';
                        for (const ln of lines) {
                            ctx.fillText(ln, labelX, drawY);
                            drawY += lineHeight;
                        }
                    }

                    // create sample values that match the number of axes
                    const samplePattern = [0.75, 0.65, 0.85, 0.72, 0.68, 0.82];
                    const avgValues = labels.map((_, i) => samplePattern[i % samplePattern.length]);
                    const youValues = labels.map((_, i) => Math.min(1, (samplePattern[(i + 1) % samplePattern.length] || 0.75) + 0.12));

                    ctx.fillStyle = 'rgba(251, 113, 133, 0.35)';
                    ctx.strokeStyle = '#fb7185';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    avgValues.forEach((v, i) => {
                        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                        const x = centerX + (radius * v) * Math.cos(angle);
                        const y = centerY + (radius * v) * Math.sin(angle);
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(124, 58, 237, 0.45)';
                    ctx.strokeStyle = '#7c3aed';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    youValues.forEach((v, i) => {
                        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                        const x = centerX + (radius * v) * Math.cos(angle);
                        const y = centerY + (radius * v) * Math.sin(angle);
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                } else {
                    // Retrieve labels/placeholders from the store/config if present
                    // For General: use real labels. For Specific: use placeholder 'XXX' entries (from config placeholders).
                    const labels = isGeneral ? this.getGeneralCompetencyLabels() : this.getSpecificCompetencyPlaceholders();
                    const competencies = Array.isArray(labels) && labels.length
                        ? labels.map(l => ({ name: String(l || ''), desc: isGeneral ? '' : '' }))
                        : [
                            { name: 'Competency A', desc: isGeneral ? 'Demonstrative description.' : '' },
                            { name: 'Competency B', desc: isGeneral ? 'Demonstrative description.' : '' },
                            { name: 'Competency C', desc: isGeneral ? 'Demonstrative description.' : '' }
                        ];

                    // decide row height and required canvas height to fit all items
                    const topOffset = 140;
                    const bottomPadding = 40;
                    const rowHeight = 90; // increased row height for more vertical spacing
                    const requiredHeight = topOffset + bottomPadding + (competencies.length * rowHeight);

                    // enlarge canvas height if needed so no items are cut off
                    if (requiredHeight > canvas.height) {
                        canvas.height = requiredHeight;
                        // re-acquire context after resizing canvas
                        ctx = canvas.getContext('2d');
                    }

                    // Background (redraw after potential resize)
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Title
                    ctx.fillStyle = '#1e293b';
                    ctx.font = 'bold 36px Inter, Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(title, 50, 70);

                    // Sample percentage pattern to make the preview visually varied
                    const samplePattern = [1.0, 0.8, 0.6, 0.4, 0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4];
                    const percentages = competencies.map(() => 80);
                    // Use a fixed 80% preview for all items (General and Specific)

                    // Draw rows
                    let startY = topOffset;
                    const barW = canvas.width - 120;
                    const barH = Math.max(10, Math.min(18, Math.floor(rowHeight * 0.18)));

                    competencies.forEach((item, idx) => {
                        ctx.fillStyle = '#1e293b';
                        ctx.font = 'bold 20px Inter, Arial';
                        ctx.fillText(item.name, 60, startY);

                        ctx.fillStyle = '#475569';
                        ctx.font = '18px Inter, Arial';
                        ctx.textAlign = 'right';
                        // show placeholder text in preview (do not reveal real percentages)
                        ctx.fillText('xx%', canvas.width - 60, startY);

                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#64748b';
                        ctx.font = 'normal 14px Inter, Arial';
                        ctx.fillText(item.desc, 60, startY + 22);

                        const percent = percentages[idx] || 0;
                        const fillW = Math.max(0, Math.floor(barW * (percent / 100)));
                        ctx.fillStyle = '#f1f5f9';
                        this.drawRoundRect(ctx, 60, startY + 40, barW, barH, 6);
                        ctx.fill();
                        ctx.fillStyle = '#dc2626';
                        this.drawRoundRect(ctx, 60, startY + 40, fillW, barH, 6);
                        ctx.fill();

                        startY += rowHeight;
                    });

                    // create data URL and scale image to requested width while keeping aspect ratio
                    const dataUrl = canvas.toDataURL('image/png');
                    const imageWidth = opts.width || 600;
                    const imageHeight = opts.height || Math.max(1, Math.round((canvas.height / canvas.width) * imageWidth));

                    this.addImage(dataUrl, {
                        width: imageWidth,
                        height: imageHeight,
                        ...opts,
                        isGraphPlaceholder: true,
                        graphType: graphType
                    }).then(resolve);
                    return;
                }

                // For radar branch fallthrough: keep existing export size
                const dataUrl = canvas.toDataURL('image/png');
                this.addImage(dataUrl, {
                    width: 600,
                    height: 450,
                    ...opts,
                    isGraphPlaceholder: true,
                    graphType: graphType
                }).then(resolve);
            });
        },
        addImagePlaceholder(variableName, opts = {}) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 500;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Do not draw a stroked border for image placeholders — keep them borderless
                ctx.fillStyle = '#64748b';
                ctx.font = 'bold 28px Inter, Arial';
                ctx.textAlign = 'center';
                ctx.fillText(variableName.replace(/[{}]/g, ''), canvas.width / 2, canvas.height / 2);

                const dataUrl = canvas.toDataURL('image/png');
                this.addImage(dataUrl, {
                    width: 380,
                    height: 240,
                    ...opts,
                    variableName
                }).then(resolve);
            });
        },
        addCompetencyTable(variableName, opts = {}) {
            return new Promise((resolve) => {
                const isGeneral = variableName.includes('General');
                const title = isGeneral ? 'General Competencies' : 'Specific Competencies';

                const maxW = this.stage.width();
                const defaultW = 450;
                const hasX = typeof opts.x !== 'undefined' || typeof opts.left !== 'undefined'
                const hasY = typeof opts.y !== 'undefined' || typeof opts.top !== 'undefined'
                const x = hasX ? Number(typeof opts.x !== 'undefined' ? opts.x : opts.left) : Math.max(10, Math.floor((maxW - defaultW) / 2));
                const y = hasY ? Number(typeof opts.y !== 'undefined' ? opts.y : opts.top) : 50;

                const competencies = isGeneral
                    ? this.getGeneralCompetencyLabels()
                    : this.getSpecificCompetencyPlaceholders();

                const group = new Konva.Group({ x, y, draggable: true, name: 'competency-table', variableName });
                group.setAttrs({
                    fontSize: opts.fontSize || 14,
                    fontFamily: opts.fontFamily || 'Inter, Arial',
                    fill: opts.fill || '#64748b',
                    fontStyle: opts.fontStyle || 'normal'
                });
                this.assignCreationOrder(group);

                const hitRect = new Konva.Rect({ width: defaultW, height: 100, fill: 'rgba(0,0,0,0)', listening: true });
                group.add(hitRect);

                const titleText = new Konva.Text({ text: title, fontSize: 18, fontFamily: 'Inter, Arial', fontStyle: '600', fill: '#4b5563', y: 0 });
                group.add(titleText);

                const scoreHeader = new Konva.Text({ text: 'Score', fontSize: 18, fontFamily: 'Inter, Arial', fontStyle: '600', fill: '#4b5563', x: 350, y: 0 });
                group.add(scoreHeader);

                let currentY = 50;
                const rowFontSize = opts.fontSize ? Number(opts.fontSize) : 14;
                const rowFontFamily = opts.fontFamily || 'Inter, Arial';
                const rowFill = opts.fill || '#64748b';
                const rowFontStyle = opts.fontStyle || 'normal';

                competencies.forEach((comp) => {
                    group.add(new Konva.Text({ 
                        text: comp, 
                        fontSize: rowFontSize, 
                        fontFamily: rowFontFamily, 
                        fill: rowFill, 
                        fontStyle: rowFontStyle,
                        y: currentY,
                        width: 320
                    }));
                    group.add(new Konva.Text({ 
                        text: 'X.X', 
                        fontSize: rowFontSize, 
                        fontFamily: rowFontFamily, 
                        fill: rowFill, 
                        fontStyle: rowFontStyle,
                        x: 350, 
                        y: currentY 
                    }));
                    currentY += Math.max(30, rowFontSize * 3); // Increased spacing as requested
                });
                hitRect.height(currentY + 10);
                hitRect.width(420); // Narrower width to fit content better than 450

                this.layer.add(group);
                if (typeof opts.onCreate === 'function') opts.onCreate(group);

                group.on('click tap', (e) => {
                    this.handleNodeSelection(group, e.evt.shiftKey)
                });
                group.on('dragend', () => {
                    this.layer.draw();
                    this.saveHistory();
                });
                group.on('transformend', () => {
                    this.layer.draw();
                    this.saveHistory();
                });
                this.layer.draw();
                this.saveHistory();
                resolve(group);
            });
        },
        addSuggestionTable(opts = {}) {
            return new Promise((resolve) => {
                const maxW = this.stage.width();
                const defaultW = 650;
                const hasX = typeof opts.x !== 'undefined' || typeof opts.left !== 'undefined'
                const hasY = typeof opts.y !== 'undefined' || typeof opts.top !== 'undefined'
                const x = hasX ? Number(typeof opts.x !== 'undefined' ? opts.x : opts.left) : Math.max(10, Math.floor((maxW - defaultW) / 2));
                const y = hasY ? Number(typeof opts.y !== 'undefined' ? opts.y : opts.top) : 100;
                
                // Explicitly split into two columns: Outstanding and Opportunity
                const labels = ['Outstanding', 'Opportunity'];
                const columnGap = 30;
                const columnWidth = Math.floor((defaultW - columnGap) / 2);

                const groups = [];
                // Left Column: Outstanding
                const leftGroup = this.addSuggestionColumn({
                    ...opts,
                    labels: [labels[0]],
                    x,
                    y,
                    columnWidth
                });
                if (leftGroup) {
                    leftGroup.setAttr('variableName', '{Outstanding}');
                    groups.push(leftGroup);
                }

                // Right Column: Opportunity
                const rightGroup = this.addSuggestionColumn({
                    ...opts,
                    labels: [labels[1]],
                    x: x + columnWidth + columnGap,
                    y,
                    columnWidth
                });
                if (rightGroup) {
                    rightGroup.setAttr('variableName', '{Opportunities}');
                    groups.push(rightGroup);
                }

                if (typeof opts.onCreate === 'function') {
                    groups.forEach((node) => opts.onCreate(node));
                }

                this.layer.draw();
                this.saveHistory();
                resolve(groups[0] || null);
            });
        },
        addSuggestionColumn(opts = {}) {
            if (!this.layer || !opts.labels || !opts.labels.length) return null;
            const columnWidth = Number(opts.columnWidth) || 1000;
            const x = typeof opts.x !== 'undefined' ? Number(opts.x) : 0;
            const y = typeof opts.y !== 'undefined' ? Number(opts.y) : 0;

            const group = new Konva.Group({ x, y, draggable: true, name: 'suggestion-table-part' });
            this.assignCreationOrder(group);
            group.setAttr('labels', opts.labels);
            group.setAttr('columnWidth', columnWidth);

            const hitRect = new Konva.Rect({ width: columnWidth, height: 400, fill: 'rgba(0,0,0,0)', listening: true });
            group.add(hitRect);
            let currentY = 0;
            const baseFontSize = (opts.fontSize && !isNaN(Number(opts.fontSize))) ? Number(opts.fontSize) : 14;
            // If we have a saved fontSize, use it as is. Only use the 1.4x ratio for new insertions.
            const labelFontSize = opts.fontSize ? baseFontSize : Math.max(16, Math.floor(baseFontSize * 1.4));
            const fontFamily = opts.fontFamily || 'Inter, Arial';
            const fill = opts.fill || '#1e293b';
            const fontStyle = opts.fontStyle || 'normal';
            const textDecoration = opts.textDecoration || '';

            opts.labels.forEach((label) => {
                const labelNode = new Konva.Text({
                    text: label,
                    fontSize: labelFontSize,
                    fontFamily: fontFamily,
                    fontStyle: fontStyle.includes('bold') ? fontStyle : (fontStyle === 'normal' ? '600' : fontStyle + ' 600'),
                    fill: fill,
                    textDecoration: textDecoration,
                    y: currentY,
                    width: columnWidth
                });
                group.add(labelNode);
                currentY += (labelFontSize * 1.4);
 
                const textNode = new Konva.Text({
                    text: '',
                    fontSize: baseFontSize,
                    fontFamily: fontFamily,
                    fontStyle: fontStyle,
                    fill: fill,
                    textDecoration: textDecoration,
                    x: 10,
                    y: currentY,
                    width: columnWidth - 20,
                    lineHeight: 1.4
                });
                textNode.setAttr('placeholderType', 'suggestion');
                group.add(textNode);
                currentY += textNode.height() + (baseFontSize * 1.5);
            });
 
            hitRect.height(currentY + 10);
            hitRect.width(columnWidth);
            this.layer.add(group);

            this.updateSuggestionPlaceholderForGroup(group);

            group.on('click tap', (e) => {
                this.handleNodeSelection(group, e.evt.shiftKey)
            });
            group.on('dragend', () => {
                this.layer.draw();
                this.saveHistory();
            });
            group.on('transform', () => {
                this.updateSuggestionPlaceholderForGroup(group);
                this.layer.batchDraw();
            });
            group.on('transformend', () => {
                this.updateSuggestionPlaceholderForGroup(group);
                this.layer.draw();
                this.saveHistory();
            });

            return group;
        },
        updateSuggestionPlaceholderForGroup(group) {
            if (!group || !group.find) return;
            const fontSize = 14;
            const fontFamily = 'Inter, Arial';
            const baseWidth = Number(group.getAttr('columnWidth')) || 0;
            const scaleX = typeof group.scaleX === 'function' ? group.scaleX() : 1;
            const effectiveWidth = Math.max(20, (baseWidth * (scaleX || 1)) - 20);
            const charWidth = Math.max(1, this.measureTextWidth('X', fontSize, fontFamily));
            const lineLength = Math.max(1, Math.floor(effectiveWidth / charWidth));
            const placeholderText = this.buildSuggestionPlaceholder(this.suggestionCharCount, lineLength);
            const localWidth = Math.max(1, baseWidth - 20);

            group.find(node => node.getAttr && node.getAttr('placeholderType') === 'suggestion')
                .forEach((node) => {
                    node.text(placeholderText);
                    node.width(localWidth);
                });
        },
        drawRoundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        },
        onKeyDown(e) {
            // If we're inline-editing a Konva.Text, interpret keys as text input
            if (this.editingNode) {
                const key = e.key
                const txt = this.editingNode.text()
                // printable character
                if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    const before = txt.slice(0, this.caretIndex)
                    const after = txt.slice(this.caretIndex)
                    this.editingNode.text(before + key + after)
                    this.caretIndex = Math.min(txt.length + 1, this.caretIndex + 1)
                } else if (key === 'Backspace') {
                    if (this.caretIndex > 0) {
                        const before = txt.slice(0, this.caretIndex - 1)
                        const after = txt.slice(this.caretIndex)
                        this.editingNode.text(before + after)
                        this.caretIndex = Math.max(0, this.caretIndex - 1)
                    }
                } else if (key === 'Delete') {
                    if (this.caretIndex < txt.length) {
                        const before = txt.slice(0, this.caretIndex)
                        const after = txt.slice(this.caretIndex + 1)
                        this.editingNode.text(before + after)
                    }
                } else if (key === 'ArrowLeft') {
                    this.caretIndex = Math.max(0, this.caretIndex - 1)
                } else if (key === 'ArrowRight') {
                    this.caretIndex = Math.min(txt.length, this.caretIndex + 1)
                } else if (key === 'Enter') {
                    const before = txt.slice(0, this.caretIndex)
                    const after = txt.slice(this.caretIndex)
                    this.editingNode.text(before + '\n' + after)
                    this.caretIndex += 1
                } else if (key === 'Escape') {
                    this.endInlineEditing(true)
                }

                // reposition caret according to caretIndex
                this.updateCaretPosition()
                this.layer.batchDraw()
                e.preventDefault()
                return
            }

            // Ignore key events that originate from form inputs or editable elements
            const tgt = e.target || {}
            const tag = tgt.tagName ? String(tgt.tagName).toLowerCase() : null
            if (tag === 'input' || tag === 'textarea' || tgt.isContentEditable) return

            const nodes = this.transformer.nodes() || []

            // Layer shortcuts
            if (nodes.length > 0) {
                if (e.key === ']' && e.ctrlKey && e.altKey) {
                    e.preventDefault()
                    this.bringToFront()
                    return
                } else if (e.key === ']' && e.ctrlKey) {
                    e.preventDefault()
                    this.bringForward()
                    return
                } else if (e.key === '[' && e.ctrlKey && e.altKey) {
                    e.preventDefault()
                    this.sendToBack()
                    return
                } else if (e.key === '[' && e.ctrlKey) {
                    e.preventDefault()
                    this.sendBackward()
                    return
                }
            }

            // Delete or Backspace should remove selected nodes
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const nodes = this.transformer.nodes() || []
                if (nodes.length > 0) {
                    // prevent browser navigation on Backspace
                    e.preventDefault()
                    nodes.forEach(n => {
                        try { n.destroy() } catch (err) { /* ignore */ }
                    })
                    this.transformer.nodes([])
                    this.layer.draw()
                }
            }
        },
        addStyledTextBlock(type) {
            let text = 'Text Block'
            let fontSize = 16
            let fontWeight = 'normal'

            if (type === 'h1') {
                text = 'Heading 1'
                fontSize = 32
                fontWeight = 'bold'
            } else if (type === 'h2') {
                text = 'Heading 2'
                fontSize = 24
                fontWeight = 'bold'
            } else if (type === 'h3') {
                text = 'Heading 3'
                fontSize = 18
                fontWeight = 'bold'
            } else if (type === 'paragraph') {
                text = 'Paragraph'
                fontSize = 16
                fontWeight = 'normal'
            }

            return this.addTextBlock(text, { fontSize, fontWeight }).then((node) => {
                try { this.startInlineEditing(node) } catch (e) { /* ignore */ }
                return node
            })
        },
        addTextBlock(text = 'Add Text', opts = {}) {
            return new Promise((resolve) => {
                const maxW = this.stage.width()
                const maxH = this.stage.height()
                const defaultFontSize = opts.fontSize ? Number(opts.fontSize) : 20

                // If width is not provided, let Konva auto-size it to match text length
                const initialW = opts.width ? Number(opts.width) : undefined

                const x = typeof opts.left !== 'undefined' ? Number(opts.left) : (initialW ? Math.max(10, Math.floor((maxW - initialW) / 2)) : 50)
                const y = typeof opts.top !== 'undefined' ? Number(opts.top) : 30

                const konvaText = new Konva.Text({
                    x, y, text,
                    fontSize: defaultFontSize,
                    fontFamily: 'Inter, Arial',
                    fill: '#1e293b',
                    fontStyle: opts.fontWeight || 'normal',
                    draggable: true,
                    width: initialW,
                    wrap: initialW ? 'word' : 'none',
                    padding: 5,
                    lineHeight: 1.2,
                    align: 'left'
                });

                this.assignCreationOrder(konvaText)
                this.layer.add(konvaText)
                this.transformer.moveToTop()

                konvaText.on('click tap', (e) => {
                    this.handleNodeSelection(konvaText, e.evt.shiftKey)
                })
                // konvaText.on('dblclick dbltap', () => this.startEditingText(konvaText));
                konvaText.on('dragmove', () => {
                    const pos = konvaText.position();
                    const curW = konvaText.width() * konvaText.scaleX();
                    const curH = konvaText.height() * konvaText.scaleY();
                    const nx = Math.max(0, Math.min(pos.x, maxW - curW));
                    const ny = Math.max(0, Math.min(pos.y, maxH - curH));
                    if (nx !== pos.x || ny !== pos.y) konvaText.position({ x: nx, y: ny });
                });
                konvaText.on('transform', () => {
                    const minSize = 8;
                    const scaleX = konvaText.scaleX();
                    const scaleY = konvaText.scaleY();
                    const curW = konvaText.width() * scaleX;
                    const curH = konvaText.height() * scaleY;
                    if (curW < minSize || curH < minSize) {
                        konvaText.scaleX(Math.max(1, minSize / konvaText.width()));
                        konvaText.scaleY(Math.max(1, minSize / konvaText.height()));
                    }
                    const pos = konvaText.position();
                    const nx = Math.max(0, Math.min(pos.x, maxW - curW));
                    const ny = Math.max(0, Math.min(pos.y, maxH - curH));
                    if (nx !== pos.x || ny !== pos.y) konvaText.position({ x: nx, y: ny });
                });
                konvaText.on('transformend', () => {
                    const scaleX = konvaText.scaleX();
                    const scaleY = konvaText.scaleY();
                    let newW = Math.max(1, Math.floor(konvaText.width() * scaleX));
                    let newFontSize = Math.max(8, Math.floor(konvaText.fontSize() * scaleY));
                    if (newW > maxW) newW = maxW;
                    konvaText.width(newW);
                    konvaText.fontSize(newFontSize);
                    konvaText.scaleX(1);
                    konvaText.scaleY(1);
                    const pos = konvaText.position();
                    const nx = Math.max(0, Math.min(pos.x, maxW - konvaText.width()));
                    const ny = Math.max(0, Math.min(pos.y, maxH - konvaText.height()));
                    if (nx !== pos.x || ny !== pos.y) konvaText.position({ x: nx, y: ny });
                    this.layer.draw();
                    this.saveHistory();
                });
                konvaText.on('dragend', () => {
                    this.layer.draw();
                    this.saveHistory();
                });
                konvaText.on('mousedown', (e) => {
                    if (this.editingNode === konvaText) {
                        const pos = this.stage.getPointerPosition();
                        const idx = this.getCaretIndexFromPointer(konvaText, pos);
                        this.caretIndex = idx;
                        this.updateCaretPosition();
                    }
                });

                if (typeof opts.onCreate === 'function') {
                    opts.onCreate(konvaText)
                }

                this.layer.draw()
                this.saveHistory()
                resolve(konvaText)
            })
        },
        startEditingText(konvaText) {
            if (this.inlineEditMode) {
                this.startInlineEditing(konvaText)
                return
            }

            const stage = this.stage
            const container = stage.container()
            const scale = stage.scaleX() || 1

            // remove any existing editor overlay to avoid stacking
            const existing = document.querySelector('.konva-textarea-editor')
            if (existing) existing.parentNode.removeChild(existing)

            // create textarea overlay
            const textarea = document.createElement('textarea')
            textarea.className = 'konva-textarea-editor'
            textarea.value = konvaText.text()

            // get absolute position of text on stage
            const textPos = konvaText.getAbsolutePosition()
            const stageBox = container.getBoundingClientRect()

            textarea.style.position = 'absolute'
            textarea.style.top = `${stageBox.top + textPos.y * scale}px`
            textarea.style.left = `${stageBox.left + textPos.x * scale}px`
            textarea.style.width = `${konvaText.width() * scale}px`
            textarea.style.height = `${konvaText.height() * scale}px`
            textarea.style.fontSize = `${konvaText.fontSize() * scale}px`
            textarea.style.fontFamily = konvaText.fontFamily() || 'sans-serif'
            textarea.style.color = konvaText.fill() || '#000'
            textarea.style.padding = '0'
            textarea.style.margin = '0'
            textarea.style.border = 'none'
            textarea.style.background = 'transparent'
            textarea.style.outline = 'none'
            textarea.style.zIndex = 1000
            textarea.style.resize = 'none'
            textarea.style.lineHeight = `${konvaText.lineHeight || 1.2}`
            textarea.style.whiteSpace = 'pre-wrap'
            textarea.style.overflow = 'hidden'

            document.body.appendChild(textarea)
            textarea.focus()
            // auto-size height to content
            const adjustHeight = () => {
                textarea.style.height = 'auto'
                textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`
            }
            adjustHeight()
            textarea.addEventListener('input', adjustHeight)

            const removeTextarea = (apply) => {
                if (apply) {
                    const newText = textarea.value
                    konvaText.text(newText)
                    // keep width as textarea width scaled back to stage coords
                    const newW = parseFloat(textarea.style.width) / scale
                    konvaText.width(Math.max(1, Math.floor(newW)))
                    // adjust font size back to stage coords
                    const newFontSize = parseFloat(textarea.style.fontSize) / scale
                    konvaText.fontSize(Math.max(8, Math.floor(newFontSize)))
                }
                textarea.parentNode && textarea.parentNode.removeChild(textarea)
                this.layer.draw()
                window.removeEventListener('scroll', onScroll)
            }

            const onKeydown = (e) => {
                if (e.key === 'Escape') {
                    removeTextarea(false)
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    // commit on Ctrl+Enter / Cmd+Enter
                    removeTextarea(true)
                }
            }

            const onScroll = () => {
                removeTextarea(true)
            }

            textarea.addEventListener('keydown', onKeydown)
            textarea.addEventListener('blur', () => removeTextarea(true))
            window.addEventListener('scroll', onScroll)
        },

        startInlineEditing(konvaText) {
            if (this.editingNode) this.endInlineEditing(true)
            this.editingNode = konvaText
            // create caret as a thin rect/line
            const fontSize = konvaText.fontSize() || 16
            const caret = new Konva.Rect({
                x: konvaText.x() + konvaText.width(),
                y: konvaText.y(),
                width: 1,
                height: fontSize,
                fill: 'black',
                listening: false,
            })
            this.caret = caret
            this.layer.add(caret)

            const blink = () => {
                if (!this.caret) return
                this.caret.visible(!this.caret.visible())
                this.layer.batchDraw()
            }
            this.caretInterval = setInterval(blink, 480)
            this.caret.visible(true)
            // position caret at end by default
            this.caretIndex = konvaText.text().length
            this.updateCaretPosition()
            this.layer.draw()
        },

        endInlineEditing(commit = true) {
            if (!this.editingNode) return
            if (this.caret) {
                try { this.caret.destroy() } catch (e) { }
                this.caret = null
            }
            if (this.caretInterval) {
                clearInterval(this.caretInterval)
                this.caretInterval = null
            }
            this.editingNode = null
            this.layer.draw()
        },
        clear() {
            if (!this.layer) return
            this.layer.destroyChildren()
            this.createStage()
        },
        bringForward() {
            const nodes = this.transformer.nodes()
            if (nodes.length) {
                nodes.forEach(n => n.moveUp())
                this.transformer.moveToTop()
                this.layer.draw()
                this.saveHistory()
            }
        },
        bringToFront() {
            const nodes = this.transformer.nodes()
            if (nodes.length) {
                nodes.forEach(n => n.moveToTop())
                this.transformer.moveToTop()
                this.layer.draw()
                this.saveHistory()
            }
        },
        sendBackward() {
            const nodes = this.transformer.nodes()
            const bg = this.layer.children[0] // A4 white background 
            if (nodes.length) {
                nodes.forEach(n => {
                    n.moveDown()
                    // prevent moving below bg
                    if (n.zIndex() <= bg.zIndex()) {
                        n.zIndex(bg.zIndex() + 1)
                    }
                })
                this.layer.draw()
                this.saveHistory()
            }
        },
        sendToBack() {
            const nodes = this.transformer.nodes()
            const bg = this.layer.children[0]
            if (nodes.length) {
                nodes.forEach(n => {
                    n.zIndex(bg.zIndex() + 1)
                })
                this.layer.draw()
                this.saveHistory()
            }
        },
        toDataURL() {
            return this.stage.toDataURL({ pixelRatio: 2 })
        },
        formatSelectedNodes({ type, value }) {
            const nodes = this.transformer.nodes();
            if (!nodes.length) return;

            nodes.forEach(node => {
                // If it's a Text node or a Group containing Text nodes (like tables)
                // For direct text nodes:
                if (node instanceof Konva.Text) {
                    this.applyFormatToTextNode(node, type, value);
                } else if (node instanceof Konva.Group) {
                    // recursively find all text nodes inside group
                    const textNodes = node.find('Text');
                    textNodes.forEach(tn => this.applyFormatToTextNode(tn, type, value));
                }
            });
            this.layer.batchDraw();
        },
        applyFormatToTextNode(node, type, value) {
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
                if (groupName.includes('suggestion-table-part') || groupName.includes('competency-table')) {
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
                }
            }
            this.saveHistory();
        },
        saveHistory() {
            if (!this.stage || this.isLoading) return;
            const data = this.saveToJSON();
            if (!data) return;

            // Remove everything after current history index
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }

            this.history.push(JSON.stringify(data));
            if (this.history.length > 50) this.history.shift();
            this.historyIndex = this.history.length - 1;

        },
        undo() {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.loadFromJSON(JSON.parse(this.history[this.historyIndex]));
            }
        },
        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.loadFromJSON(JSON.parse(this.history[this.historyIndex]));
            }
        },
        insertVariable(variableName, opts = {}) {
            if (!variableName) return;

            if (variableName === '{GeneralCompetencies}' || variableName === '{SpecificCompetencies}') {
                return this.addCompetencyTable(variableName, opts);
            } else if (variableName === '{Suggestion}') {
                return this.addSuggestionTable(opts);
            } else if (variableName.startsWith('{Graph')) {
                return this.addGraphPlaceholder(variableName, opts);
            } else {
                // Map to localized placeholder values using data from database
                const mapping = {
                    '{StudentName}': this.exampleData.studentName || 'Name',
                    '{StudentID}': this.exampleData.studentID || 'Student ID',
                    '{School}': this.exampleData.school || 'School',
                    '{Program}': this.exampleData.program || 'Major',
                    '{AcademyYear}': 'Academic Year XXXX'
                };
                const text = mapping[variableName] || variableName;
                return this.addTextBlock(text, {
                    ...opts,
                    onCreate: (node) => {
                        node.setAttr('variableName', variableName);
                        node.setAttr('placeholder', variableName);
                        if (typeof opts.onCreate === 'function') opts.onCreate(node);
                    }
                });
            }
        },
        saveToJSON() {
            if (!this.stage) return null;
            const bg = this.layer.findOne('.background-rect');
            const elements = [];

            this.layer.children.forEach(node => {
                // Skip transformer, background, and internal nodes
                if (node === this.transformer || node === bg) return;

                const attrs = node.getAttrs();
                const el = {
                    className: node.getClassName(),
                    attrs: { ...attrs },
                    zIndex: node.zIndex()
                };
                el._orderIndex = elements.length

                // Ensure custom attributes on groups are captured (Konva.Group.getAttrs might skip non-standard ones in some versions)
                if (node instanceof Konva.Group) {
                    const gn = node.name() || '';
                    if (gn.includes('table')) {
                        ['fontSize', 'fontFamily', 'fill', 'fontStyle', 'textDecoration', 'align', 'labels', 'columnWidth', 'variableName'].forEach(attr => {
                            const val = node.getAttr(attr);
                            if (val !== undefined) el.attrs[attr] = val;
                        });
                    }
                }

                // Remove large/circular refs if any
                delete el.attrs.image;

                if (node instanceof Konva.Image) {
                    el.src = node.image().src;
                } else if (node instanceof Konva.Group) {
                    // For groups, we might want to save children if they aren't standard templates
                    // But for our app, we usually recreate them from attrs like 'name'
                    // So we just ensure name is set.
                }

                elements.push(el);
            });

            elements.sort((a, b) => {
                const aZ = typeof a.zIndex === 'number' ? a.zIndex : 0
                const bZ = typeof b.zIndex === 'number' ? b.zIndex : 0
                if (aZ !== bZ) return aZ - bZ
                const aOrder = typeof a.attrs.createdOrder === 'number' ? a.attrs.createdOrder : a._orderIndex
                const bOrder = typeof b.attrs.createdOrder === 'number' ? b.attrs.createdOrder : b._orderIndex
                return aOrder - bOrder
            })

            elements.forEach(el => { delete el._orderIndex })

            return {
                width: this.stage.width(),
                height: this.stage.height(),
                elements
            };
        },
        async loadFromJSON(data) {
            if (!data || !data.elements) return;
            this.isLoading = true;

            // Clear existing elements (except BG and Transformer)
            const bg = this.layer.findOne('.background-rect');
            this.layer.children.forEach(node => {
                if (node !== this.transformer && node !== bg) {
                    node.destroy();
                }
            });
            this.transformer.nodes([]);

            // Elements are added in order, so they get correct zIndex naturally.
            for (const el of data.elements) {
                if (el.className === 'Text') {
                    await this.addTextBlock(el.attrs.text, {
                        ...el.attrs,
                        onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                    });
                } else if (el.className === 'Image') {
                    if (el.attrs.name === 'graph-placeholder') {
                        await this.addGraphPlaceholder(el.attrs.graphType, {
                            ...el.attrs,
                            onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                        });
                    } else if (el.attrs.variableName && !el.src) {
                        await this.addImagePlaceholder(el.attrs.variableName, {
                            ...el.attrs,
                            onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                        });
                    } else {
                        await this.addImage(el.src, {
                            ...el.attrs,
                            onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                        });
                    }
                } else if (el.className === 'Group') {
                    if (el.attrs.name === 'competency-table') {
                        await this.addCompetencyTable(el.attrs.variableName || '{GeneralCompetencies}', {
                            ...el.attrs,
                            onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                        });
                    } else if (el.attrs.name === 'suggestion-table') {
                        await this.addSuggestionTable({
                            ...el.attrs,
                            onCreate: (node) => this.applySavedAttrs(node, el.attrs)
                        });
                    } else if (el.attrs.name === 'suggestion-table-part') {
                        const node = this.addSuggestionColumn({
                            ...el.attrs,
                            labels: el.attrs.labels,
                            columnWidth: el.attrs.columnWidth,
                            x: el.attrs.x,
                            y: el.attrs.y
                        });
                        if (node) {
                            this.applySavedAttrs(node, el.attrs)
                        }
                    }
                }
            }
            this.transformer.moveToTop()
            this.layer.batchDraw();
            this.isLoading = false;
        },

        async fetchTemplateData() {
            try {
                await Promise.all([
                    this.$store.dispatch('competencies/general/general'),
                    this.$store.dispatch('competencies/specific/specific'),
                    this.$store.dispatch('competencies/proposition/proposition')
                ]);

                const generalList = this.getStoreList('competencies/general/general');
                const specificList = this.getStoreList('competencies/specific/specific');
                const suggestionList = this.getStoreList('competencies/proposition/proposition');

                const activeGeneral = generalList.filter(item => item && item.active === true);
                const activeSpecific = specificList.filter(item => item && item.active === true);
                const activeSuggestions = suggestionList.filter(item => item && item.active === true);

                const generalDoc = this.pickFirst(activeGeneral);
                const suggestionDoc = this.pickFirst(activeSuggestions);
                const specificDoc = this.pickSpecificByProgram(activeSpecific, this.exampleData);

                this.generalCompetencyLabels = this.extractSoftskillLabels(generalDoc);
                // store active general softskill document's localized title for display
                this.generalCompetencyDocName = generalDoc ? this.getLocalizedValue(generalDoc.title, 'en') : '';
                this.specificCompetencyLabels = this.extractHardskillLabels(specificDoc, true);
                this.suggestionLabels = this.extractSuggestionLabels(suggestionDoc);
            } catch (err) {
                console.warn('Failed to fetch competency templates:', err);
            }
        },
        getStoreList(getterKey) {
            const list = this.$store && this.$store.getters
                ? this.$store.getters[getterKey]
                : null;
            return Array.isArray(list) ? list : [];
        },
        pickFirst(list) {
            return Array.isArray(list) && list.length ? list[0] : null;
        },
        pickSpecificByProgram(list, exampleData) {
            if (!Array.isArray(list) || !list.length) return null;

            const programName = this.normalizeText(exampleData && exampleData.program);
            if (programName) {
                const exact = list.find(item => {
                    const programTitle = this.getProgramTitleEn(item && item.program);
                    return this.normalizeText(programTitle) === programName;
                });
                if (exact) return exact;
            }

            const byProgramTitleLength = list
                .map(item => ({
                    item,
                    title: this.getProgramTitleEn(item && item.program)
                }))
                .sort((a, b) => (b.title || '').length - (a.title || '').length);

            if (byProgramTitleLength.length && byProgramTitleLength[0].item) {
                return byProgramTitleLength[0].item;
            }

            return list[0];
        },
        getProgramTitleEn(program) {
            if (!program || !Array.isArray(program.title)) return '';
            return this.getLocalizedValue(program.title, 'en');
        },
        normalizeText(value) {
            return (value || '').toString().trim().toLowerCase();
        },
        getLocalizedValue(list, key = 'en') {
            if (!Array.isArray(list)) return '';
            const found = list.find(item => item && item.key === key);
            return found && found.value ? found.value : '';
        },
        extractSoftskillLabels(doc) {
            if (!doc || !Array.isArray(doc.config)) return [];
            return doc.config
                .map(item => this.getLocalizedValue(item && item.label, 'en'))
                .filter(Boolean);
        },
        extractHardskillLabels(doc, sortByLength) {
            if (!doc || doc.active !== true || !Array.isArray(doc.config)) return [];
            const labels = doc.config
                .map(item => {
                    const label = this.getLocalizedValue(item && item.label, 'en');
                    if (label) return label;
                    return this.getLocalizedValue(item && item.question, 'en');
                })
                .filter(Boolean);
            if (!sortByLength) return labels;
            return labels.slice().sort((a, b) => b.length - a.length);
        },
        extractSuggestionLabels(doc) {
            if (!doc || !Array.isArray(doc.config)) return [];
            return doc.config
                .map(item => this.getLocalizedValue(item && item.label, 'en'))
                .filter(Boolean);
        },
        getGeneralCompetencyLabels() {
            if (this.generalCompetencyLabels && this.generalCompetencyLabels.length) {
                return this.generalCompetencyLabels;
            }
            return [
                'Creativity',
                'Analytical thinking and Problem solving',
                'Digital literacy',
                'Curiosity and life-long learning',
                'Resilience, flexibility and agility',
                'Voluntary and empathy',
                'Leadership and social influence',
                'Collaboration',
                'Cultural and civic literacy',
                'Entrepreneurial mindset',
                'Foreign language',
                'Communication'
            ];
        },
        getSpecificCompetencyLabels() {
            if (this.specificCompetencyLabels && this.specificCompetencyLabels.length) {
                return this.specificCompetencyLabels;
            }
            return [
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx'
            ];
        },
        getSpecificCompetencyPlaceholders() {
            const fromConfig = this.getSpecificCompetencyLabels();
            if (Array.isArray(fromConfig) && fromConfig.length) {
                const maxLength = fromConfig.reduce((max, label) => {
                    const length = Math.max(1, String(label || '').trim().length || 1);
                    return Math.max(max, length);
                }, 1);
                return fromConfig.map(() => 'X'.repeat(maxLength));
            }

            const list = (this.exampleData && this.exampleData.competencies && this.exampleData.competencies.competenciesList)
                ? this.exampleData.competencies.competenciesList
                : [];
            if (Array.isArray(list) && list.length) {
                const maxLength = list.reduce((max, item) => {
                    const name = item && item.name ? String(item.name) : '';
                    const length = Math.max(1, name.trim().length || 1);
                    return Math.max(max, length);
                }, 1);
                return list.map(() => 'X'.repeat(maxLength));
            }

            const fallbackLabels = [
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxx'
            ];
            return fallbackLabels.map((label) => {
                const length = Math.max(1, String(label || '').trim().length || 1);
                return 'X'.repeat(length);
            });
        },
        getSuggestionLabels() {
            if (this.suggestionLabels && this.suggestionLabels.length) {
                return this.suggestionLabels;
            }
            return ['Outstanding', 'Opportunity'];
        },
        buildSuggestionPlaceholder(count, lineLength) {
            const total = Math.max(0, Number(count) || 0);
            const chunk = Math.max(1, Number(lineLength) || 1);
            const chars = 'X'.repeat(total);
            const lines = [];
            for (let i = 0; i < chars.length; i += chunk) {
                lines.push(chars.slice(i, i + chunk));
            }
            return lines.join('\n');
        },
        async fetchExampleData() {
            try {
                // Use axios directly for fetching example data
                const axios = (await import('axios')).default;
                const response = await axios.get('http://localhost:8081/api/v1/member/example-data');
                if (response.data && response.data.data) {
                    this.exampleData = response.data.data;
                }
            } catch (err) {
                console.warn('Failed to fetch example data from API:', err);
                // Keep default values if API fails
            }
        }
    }
}
</script>

<style scoped>
.konva-stage-container {
    width: 100%;
    height: 100%;
}

.konva-editor-root {
    width: 100%;
    height: 100%;
}
</style>
