import Konva from 'konva'

export default function addImage(dataUrl, opts = {}) {
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
                this.handleNodeSelection(konvaImage, e.evt)
            });
            konvaImage.on('mousedown touchstart', (e) => {
                this.handleNodeSelection(konvaImage, e.evt)
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
                if (typeof opts.fontFamily !== 'undefined') konvaImage.setAttr('fontFamily', opts.fontFamily)
                if (typeof opts.fontSize !== 'undefined') konvaImage.setAttr('fontSize', Number(opts.fontSize))
                if (typeof opts.fill !== 'undefined') konvaImage.setAttr('fill', opts.fill)
                if (typeof opts.fontStyle !== 'undefined') konvaImage.setAttr('fontStyle', opts.fontStyle)
                if (typeof opts.textDecoration !== 'undefined') konvaImage.setAttr('textDecoration', opts.textDecoration)
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
}
