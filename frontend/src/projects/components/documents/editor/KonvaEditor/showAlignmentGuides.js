import Konva from 'konva'

export default function showAlignmentGuides(target) {
    if (!this.guideLayer || !this.layer || !this.stage) return
    this.guideLayer.destroyChildren()

    const threshold = Number(this.snapThreshold || 6)
    const spacingThreshold = Number(this.spacingGuideThreshold || 80)
    const t = this.computeNodeRect(target)
    if (!t) return

    const stageW = this.stage.width()
    const stageH = this.stage.height()

    const candidates = []
    this.layer.getChildren().forEach((child) => {
        if (!child || child === target) return
        if (child === this.transformer || (typeof child.getClassName === 'function' && child.getClassName() === 'Transformer')) return
        const name = child.getAttr && child.getAttr('name')
        if (name === 'background-rect') return
        const r = this.computeNodeRect(child)
        if (r) candidates.push(r)
    })

    let bestV = { abs: Infinity, delta: 0, x: null }
    let bestH = { abs: Infinity, delta: 0, y: null }
    let bestSpacingX = { distance: Infinity, startX: null, endX: null, y: null }
    let bestSpacingY = { distance: Infinity, startY: null, endY: null, x: null }

    candidates.forEach((c) => {
        const overlapY = Math.min(t.bottom, c.bottom) - Math.max(t.top, c.top)
        const overlapX = Math.min(t.right, c.right) - Math.max(t.left, c.left)

        const dLeft = Math.abs(t.left - c.left)
        if (dLeft <= threshold) {
            this.drawVerticalGuideLine(c.left, stageH)
            if (dLeft < bestV.abs) { bestV = { abs: dLeft, delta: c.left - t.left, x: c.left } }
        }
        const dCenter = Math.abs(t.centerX - c.centerX)
        if (dCenter <= threshold) {
            this.drawVerticalGuideLine(c.centerX, stageH)
            if (dCenter < bestV.abs) { bestV = { abs: dCenter, delta: c.centerX - t.centerX, x: c.centerX } }
        }
        const dRight = Math.abs(t.right - c.right)
        if (dRight <= threshold) {
            this.drawVerticalGuideLine(c.right, stageH)
            if (dRight < bestV.abs) { bestV = { abs: dRight, delta: c.right - t.right, x: c.right } }
        }

        const dTop = Math.abs(t.top - c.top)
        if (dTop <= threshold) {
            this.drawHorizontalGuideLine(c.top, stageW)
            if (dTop < bestH.abs) { bestH = { abs: dTop, delta: c.top - t.top, y: c.top } }
        }
        const dCenterY = Math.abs(t.centerY - c.centerY)
        if (dCenterY <= threshold) {
            this.drawHorizontalGuideLine(c.centerY, stageW)
            if (dCenterY < bestH.abs) { bestH = { abs: dCenterY, delta: c.centerY - t.centerY, y: c.centerY } }
        }
        const dBottom = Math.abs(t.bottom - c.bottom)
        if (dBottom <= threshold) {
            this.drawHorizontalGuideLine(c.bottom, stageW)
            if (dBottom < bestH.abs) { bestH = { abs: dBottom, delta: c.bottom - t.bottom, y: c.bottom } }
        }

        if (overlapY > 0) {
            const centerY = Math.max(t.top, c.top) + (overlapY / 2)
            if (t.right <= c.left) {
                const distance = c.left - t.right
                if (distance <= spacingThreshold && distance < bestSpacingX.distance) {
                    bestSpacingX = { distance, startX: t.right, endX: c.left, y: centerY }
                }
            } else if (c.right <= t.left) {
                const distance = t.left - c.right
                if (distance <= spacingThreshold && distance < bestSpacingX.distance) {
                    bestSpacingX = { distance, startX: c.right, endX: t.left, y: centerY }
                }
            }
        }

        if (overlapX > 0) {
            const centerX = Math.max(t.left, c.left) + (overlapX / 2)
            if (t.bottom <= c.top) {
                const distance = c.top - t.bottom
                if (distance <= spacingThreshold && distance < bestSpacingY.distance) {
                    bestSpacingY = { distance, startY: t.bottom, endY: c.top, x: centerX }
                }
            } else if (c.bottom <= t.top) {
                const distance = t.top - c.bottom
                if (distance <= spacingThreshold && distance < bestSpacingY.distance) {
                    bestSpacingY = { distance, startY: c.bottom, endY: t.top, x: centerX }
                }
            }
        }
    })

    if (bestSpacingX.distance < Infinity) {
        drawSpacingHorizontalGuide.call(this, bestSpacingX.startX, bestSpacingX.endX, bestSpacingX.y, bestSpacingX.distance, stageW)
    }
    if (bestSpacingY.distance < Infinity) {
        drawSpacingVerticalGuide.call(this, bestSpacingY.startY, bestSpacingY.endY, bestSpacingY.x, bestSpacingY.distance, stageH)
    }

    if (this.snapToGuides) {
        try {
            let moved = false
            if (bestV.abs < Infinity && Math.abs(bestV.abs) <= threshold) {
                const newX = (typeof target.x === 'function') ? (target.x() + bestV.delta) : null
                if (newX !== null) { target.x(newX); moved = true }
            }
            if (bestH.abs < Infinity && Math.abs(bestH.abs) <= threshold) {
                const newY = (typeof target.y === 'function') ? (target.y() + bestH.delta) : null
                if (newY !== null) { target.y(newY); moved = true }
            }
            if (moved) {
                const t2 = this.computeNodeRect(target)
                if (t2) {
                    if (bestV.x !== null) this.drawVerticalGuideLine(bestV.x, stageH)
                    if (bestH.y !== null) this.drawHorizontalGuideLine(bestH.y, stageW)
                }
            }
        } catch (err) {
            // ignore snapping errors
        }
    }

    this.guideLayer.batchDraw()
}

function makeDistanceLabel(distance, color) {
    return new Konva.Text({
        text: `${Math.round(distance)} px`,
        fontSize: 11,
        fontStyle: '600',
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#ffffff',
        padding: 4,
        listening: false,
    })
}

function makeLabelBackground(textNode, color, x, y) {
    return new Konva.Rect({
        x,
        y,
        width: textNode.width(),
        height: textNode.height(),
        fill: color,
        cornerRadius: 4,
        listening: false,
    })
}

function addLineCaps(group, orientation, start, end, color) {
    if (orientation === 'horizontal') {
        group.add(new Konva.Line({ points: [start, -6, start, 6], stroke: color, strokeWidth: 1.5, listening: false }))
        group.add(new Konva.Line({ points: [end, -6, end, 6], stroke: color, strokeWidth: 1.5, listening: false }))
    } else {
        group.add(new Konva.Line({ points: [-6, start, 6, start], stroke: color, strokeWidth: 1.5, listening: false }))
        group.add(new Konva.Line({ points: [-6, end, 6, end], stroke: color, strokeWidth: 1.5, listening: false }))
    }
}

export function drawSpacingHorizontalGuide(startX, endX, y, distance, stageW) {
    if (startX === null || endX === null || y === null) return
    const color = '#0ea5e9'
    const safeY = Math.max(8, Math.min((this.stage && typeof this.stage.height === 'function' ? this.stage.height() - 8 : y), y))
    const group = new Konva.Group({ listening: false })

    group.add(new Konva.Line({
        points: [startX, safeY, endX, safeY],
        stroke: color,
        strokeWidth: 1.5,
        dash: [4, 4],
        listening: false,
        opacity: 0.95,
    }))

    group.add(new Konva.Line({ points: [startX, safeY - 6, startX, safeY + 6], stroke: color, strokeWidth: 1.5, listening: false }))
    group.add(new Konva.Line({ points: [endX, safeY - 6, endX, safeY + 6], stroke: color, strokeWidth: 1.5, listening: false }))

    const label = makeDistanceLabel(distance, color)
    const labelX = Math.max(8, Math.min(stageW - 8 - label.width(), (startX + endX - label.width()) / 2))
    const labelY = Math.max(8, safeY - label.height() - 8)
    const labelBg = makeLabelBackground(label, color, labelX, labelY)
    label.position({ x: labelX, y: labelY })

    group.add(labelBg)
    group.add(label)
    this.guideLayer.add(group)
}

export function drawSpacingVerticalGuide(startY, endY, x, distance, stageH) {
    if (startY === null || endY === null || x === null) return
    const color = '#0ea5e9'
    const safeX = Math.max(8, Math.min((this.stage && typeof this.stage.width === 'function' ? this.stage.width() - 8 : x), x))
    const group = new Konva.Group({ listening: false })

    group.add(new Konva.Line({
        points: [safeX, startY, safeX, endY],
        stroke: color,
        strokeWidth: 1.5,
        dash: [4, 4],
        listening: false,
        opacity: 0.95,
    }))

    group.add(new Konva.Line({ points: [safeX - 6, startY, safeX + 6, startY], stroke: color, strokeWidth: 1.5, listening: false }))
    group.add(new Konva.Line({ points: [safeX - 6, endY, safeX + 6, endY], stroke: color, strokeWidth: 1.5, listening: false }))

    const label = makeDistanceLabel(distance, color)
    const labelX = Math.max(8, safeX + 10)
    const labelY = Math.max(8, Math.min(stageH - 8 - label.height(), (startY + endY - label.height()) / 2))
    const labelBg = makeLabelBackground(label, color, labelX, labelY)
    label.position({ x: labelX, y: labelY })

    group.add(labelBg)
    group.add(label)
    this.guideLayer.add(group)
}

export { makeDistanceLabel, makeLabelBackground, addLineCaps }
