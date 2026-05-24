import Konva from 'konva'

const LINKED_DATA_VARIABLES = new Set(['{StudentName}', '{School}', '{Program}', '{StudentID}', '{AcademyYear}'])
const HOLD_DELAY_MS = 300
const MOVE_CANCEL_PX = 4
const ENDPOINT_RADIUS = 4
const ENDPOINT_STROKE_WIDTH = 1.5
const ENDPOINT_OFFSET = Math.ceil(ENDPOINT_RADIUS + ENDPOINT_STROKE_WIDTH / 2 + 2)

function getStagePointer(stage, evt) {
    if (!stage) return null
    try {
        if (evt && typeof stage.setPointersPositions === 'function') {
            stage.setPointersPositions(evt)
        }
        return stage.getPointerPosition ? stage.getPointerPosition() : null
    } catch (err) {
        return null
    }
}

function isLinkedDataVariableNode(node) {
    try {
        if (!node || typeof node.getClassName !== 'function' || node.getClassName() !== 'Text') return false
        const variableName = node.getAttr && node.getAttr('variableName')
        return LINKED_DATA_VARIABLES.has(variableName)
    } catch (err) {
        return false
    }
}

function getNodeByCreatedOrder(layer, createdOrder) {
    if (!layer || typeof layer.getChildren !== 'function') return null
    let found = null
    layer.getChildren().forEach((node) => {
        try {
            if (found || !node || typeof node.getAttr !== 'function') return
            if (node.getAttr('createdOrder') === createdOrder) found = node
        } catch (err) { /* ignore */ }
    })
    return found
}

function getRenderableChildren(layer) {
    if (!layer || typeof layer.getChildren !== 'function') return []
    const children = []
    layer.getChildren().forEach((node) => {
        try {
            if (!node) return
            const className = typeof node.getClassName === 'function' ? node.getClassName() : ''
            const name = typeof node.getAttr === 'function' ? node.getAttr('name') : ''
            if (name === 'background-rect' || name === 'data-variable-connector') return
            if (className === 'Transformer') return
            children.push(node)
        } catch (err) { /* ignore */ }
    })
    return children
}

function getNodeRect(node) {
    try {
        const rect = node.getClientRect({ skipTransform: false })
        return rect || null
    } catch (err) {
        return null
    }
}

function findConnectableTarget(stage, pointer, sourceNode) {
    if (!stage || !pointer || typeof stage.getIntersection !== 'function') return null
    let hit = null
    try {
        hit = stage.getIntersection(pointer)
    } catch (err) {
        hit = null
    }
    while (hit) {
        if (hit === sourceNode) return null
        if (typeof hit.getAttr === 'function') {
            const name = hit.getAttr('name')
            if (name !== 'data-variable-connector' && name !== 'background-rect') {
                const cls = typeof hit.getClassName === 'function' ? hit.getClassName() : ''
                if (cls !== 'Transformer' && cls !== 'Stage' && cls !== 'Layer') return hit
            }
        }
        hit = typeof hit.getParent === 'function' ? hit.getParent() : null
    }
    return null
}

function clearPreviewLine(vm) {
    if (!vm || !vm.connectorLayer) return
    const preview = vm.connectorLayer.findOne('.manual-data-variable-preview')
    if (preview) preview.destroy()
    if (typeof vm.connectorLayer.batchDraw === 'function') vm.connectorLayer.batchDraw()
}

function addEndpoint(group, x, y, fill, stroke, draggable, name) {
    const circle = new Konva.Circle({
        x,
        y,
        radius: ENDPOINT_RADIUS,
        fill,
        stroke,
        strokeWidth: ENDPOINT_STROKE_WIDTH,
        draggable,
        listening: true,
        name,
    })
    group.add(circle)
    return circle
}

function renderConnector(vm, sourceNode, targetNode, gap) {
    if (!vm || !vm.connectorLayer || !sourceNode || !targetNode) return null
    const sourceBox = getNodeRect(sourceNode)
    const targetBox = getNodeRect(targetNode)
    if (!sourceBox || !targetBox) return null

    const sourceCenterX = sourceBox.x + sourceBox.width / 2
    const sourceCenterY = sourceBox.y + sourceBox.height / 2
    const targetCenterX = targetBox.x + targetBox.width / 2
    const targetCenterY = targetBox.y + targetBox.height / 2
    const dx = targetCenterX - sourceCenterX
    const dy = targetCenterY - sourceCenterY
    const locale = String(vm && vm.templateLocale ? vm.templateLocale : 'th').toLowerCase()
    const defaultGap = locale.startsWith('en') ? 20 : 0
    const pad = Number.isFinite(gap) && gap > 0 ? gap : defaultGap
    const endpointOffset = ENDPOINT_OFFSET

    let points
    if (Math.abs(dx) >= Math.abs(dy)) {
        const horizontalDir = dx >= 0 ? 1 : -1
        const startX = horizontalDir > 0 ? (sourceBox.x + sourceBox.width + endpointOffset) : (sourceBox.x - endpointOffset)
        const endX = horizontalDir > 0 ? (targetBox.x - endpointOffset) : (targetBox.x + targetBox.width + endpointOffset)
        points = [startX, sourceCenterY, endX, targetCenterY]
    } else {
        const verticalDir = dy >= 0 ? 1 : -1
        const startY = verticalDir > 0 ? (sourceBox.y + sourceBox.height + endpointOffset) : (sourceBox.y - endpointOffset)
        const endY = verticalDir > 0 ? (targetBox.y - endpointOffset) : (targetBox.y + targetBox.height + endpointOffset)
        points = [sourceCenterX, startY, targetCenterX, endY]
    }

    const group = new Konva.Group({
        listening: true,
        name: 'data-variable-connector',
        connectorType: 'manual-data-variable',
        sourceOrder: Number(sourceNode.getAttr && sourceNode.getAttr('createdOrder')) || null,
        targetOrder: Number(targetNode.getAttr && targetNode.getAttr('createdOrder')) || null,
        linkedTargetGap: pad,
    })

    const line = new Konva.Line({
        points,
        stroke: '#111827',
        strokeWidth: 4,
        lineCap: 'round',
        listening: false,
    })
    const accent = new Konva.Line({
        points,
        stroke: '#000000',
        strokeWidth: 1.4,
        lineCap: 'round',
        listening: false,
    })

    const startCircle = addEndpoint(group, points[0], points[1], '#ffffff', '#1d4ed8', false, 'data-variable-connector-start')
    const endCircle = addEndpoint(group, points[2], points[3], '#1d4ed8', '#1d4ed8', true, 'data-variable-connector-end')

    let unlinkCandidate = false
    const detach = () => {
        try {
            const sourceOrder = group.getAttr('sourceOrder')
            const source = getNodeByCreatedOrder(vm.layer, sourceOrder)
            if (source) {
                source.setAttr('linkedTargetCreatedOrder', null)
                source.setAttr('linkedTargetGap', null)
                source.setAttr('linkedConnectionMode', null)
            }
        } catch (err) { /* ignore */ }
        try { group.destroy() } catch (err) { /* ignore */ }
        if (typeof vm.connectorLayer.batchDraw === 'function') vm.connectorLayer.batchDraw()
        if (typeof vm.saveHistory === 'function') vm.saveHistory()
    }

    endCircle.on('dragstart', () => {
        unlinkCandidate = true
        try { endCircle.moveToTop() } catch (err) { }
        clearPreviewLine(vm)
    })
    endCircle.on('dragmove', () => {
        const stage = vm.stage
        const pointer = stage && typeof stage.getPointerPosition === 'function' ? stage.getPointerPosition() : null
        if (!pointer) return
        clearPreviewLine(vm)
        const preview = new Konva.Line({
            points: [points[0], points[1], pointer.x, pointer.y],
            stroke: '#0ea5e9',
            strokeWidth: 1.8,
            dash: [5, 4],
            listening: false,
            name: 'manual-data-variable-preview',
        })
        vm.connectorLayer.add(preview)
        if (typeof vm.connectorLayer.batchDraw === 'function') vm.connectorLayer.batchDraw()
    })
    endCircle.on('dragend', () => {
        clearPreviewLine(vm)
        if (unlinkCandidate) {
            detach()
        }
    })

    group.add(line)
    group.add(accent)
    group.add(startCircle)
    group.add(endCircle)
    vm.connectorLayer.add(group)
    return group
}

export default function enableManualDataVariableLinking(node) {
    if (!node || !this.stage || !this.connectorLayer || !isLinkedDataVariableNode(node)) return
    if (node._manualLinkingBound) return
    node._manualLinkingBound = true

    const vm = this
    const beginGesture = (e) => {
        const evt = e && e.evt ? e.evt : null
        const startPointer = getStagePointer(vm.stage, evt)
        if (!startPointer) return

        if (vm._manualLinkGesture && vm._manualLinkGesture.timerId) {
            clearTimeout(vm._manualLinkGesture.timerId)
        }

        const gesture = {
            sourceNode: node,
            startPointer,
            armed: false,
            active: true,
            moved: false,
            dragging: false,
            timerId: null,
            prevDraggable: typeof node.draggable === 'function' ? node.draggable() : true,
        }
        vm._manualLinkGesture = gesture

        const onMove = (moveEvt) => {
            if (!vm._manualLinkGesture || vm._manualLinkGesture !== gesture) return
            const pointer = getStagePointer(vm.stage, moveEvt && moveEvt.evt ? moveEvt.evt : null)
            if (!pointer) return
            const dx = pointer.x - gesture.startPointer.x
            const dy = pointer.y - gesture.startPointer.y
            if (!gesture.armed && Math.sqrt(dx * dx + dy * dy) > MOVE_CANCEL_PX) {
                gesture.moved = true
                if (gesture.timerId) {
                    clearTimeout(gesture.timerId)
                    gesture.timerId = null
                }
                cleanup(false)
                return
            }
            if (!gesture.armed) return
            clearPreviewLine(vm)
            const preview = new Konva.Line({
                points: [gesture.startPointer.x, gesture.startPointer.y, pointer.x, pointer.y],
                stroke: '#0ea5e9',
                strokeWidth: 1.8,
                dash: [5, 4],
                listening: false,
                name: 'manual-data-variable-preview',
            })
            vm.connectorLayer.add(preview)
            if (typeof vm.connectorLayer.batchDraw === 'function') vm.connectorLayer.batchDraw()
        }

        const onUp = (upEvt) => {
            if (!vm._manualLinkGesture || vm._manualLinkGesture !== gesture) return
            if (!gesture.armed) {
                if (gesture.timerId) {
                    clearTimeout(gesture.timerId)
                    gesture.timerId = null
                }
                cleanup(false)
                return
            }
            const pointer = getStagePointer(vm.stage, upEvt && upEvt.evt ? upEvt.evt : null)
            const target = gesture.armed ? findConnectableTarget(vm.stage, pointer, gesture.sourceNode) : null
            finish(target)
        }

        const cleanup = (keepPreview = false) => {
            try { vm.stage.off('mousemove.manualLink', onMove) } catch (err) { }
            try { vm.stage.off('touchmove.manualLink', onMove) } catch (err) { }
            try { vm.stage.off('mouseup.manualLink', onUp) } catch (err) { }
            try { vm.stage.off('touchend.manualLink', onUp) } catch (err) { }
            try { node.off('dragstart.manualLinkCancel') } catch (err) { }
            if (!keepPreview) clearPreviewLine(vm)
            if (gesture.prevDraggable !== undefined && typeof node.draggable === 'function') node.draggable(gesture.prevDraggable)
            if (vm._manualLinkGesture === gesture) vm._manualLinkGesture = null
        }

        const finish = (targetNode) => {
            if (!vm._manualLinkGesture || vm._manualLinkGesture !== gesture) return
            if (gesture.timerId) {
                clearTimeout(gesture.timerId)
                gesture.timerId = null
            }
            if (targetNode) {
                const sourceOrder = gesture.sourceNode.getAttr && gesture.sourceNode.getAttr('createdOrder')
                const targetOrder = targetNode.getAttr && targetNode.getAttr('createdOrder')
                if (typeof targetOrder !== 'undefined' && targetOrder !== null) {
                    gesture.sourceNode.setAttr('linkedTargetCreatedOrder', targetOrder)
                    const locale = String(vm && vm.templateLocale ? vm.templateLocale : 'th').toLowerCase()
                    gesture.sourceNode.setAttr('linkedTargetGap', locale.startsWith('en') ? 20 : 0)
                    gesture.sourceNode.setAttr('linkedConnectionMode', 'manual')
                    gesture.sourceNode.setAttr('linkedSourceCreatedOrder', sourceOrder)
                    try { targetNode.setAttr('linkedFromCreatedOrder', sourceOrder) } catch (err) { }
                    cleanup(false)
                    if (typeof vm.renderManualDataVariableConnectors === 'function') {
                        vm.renderManualDataVariableConnectors()
                    }
                    if (typeof vm.saveHistory === 'function') vm.saveHistory()
                    return
                }
            }
            cleanup(false)
            if (typeof vm.renderManualDataVariableConnectors === 'function') {
                vm.renderManualDataVariableConnectors()
            }
        }

        vm.stage.on('mousemove.manualLink', onMove)
        vm.stage.on('touchmove.manualLink', onMove)
        vm.stage.on('mouseup.manualLink', onUp)
        vm.stage.on('touchend.manualLink', onUp)
        node.on('dragstart.manualLinkCancel', () => {
            if (!vm._manualLinkGesture || vm._manualLinkGesture !== gesture) return
            if (gesture.timerId) {
                clearTimeout(gesture.timerId)
                gesture.timerId = null
            }
            cleanup(false)
        })

        gesture.timerId = setTimeout(() => {
            if (!vm._manualLinkGesture || vm._manualLinkGesture !== gesture) return
            gesture.armed = true
            if (typeof node.draggable === 'function') node.draggable(false)
            clearPreviewLine(vm)
            const preview = new Konva.Line({
                points: [gesture.startPointer.x, gesture.startPointer.y, gesture.startPointer.x, gesture.startPointer.y],
                stroke: '#0ea5e9',
                strokeWidth: 1.8,
                dash: [5, 4],
                listening: false,
                name: 'manual-data-variable-preview',
            })
            vm.connectorLayer.add(preview)
            if (typeof vm.connectorLayer.batchDraw === 'function') vm.connectorLayer.batchDraw()
        }, HOLD_DELAY_MS)

        return
    }

    node.on('mousedown touchstart', beginGesture)
}

export function renderManualDataVariableConnectors() {
    if (!this.connectorLayer || !this.layer) return
    this.connectorLayer.destroyChildren()

    const nodes = getRenderableChildren(this.layer)
    const sources = nodes.filter(isLinkedDataVariableNode)
    sources.forEach((sourceNode) => {
        const targetOrder = sourceNode.getAttr && sourceNode.getAttr('linkedTargetCreatedOrder')
        if (typeof targetOrder === 'undefined' || targetOrder === null) return
        const targetNode = getNodeByCreatedOrder(this.layer, targetOrder)
        if (!targetNode) return
        renderConnector(this, sourceNode, targetNode, sourceNode.getAttr && sourceNode.getAttr('linkedTargetGap') || 0)
    })

    if (typeof this.connectorLayer.batchDraw === 'function') this.connectorLayer.batchDraw()
}

export function clearManualDataVariableLinkPreview() {
    clearPreviewLine(this)
}