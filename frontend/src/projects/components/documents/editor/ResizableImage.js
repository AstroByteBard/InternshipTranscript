import { Node, mergeAttributes } from '@tiptap/core'

export const ResizableImage = Node.create({
    name: 'resizableImage',
    group: 'inline',
    inline: true,
    draggable: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            title: { default: null },
            width: { default: '300' },
            height: { default: null },
            left: { default: '0' },
            top: { default: '0' },
            style: { default: null },
        }
    },

    parseHTML() {
        return [{ tag: 'img[src]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const wrapper = document.createElement('span')
            wrapper.style.display = 'inline-block'
            // position absolute so image can be freely placed within the A4 container
            wrapper.style.position = 'absolute'
            wrapper.style.cursor = 'move'
            wrapper.style.lineHeight = '0'
            wrapper.draggable = false

            const img = document.createElement('img')
            img.src = node.attrs.src
            if (node.attrs.alt) img.alt = node.attrs.alt
            img.style.width = node.attrs.width ? node.attrs.width + 'px' : '300px'
            img.style.height = node.attrs.height ? node.attrs.height + 'px' : 'auto'
            img.style.display = 'block'
            img.style.maxWidth = '100%'
            wrapper.style.maxWidth = '100%'
            wrapper.style.boxSizing = 'border-box'
            img.style.userSelect = 'none'
            img.draggable = false

            // If the node doesn't have a width stored, use the loaded image natural size
            img.addEventListener('load', () => {
                try {
                    const page = wrapper.closest('.document-editor-full')
                    const maxWidthPx = page ? page.clientWidth : window.innerWidth
                    // if width attr is not set or is falsy, persist the natural width (clamped)
                    if (!node.attrs.width) {
                        const natural = Math.min(img.naturalWidth, maxWidthPx)
                        img.style.width = natural + 'px'
                        // save into document so future mounts use same size
                        if (typeof getPos === 'function') {
                            const pos = getPos()
                            try {
                                editor.commands.setNodeSelection(pos)
                                editor.commands.updateAttributes('resizableImage', {
                                    ...node.attrs,
                                    width: String(natural),
                                })
                            } catch (err) {
                                editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    width: String(natural),
                                }))
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            })

            // Resize handle (bottom-right corner)
            const handle = document.createElement('span')
            handle.style.cssText = `
                position: absolute;
                right: 0;
                bottom: 0;
                width: 14px;
                height: 14px;
                background: #3b82f6;
                border-radius: 2px;
                cursor: se-resize;
                z-index: 10;
            `

            // Show/hide handle on hover
            wrapper.addEventListener('mouseenter', () => { handle.style.display = 'block' })
            wrapper.addEventListener('mouseleave', () => { handle.style.display = 'block' })

            // apply initial position from attrs
            const applyPosition = (left, top) => {
                wrapper.style.left = (Number(left) || 0) + 'px'
                wrapper.style.top = (Number(top) || 0) + 'px'
            }
            applyPosition(node.attrs.left, node.attrs.top)

            // --- Drag (move) logic ---
            let isDragging = false
            let dragStartX = 0, dragStartY = 0, dragStartLeft = 0, dragStartTop = 0

            wrapper.addEventListener('mousedown', (e) => {
                // ignore starting drag when clicking the resize handle
                if (e.target === handle) return
                e.preventDefault()
                e.stopPropagation()
                isDragging = true
                dragStartX = e.clientX
                dragStartY = e.clientY
                dragStartLeft = parseInt(wrapper.style.left || 0, 10)
                dragStartTop = parseInt(wrapper.style.top || 0, 10)

                const onDragMove = (ev) => {
                    if (!isDragging) return
                    const dx = ev.clientX - dragStartX
                    const dy = ev.clientY - dragStartY
                    const page = wrapper.closest('.document-editor-full')
                    const maxW = page ? page.clientWidth : window.innerWidth
                    const maxH = page ? page.clientHeight : window.innerHeight

                    const newLeft = Math.max(0, Math.min(dragStartLeft + dx, maxW - img.offsetWidth))
                    const newTop = Math.max(0, Math.min(dragStartTop + dy, maxH - img.offsetHeight))
                    wrapper.style.left = newLeft + 'px'
                    wrapper.style.top = newTop + 'px'
                }

                const onDragEnd = (ev) => {
                    isDragging = false
                    document.removeEventListener('mousemove', onDragMove)
                    document.removeEventListener('mouseup', onDragEnd)

                    if (typeof getPos === 'function') {
                        const pos = getPos()
                        const finalLeft = parseInt(wrapper.style.left || 0, 10)
                        const finalTop = parseInt(wrapper.style.top || 0, 10)
                        // use Tiptap commands to set selection and update attributes reliably
                        try {
                            editor.commands.setNodeSelection(pos)
                            editor.commands.updateAttributes('resizableImage', {
                                ...node.attrs,
                                left: String(finalLeft),
                                top: String(finalTop),
                            })
                        } catch (err) {
                            // fallback to transaction when commands unavailable
                            editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                left: String(finalLeft),
                                top: String(finalTop),
                            }))
                        }
                    }
                }

                document.addEventListener('mousemove', onDragMove)
                document.addEventListener('mouseup', onDragEnd)
            })

            // --- Resize logic ---
            let isResizing = false
            let startX, startY, startW, startH

            handle.addEventListener('mousedown', (e) => {
                e.preventDefault()
                e.stopPropagation()
                isResizing = true
                startX = e.clientX
                startY = e.clientY
                startW = img.offsetWidth
                startH = img.offsetHeight

                const onMouseMove = (e) => {
                    if (!isResizing) return
                    // compute desired new size
                    const desiredW = Math.max(50, startW + (e.clientX - startX))
                    const desiredH = Math.max(30, startH + (e.clientY - startY))

                    // find the page/container width to cap resizing (nearest .document-editor-full)
                    const page = wrapper.closest('.document-editor-full')
                    const maxWidthPx = page ? page.clientWidth : window.innerWidth

                    // clamp width to container
                    const newW = Math.min(desiredW, maxWidthPx)
                    const newH = desiredH
                    img.style.width = newW + 'px'
                    img.style.height = newH + 'px'
                    // ensure wrapper position still inside page
                    if (page) {
                        const left = parseInt(wrapper.style.left || 0, 10)
                        const maxLeft = page.clientWidth - img.offsetWidth
                        if (left > maxLeft) wrapper.style.left = Math.max(0, maxLeft) + 'px'
                    }
                }

                const onMouseUp = (e) => {
                    isResizing = false
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)

                    if (typeof getPos === 'function') {
                        // clamp final width to container before saving
                        const page = wrapper.closest('.document-editor-full')
                        const maxWidthPx = page ? page.clientWidth : window.innerWidth
                        const finalWidth = Math.min(img.offsetWidth, maxWidthPx)
                        const finalHeight = img.offsetHeight
                        const finalLeft = parseInt(wrapper.style.left || 0, 10)
                        const finalTop = parseInt(wrapper.style.top || 0, 10)

                        try {
                            const pos = getPos()
                            editor.commands.setNodeSelection(pos)
                            editor.commands.updateAttributes('resizableImage', {
                                ...node.attrs,
                                width: String(finalWidth),
                                height: String(finalHeight),
                                left: String(finalLeft),
                                top: String(finalTop),
                            })
                        } catch (err) {
                            const pos = getPos()
                            editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                width: String(finalWidth),
                                height: String(finalHeight),
                                left: String(finalLeft),
                                top: String(finalTop),
                            }))
                        }
                    }
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            })

            wrapper.appendChild(img)
            wrapper.appendChild(handle)

            let currentNode = node
            return {
                dom: wrapper,
                update(updatedNode) {
                    if (updatedNode.type.name !== 'resizableImage') return false
                    img.src = updatedNode.attrs.src
                    if (updatedNode.attrs.alt) img.alt = updatedNode.attrs.alt

                    // Only apply width/height from the document when the node attrs actually changed.
                    // This prevents overriding a user resize in the DOM before the editor state is updated.
                    if (updatedNode.attrs.width !== currentNode.attrs.width) {
                        img.style.width = updatedNode.attrs.width ? updatedNode.attrs.width + 'px' : img.style.width || '300px'
                    }
                    if (updatedNode.attrs.height !== currentNode.attrs.height) {
                        img.style.height = updatedNode.attrs.height ? updatedNode.attrs.height + 'px' : img.style.height || 'auto'
                    }

                    // restore saved position when it changes
                    if (updatedNode.attrs.left !== currentNode.attrs.left) wrapper.style.left = (Number(updatedNode.attrs.left) || 0) + 'px'
                    if (updatedNode.attrs.top !== currentNode.attrs.top) wrapper.style.top = (Number(updatedNode.attrs.top) || 0) + 'px'

                    currentNode = updatedNode
                    return true
                },
            }
        }
    },
})
