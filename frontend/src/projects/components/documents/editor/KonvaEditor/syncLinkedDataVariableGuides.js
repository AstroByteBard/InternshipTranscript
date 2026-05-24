import Konva from 'konva'

const LINKED_DATA_VARIABLES = new Set(['{StudentName}', '{School}', '{Program}', '{StudentID}', '{AcademyYear}'])

function getLinkedDataVariableNodes(layer) {
    const nodes = []
    if (!layer || typeof layer.getChildren !== 'function') return nodes

    layer.getChildren().forEach((node) => {
        try {
            if (!node || typeof node.getClassName !== 'function' || node.getClassName() !== 'Text') return
            const variableName = node.getAttr && node.getAttr('variableName')
            if (!LINKED_DATA_VARIABLES.has(variableName)) return
            nodes.push(node)
        } catch (err) { /* ignore */ }
    })

    return nodes
}

function getConnectorLayer(layer) {
    if (!layer || typeof layer.getChildren !== 'function') return []
    const connectors = []
    layer.getChildren().forEach((node) => {
        try {
            if (!node || typeof node.getClassName !== 'function' || node.getClassName() !== 'Line') return
            const name = node.getAttr && node.getAttr('name')
            if (name !== 'data-variable-connector') return
            connectors.push(node)
        } catch (err) { /* ignore */ }
    })
    return connectors
}

export default function syncLinkedDataVariableGuides() {
    if (!this.layer) return

    const locale = String(this.templateLocale || 'th').toLowerCase()
    const fallbackGap = locale.startsWith('en') ? 20 : 0
    const rawGap = Number(this.linkedDataVariableGap)
    const gap = Number.isFinite(rawGap) && rawGap > 0 ? rawGap : fallbackGap
    const nodes = getLinkedDataVariableNodes(this.layer)
    if (!nodes.length) {
        getConnectorLayer(this.layer).forEach((line) => line.destroy())
        if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw()
        return
    }

    const order = {
        '{StudentName}': 0,
        '{School}': 1,
        '{Program}': 2,
        '{StudentID}': 3,
        '{AcademyYear}': 4,
    }

    const ordered = nodes.slice().sort((a, b) => {
        const aOrder = order[a.getAttr('variableName')] ?? 999
        const bOrder = order[b.getAttr('variableName')] ?? 999
        if (aOrder !== bOrder) return aOrder - bOrder
        return (a.x() || 0) - (b.x() || 0)
    })

    const prevConnectors = getConnectorLayer(this.layer)
    prevConnectors.forEach((line) => line.destroy())

    let anchorY = null
    ordered.forEach((node, index) => {
        const box = node.getClientRect({ skipTransform: false })
        if (index === 0) {
            anchorY = node.y()
            return
        }

        const prevNode = ordered[index - 1]
        const prevBox = prevNode.getClientRect({ skipTransform: false })
        const desiredX = Math.round(prevBox.x + prevBox.width + gap)
        const currentX = Math.round(node.x())
        if (currentX < desiredX) {
            node.x(desiredX)
        }

        if (anchorY !== null && Math.abs(node.y() - anchorY) <= 12) {
            node.y(anchorY)
        }
    })

    ordered.forEach((node, index) => {
        if (index === 0) return
        const prevNode = ordered[index - 1]
        const prevBox = prevNode.getClientRect({ skipTransform: false })
        const currBox = node.getClientRect({ skipTransform: false })
        const line = new Konva.Line({
            points: [
                prevBox.x + prevBox.width,
                prevBox.y + prevBox.height / 2,
                currBox.x,
                currBox.y + currBox.height / 2,
            ],
            stroke: '#64748b',
            strokeWidth: 1.5,
            dash: [5, 4],
            listening: false,
            name: 'data-variable-connector',
            connectorType: 'data-variable',
        })
        line.zIndex(Math.max(1, prevNode.zIndex() - 1))
        this.layer.add(line)
    })

    if (typeof this.layer.batchDraw === 'function') this.layer.batchDraw()
}