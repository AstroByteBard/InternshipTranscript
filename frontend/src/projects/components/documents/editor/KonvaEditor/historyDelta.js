import Konva from 'konva'

const IGNORED_NAMES = new Set(['background-rect', 'hit-area'])
const MOVE_KEYS = new Set(['x', 'y'])
const RESIZE_KEYS = new Set([
    'width',
    'height',
    'scaleX',
    'scaleY',
    'scale',
    'radius',
    'points'
])
const ROTATE_KEYS = new Set(['rotation'])
const STYLE_KEYS = new Set([
    'fill',
    'stroke',
    'strokeWidth',
    'fontSize',
    'fontFamily',
    'fontStyle',
    'textDecoration',
    'align',
    'lineHeight',
    'letterSpacing'
])

export function clonePlain(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value))
}

export function shouldIgnoreNodeData(nodeData) {
    if (!nodeData || !nodeData.attrs) return false
    if (nodeData.attrs.historyIgnore === true) return true
    const name = String(nodeData.attrs.name || '').toLowerCase()
    return IGNORED_NAMES.has(name)
}

function getKeyPart(attrs = {}, index = 0) {
    if (typeof attrs.createdOrder === 'number') return `co:${attrs.createdOrder}`
    if (typeof attrs.createdOrder === 'string' && attrs.createdOrder.trim() !== '') return `co:${attrs.createdOrder}`
    return `ix:${index}`
}

export function buildHistoryKey(nodeLike, parentKey = 'root', index = 0) {
    if (!nodeLike) return `${parentKey}/unknown:${index}`
    const className = typeof nodeLike.getClassName === 'function'
        ? nodeLike.getClassName()
        : (nodeLike.className || 'Node')
    const attrs = typeof nodeLike.getAttrs === 'function'
        ? nodeLike.getAttrs()
        : (nodeLike.attrs || {})
    return `${parentKey}/${className}:${getKeyPart(attrs, index)}`
}

export function flattenSnapshot(snapshot) {
    const map = new Map()

    const walk = (elements, parentKey = 'root') => {
        if (!Array.isArray(elements)) return
        elements.forEach((element, index) => {
            if (!element) return
            if (shouldIgnoreNodeData(element)) return

            const attrs = clonePlain(element.attrs || {}) || {}
            const key = `${parentKey}/${element.className || 'Node'}:${getKeyPart(attrs, index)}`
            const nodeData = {
                key,
                parentKey,
                className: element.className || 'Node',
                attrs,
                src: element.src,
                zIndex: element.zIndex,
                children: Array.isArray(attrs.children) ? attrs.children : []
            }
            map.set(key, nodeData)

            if (Array.isArray(attrs.children) && attrs.children.length) {
                walk(attrs.children, key)
            }
        })
    }

    walk(snapshot && snapshot.elements ? snapshot.elements : [])
    return map
}

function diffAttrs(prevAttrs = {}, nextAttrs = {}) {
    const keys = new Set([
        ...Object.keys(prevAttrs || {}),
        ...Object.keys(nextAttrs || {})
    ])

    const from = {}
    const to = {}
    const changed = []

    keys.forEach((key) => {
        if (key === 'children' || key === 'childrenAttrs' || key === 'image' || key === 'historyKey') return
        const prevValue = prevAttrs ? prevAttrs[key] : undefined
        const nextValue = nextAttrs ? nextAttrs[key] : undefined
        const prevJson = JSON.stringify(prevValue)
        const nextJson = JSON.stringify(nextValue)
        if (prevJson !== nextJson) {
            changed.push(key)
            from[key] = clonePlain(prevValue)
            to[key] = clonePlain(nextValue)
        }
    })

    return { changed, from, to }
}

function diffZIndex(prevNode, nextNode) {
    const prevZ = typeof prevNode.zIndex === 'number' ? prevNode.zIndex : undefined
    const nextZ = typeof nextNode.zIndex === 'number' ? nextNode.zIndex : undefined
    if (JSON.stringify(prevZ) === JSON.stringify(nextZ)) return null
    return { from: prevZ, to: nextZ }
}

function actionTypeForChanges(changed) {
    const changedSet = new Set(changed)
    if (changedSet.size === 1 && changedSet.has('zIndex')) return 'REORDER'
    if (changedSet.has('text')) return 'TEXT_EDIT'
    if (Array.from(ROTATE_KEYS).some(key => changedSet.has(key))) return 'ROTATE'
    if (Array.from(RESIZE_KEYS).some(key => changedSet.has(key))) return 'RESIZE'
    if (changedSet.size > 0 && Array.from(changedSet).every(key => MOVE_KEYS.has(key) || key === 'zIndex')) return 'MOVE'
    if (changedSet.size > 0 && Array.from(changedSet).every(key => STYLE_KEYS.has(key) || key === 'zIndex')) return 'STYLE_CHANGE'
    return 'UPDATE_ATTRS'
}

export function summarizeHistoryAction(action) {
    if (!action) return ''
    if (action.action === 'CREATE' || action.action === 'DELETE') {
        return `${action.action}${action.key ? ` ${action.key}` : ''}`
    }
    const changed = Array.isArray(action.changed) ? action.changed.join(', ') : ''
    return `${action.action}${action.key ? ` ${action.key}` : ''}${changed ? ` (${changed})` : ''}`
}

export function diffHistorySnapshots(prevSnapshot, nextSnapshot) {
    const prevMap = flattenSnapshot(prevSnapshot)
    const nextMap = flattenSnapshot(nextSnapshot)
    const actions = []
    const blockedPrefixes = []

    const isBlocked = (key) => blockedPrefixes.some(prefix => key === prefix || key.startsWith(`${prefix}/`))

    prevMap.forEach((prevNode, key) => {
        if (isBlocked(key)) return
        if (!nextMap.has(key)) {
            actions.push({
                action: 'DELETE',
                key,
                parentKey: prevNode.parentKey,
                nodeData: clonePlain(prevNode)
            })
            blockedPrefixes.push(key)
            return
        }

        const nextNode = nextMap.get(key)
        const { changed, from, to } = diffAttrs(prevNode.attrs, nextNode.attrs)
        const zIndexChange = diffZIndex(prevNode, nextNode)
        if (changed.length || zIndexChange) {
            if (zIndexChange) {
                from.zIndex = zIndexChange.from
                to.zIndex = zIndexChange.to
                if (!changed.includes('zIndex')) changed.push('zIndex')
            }
            actions.push({
                action: actionTypeForChanges(changed),
                key,
                parentKey: prevNode.parentKey,
                className: prevNode.className,
                changed,
                from,
                to
            })
        }
    })

    nextMap.forEach((nextNode, key) => {
        if (isBlocked(key)) return
        if (!prevMap.has(key)) {
            actions.push({
                action: 'CREATE',
                key,
                parentKey: nextNode.parentKey,
                nodeData: clonePlain(nextNode)
            })
            blockedPrefixes.push(key)
        }
    })

    const depthOf = (key) => String(key || '').split('/').length
    actions.sort((a, b) => {
        if (a.action === 'DELETE' && b.action !== 'DELETE') return -1
        if (a.action !== 'DELETE' && b.action === 'DELETE') return 1
        if (a.action === 'CREATE' && b.action !== 'CREATE') return 1
        if (a.action !== 'CREATE' && b.action === 'CREATE') return -1
        return depthOf(b.key) - depthOf(a.key)
    })

    return actions
}

function createImageNode(data) {
    const attrs = clonePlain(data.attrs || {}) || {}
    const imageSource = data.src || attrs.src || attrs.imageSrc || null
    const imageObj = new window.Image()
    if (imageSource) imageObj.src = imageSource
    delete attrs.children
    delete attrs.childrenAttrs
    delete attrs.image
    delete attrs.src
    return new Konva.Image({ ...attrs, image: imageObj })
}

export function instantiateNodeFromData(data) {
    if (!data) return null
    const attrs = clonePlain(data.attrs || {}) || {}
    delete attrs.children
    delete attrs.childrenAttrs
    delete attrs.image

    let node = null
    switch (data.className) {
        case 'Text':
            node = new Konva.Text(attrs)
            break
        case 'Rect':
            node = new Konva.Rect(attrs)
            break
        case 'Line':
            node = new Konva.Line(attrs)
            break
        case 'Circle':
            node = new Konva.Circle(attrs)
            break
        case 'Image':
            node = createImageNode(data)
            break
        case 'Group':
            node = new Konva.Group(attrs)
            break
        default:
            node = new Konva.Group(attrs)
            break
    }

    if (data.key) {
        try { node.setAttr('historyKey', data.key) } catch (e) { /* ignore */ }
    }

    if (node instanceof Konva.Group && Array.isArray(data.children) && data.children.length) {
        data.children.forEach((child) => {
            const childNode = instantiateNodeFromData(child)
            if (childNode) node.add(childNode)
        })
    }

    return node
}

function findNodeRecursively(node, key, editor, parentKey = 'root', index = 0) {
    if (!node) return null
    const currentKey = buildHistoryKey(node, parentKey, index)
    if (currentKey === key || (typeof node.getAttr === 'function' && node.getAttr('historyKey') === key)) {
        return node
    }

    if (typeof node.getChildren !== 'function') return null
    const collection = node.getChildren()
    const children = (collection && typeof collection.toArray === 'function')
        ? collection.toArray()
        : (collection ? Array.from(collection) : [])
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const found = findNodeRecursively(child, key, editor, currentKey, i)
        if (found) return found
    }
    return null
}

export function findNodeByHistoryKey(editor, key) {
    if (!editor || !editor.layer || !key) return null
    const children = editor.layer.children ? editor.layer.children.slice() : []
    for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (!node) continue
        if (node === editor.transformer) continue
        const found = findNodeRecursively(node, key, editor, 'root', i)
        if (found) return found
    }
    return null
}

function setNodeAttrs(node, attrs = {}) {
    if (!node || !attrs) return
    const safeAttrs = clonePlain(attrs) || {}
    delete safeAttrs.children
    delete safeAttrs.childrenAttrs
    delete safeAttrs.image
    delete safeAttrs.src
    try {
        node.setAttrs(safeAttrs)
    } catch (e) { /* ignore */ }
}

function addNodeToParent(editor, parentKey, nodeData) {
    const node = instantiateNodeFromData(nodeData)
    if (!node) return null
    const parentNode = parentKey && parentKey !== 'root' ? findNodeByHistoryKey(editor, parentKey) : null
    if (parentNode && typeof parentNode.add === 'function') {
        parentNode.add(node)
    } else if (editor && editor.layer) {
        editor.layer.add(node)
    }
    if (typeof nodeData.zIndex === 'number' && typeof node.zIndex === 'function') {
        try { node.zIndex(nodeData.zIndex) } catch (e) { /* ignore */ }
    }
    return node
}

export function applyHistoryAction(editor, action, direction = 'undo') {
    if (!editor || !action) return

    const isUndo = direction === 'undo'
    const targetAttrs = isUndo ? action.from : action.to
    const sourceAttrs = isUndo ? action.to : action.from

    if (action.action === 'DELETE') {
        if (isUndo) {
            addNodeToParent(editor, action.parentKey, action.nodeData)
        } else {
            const node = findNodeByHistoryKey(editor, action.key)
            if (node) node.destroy()
        }
        return
    }

    if (action.action === 'CREATE') {
        if (isUndo) {
            const node = findNodeByHistoryKey(editor, action.key)
            if (node) node.destroy()
        } else {
            addNodeToParent(editor, action.parentKey, action.nodeData)
        }
        return
    }

    const node = findNodeByHistoryKey(editor, action.key)
    if (!node) return

    if (targetAttrs && typeof targetAttrs === 'object') {
        setNodeAttrs(node, targetAttrs)
    }

    const nextZIndex = isUndo ? action.from?.zIndex : action.to?.zIndex
    if (typeof nextZIndex === 'number' && typeof node.zIndex === 'function') {
        try { node.zIndex(nextZIndex) } catch (e) { /* ignore */ }
    }

    if (typeof sourceAttrs === 'object' && sourceAttrs.text !== undefined && typeof node.text === 'function') {
        node.text(targetAttrs.text !== undefined ? targetAttrs.text : sourceAttrs.text)
    }

    if (editor && editor.layer && typeof editor.layer.batchDraw === 'function') {
        editor.layer.batchDraw()
    }
}

export function applyHistoryBatch(editor, actions = [], direction = 'undo') {
    const ordered = direction === 'undo' ? [...actions].reverse() : [...actions]
    ordered.forEach((action) => {
        applyHistoryAction(editor, action, direction)
    })
    if (editor && editor.transformer && typeof editor.transformer.nodes === 'function') {
        editor.transformer.nodes([])
    }
    if (editor && editor.layer && typeof editor.layer.draw === 'function') {
        editor.layer.draw()
    }
    if (editor && typeof editor.emitSelectionChange === 'function') {
        try { editor.emitSelectionChange() } catch (e) { /* ignore */ }
    }
}