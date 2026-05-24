export const applyPdfExportCleanup = (layer, width) => {
    try {
        const childrenCopy = layer.children.slice();
        const debug = !!(typeof window !== 'undefined' && window.__PDF_DEBUG__);
        childrenCopy.forEach((node) => {
            const attrs = (typeof node.getAttrs === 'function') ? node.getAttrs() : (node.attrs || {});
            if (node.className === 'Line' && Array.isArray(attrs.points) && attrs.points.length >= 4) {
                const pts = attrs.points;
                const ys = [];
                for (let i = 1; i < pts.length; i += 2) ys.push(pts[i]);
                const minY = Math.min.apply(null, ys);
                const maxY = Math.max.apply(null, ys);
                const span = Math.abs(pts[pts.length - 2] - pts[0]);
                if (debug) console.log('PDF Export: Line node', { pts, minY, maxY, span });
                if ((maxY - minY) <= 3 && span >= (width * 0.85)) {
                    try { node.destroy(); } catch (e) { }
                }
            }

            if (node.className === 'Rect' && (attrs.stroke || attrs.strokeWidth)) {
                const w = Number(attrs.width || 0);
                const h = Number(attrs.height || 0);
                const sw = Number(attrs.strokeWidth || attrs.stroke || 0) || 0;
                if (debug) console.log('PDF Export: Rect node', { w, h, sw, attrs });
                if (w >= (width * 0.9) && h <= 10 && sw <= 6) {
                    try { node.destroy(); } catch (e) { }
                }
            }
        });

        try {
            const rects = layer.find('Rect');
            rects.forEach((rect) => {
                const w = typeof rect.width === 'function' ? rect.width() : Number(rect.getAttr('width') || 0);
                const h = typeof rect.height === 'function' ? rect.height() : Number(rect.getAttr('height') || 0);
                const fill = typeof rect.fill === 'function' ? rect.fill() : rect.getAttr('fill');
                if (w >= (width * 0.9) && h <= 2 && fill) {
                    try { rect.destroy(); } catch (e) { }
                }
            });
        } catch (e) { }
    } catch (e) {
        // best-effort cleanup
    }

    try {
        const sanitize = (node) => {
            try {
                const cls = node.getClassName ? node.getClassName() : (node.className || '');
                if (cls === 'Rect' || cls === 'Image' || cls === 'Line') {
                    if (typeof node.stroke === 'function') node.stroke(null);
                    if (typeof node.strokeWidth === 'function') node.strokeWidth(0);
                    try { node.setAttr && node.setAttr('stroke', null); } catch (e) { }
                    try { node.setAttr && node.setAttr('strokeWidth', 0); } catch (e) { }
                }
            } catch (e) { }

            try {
                if (typeof node.getChildren === 'function') {
                    const children = node.getChildren().toArray ? node.getChildren().toArray() : [];
                    for (const c of children) sanitize(c);
                }
            } catch (e) { }
        };

        const all = layer.children.slice();
        all.forEach((n) => sanitize(n));
        layer.draw();
    } catch (e) {
        // best-effort
    }
};
