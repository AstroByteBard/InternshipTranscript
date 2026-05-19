import Konva from 'konva'

export default {
    computeNodeRect(node) {
        try {
            const r = node.getClientRect({ skipTransform: false })
            return {
                left: r.x,
                top: r.y,
                right: r.x + r.width,
                bottom: r.y + r.height,
                centerX: r.x + r.width / 2,
                centerY: r.y + r.height / 2,
                width: r.width,
                height: r.height,
            }
        } catch (err) {
            return null
        }
    },

    showAlignmentGuides(target) {
        if (!this.guideLayer || !this.layer || !this.stage) return
        // Clear previous
        this.guideLayer.destroyChildren()

        const threshold = Number(this.snapThreshold || 6) // pixels tolerance to show guides
        const t = this.computeNodeRect(target)
        if (!t) return

        const stageW = this.stage.width()
        const stageH = this.stage.height()

        // collect other items
        const candidates = []
        this.layer.getChildren().forEach((child) => {
            if (!child || child === target) return
            if (child === this.transformer || (typeof child.getClassName === 'function' && child.getClassName() === 'Transformer')) return
            const name = child.getAttr && child.getAttr('name')
            if (name === 'background-rect') return
            const r = this.computeNodeRect(child)
            if (r) candidates.push(r)
        })

        // track best snap deltas
        let bestV = { abs: Infinity, delta: 0, x: null }
        let bestH = { abs: Infinity, delta: 0, y: null }

        // For each candidate, compare edges/centers and draw guide lines when within threshold
        candidates.forEach((c) => {
            // vertical checks: left, centerX, right
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

            // horizontal checks: top, centerY, bottom
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
        })

        // Snap target position if enabled and a best alignment found
        if (this.snapToGuides) {
            try {
                let moved = false
                if (bestV.abs < Infinity && Math.abs(bestV.abs) <= threshold) {
                    // shift in X by delta
                    const newX = (typeof target.x === 'function') ? (target.x() + bestV.delta) : null
                    if (newX !== null) { target.x(newX); moved = true }
                }
                if (bestH.abs < Infinity && Math.abs(bestH.abs) <= threshold) {
                    const newY = (typeof target.y === 'function') ? (target.y() + bestH.delta) : null
                    if (newY !== null) { target.y(newY); moved = true }
                }
                if (moved) {
                    // Recompute target rect and draw guide lines at snapped positions
                    const t2 = this.computeNodeRect(target)
                    if (t2) {
                        // draw center/edge lines for snapped position to give stronger feedback
                        if (bestV.x !== null) this.drawVerticalGuideLine(bestV.x, stageH)
                        if (bestH.y !== null) this.drawHorizontalGuideLine(bestH.y, stageW)
                    }
                }
            } catch (err) {
                // ignore snapping errors
            }
        }

        this.guideLayer.batchDraw()
    },

    clearAlignmentGuides() {
        if (!this.guideLayer) return
        this.guideLayer.destroyChildren()
        this.guideLayer.batchDraw()
    },

    drawVerticalGuideLine(x, stageH) {
        const line = new Konva.Line({
            points: [x, 0, x, stageH],
            stroke: '#ef4444',
            strokeWidth: 1,
            dash: [6, 4],
            listening: false,
            opacity: 0.95,
        })
        this.guideLayer.add(line)
    },

    drawHorizontalGuideLine(y, stageW) {
        const line = new Konva.Line({
            points: [0, y, stageW, y],
            stroke: '#ef4444',
            strokeWidth: 1,
            dash: [6, 4],
            listening: false,
            opacity: 0.95,
        })
        this.guideLayer.add(line)
    }
}
