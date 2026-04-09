import Konva from 'konva';
import { jsPDF } from 'jspdf';

/**
 * Generate PDF purely on the client side using replacing variables in Konva Stage JSON
 * @param {Object} templateJSON - The JSON structure of the document template
 * @param {Object} dataMap - The data to fill into placeholders
 */
export async function downloadClientPDF(templateJSON, dataMap, filename = 'document.pdf') {
    // We create a temporary hidden div
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const width = templateJSON.width || 794;
    const height = templateJSON.height || 1123;

    const stage = new Konva.Stage({
        container: container,
        width: width,
        height: height
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Solid white background to avoid transparent edge artifacts
    const pdfBg = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: '#ffffff',
        listening: false,
        name: 'pdf-bg'
    });
    layer.add(pdfBg);

    // Function to load image from dataURL/URL
    const loadImage = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    };

    const cropImage = (img, cropPx = 1) => {
        return new Promise((resolve) => {
            if (!img || !img.width || !img.height) return resolve(img);
            const w = Math.max(1, img.width - cropPx * 2);
            const h = Math.max(1, img.height - cropPx * 2);
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, -cropPx, -cropPx);
            const dataUrl = canvas.toDataURL('image/png');
            loadImage(dataUrl).then(resolve);
        });
    };

    // Preload elements
    // NOTE: Skip loading inline placeholder dataURLs (canvas-made placeholders)
    // for variable-backed images so their dashed stroke/placeholder does not
    // end up embedded in the exported PDF.
    const preloads = templateJSON.elements.map(async (el) => {
        if (el.className === 'Image' && el.src && el.src !== '') {
            const srcStr = String(el.src || '');
            const isDataUrl = srcStr.indexOf('data:') === 0;
            const hasVariable = !!(el.attrs && el.attrs.variableName);
            // Only skip dataURL images that are editor placeholders (they are
            // created by the editor and tagged with a `variableName`). This
            // preserves legitimate generated/dataURL images (charts, etc.).
            if (isDataUrl && hasVariable) {
                el._loadedImage = null;
            } else {
                el._loadedImage = await loadImage(el.src);
                if (el._loadedImage && el._loadedImage.width && el._loadedImage.height) {
                    const isBanner = el._loadedImage.width > el._loadedImage.height * 2;
                    if (isBanner) {
                        // Trim 1px from each edge to avoid embedded border lines in banner images.
                        el._loadedImage = await cropImage(el._loadedImage, 1);
                    }
                }
            }
        }
        return el;
    });

    await Promise.all(preloads);

    // Helpers
    const drawRoundRect = (ctx, x, y, width, height, radius) => {
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
    };

    const applyZIndex = (node, attrs) => {
        if (typeof attrs.zIndex === 'number') {
            node.zIndex(attrs.zIndex);
        }
    };

    const normalizeScore = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return null;
        if (num <= 5) return Math.max(0, Math.min(1, num / 5));
        if (num <= 10) return Math.max(0, Math.min(1, num / 10));
        if (num <= 100) return Math.max(0, Math.min(1, num / 100));
        return Math.max(0, Math.min(1, num));
    };

    const defaultGeneralCompetencies = [
        { name: 'Creativity', score: 4.2 },
        { name: 'Analytical thinking and problem solving', score: 4.1 },
        { name: 'Digital literacy', score: 4.0 },
        { name: 'Curiosity and life-long learning', score: 4.1 },
        { name: 'Resilience, flexibility and agility', score: 4.0 },
        { name: 'Voluntary and empathy', score: 4.3 },
        { name: 'Leadership and social influence', score: 4.0 },
        { name: 'Collaboration', score: 4.2 },
        { name: 'Cultural and civic literacy', score: 4.1 },
        { name: 'Entrepreneurial mindset', score: 4.0 },
        { name: 'Foreign language', score: 4.1 },
        { name: 'Communication', score: 4.0 }
    ];

    const completeCompetencies = (items, defaults) => {
        const list = Array.isArray(items) ? items : [];
        if (!defaults || !defaults.length) return list;
        const byName = new Map();
        list.forEach((it) => {
            if (!it) return;
            const key = String(it.name || '').trim();
            if (key) byName.set(key, it);
        });
        return defaults.map((def) => {
            const key = String(def.name || '').trim();
            return byName.get(key) || def;
        });
    };

    const addRadarGraph = (attrs, graphData, items, title) => {
        const x = attrs.x || 0;
        const y = attrs.y || 0;
        const scaleX = attrs.scaleX || 1;
        const scaleY = attrs.scaleY || 1;
        const rotation = attrs.rotation || 0;
        const width = attrs.width || 360;
        const height = attrs.height || 260;
        const group = new Konva.Group({ x, y, scaleX, scaleY, rotation, name: 'graph-placeholder', graphType: attrs.graphType });

        group.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: '#ffffff' }));
        group.add(new Konva.Text({ x: 10, y: 8, text: title || 'Radar', fontSize: 16, fontFamily: 'Inter, Arial', fontStyle: '600', fill: '#1e293b' }));

        const labels = (graphData.labels && graphData.labels.length)
            ? graphData.labels
            : items.map((item) => item.name || item.label || '');
        const sides = Math.max(3, labels.length);
        const centerX = width / 2;
        const centerY = height / 2 + 50;
        const radius = Math.min(width, height) / 2 - 50;

        for (let r = 1; r <= 5; r++) {
            const currentR = (radius / 5) * r;
            const points = [];
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                points.push(centerX + currentR * Math.cos(angle), centerY + currentR * Math.sin(angle));
            }
            group.add(new Konva.Line({ points, closed: true, stroke: '#e2e8f0', strokeWidth: 1 }));
        }

        const values = (graphData.you && graphData.you.length) ? graphData.you : items.map((item) => item.score || item.percentage || item.value || 0);
        const avgValues = (graphData.average && graphData.average.length)
            ? graphData.average
            : items.map((item) => item.average || (Math.max(0, (item.percentage || item.score || 0) - 10)));

        const buildPolygon = (vals) => {
            const points = [];
            for (let i = 0; i < sides; i++) {
                const v = normalizeScore(vals[i]) || 0;
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                points.push(centerX + radius * v * Math.cos(angle), centerY + radius * v * Math.sin(angle));
            }
            return points;
        };

        const youAveragePolygon = buildPolygon(avgValues);
        if (youAveragePolygon.length >= 6) {
            group.add(new Konva.Line({ points: youAveragePolygon, closed: true, fill: 'rgba(251, 113, 133, 0.3)', stroke: '#fb7185', strokeWidth: 2 }));
        }

        const youPolygon = buildPolygon(values);
        if (youPolygon.length >= 6) {
            group.add(new Konva.Line({ points: youPolygon, closed: true, fill: 'rgba(124, 58, 237, 0.35)', stroke: '#7c3aed', strokeWidth: 3 }));
        }

        labels.slice(0, sides).forEach((label, i) => {
            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
            const labelX = centerX + (radius + 20) * Math.cos(angle);
            const labelY = centerY + (radius + 20) * Math.sin(angle);

            let labelText = String(label);
            if (labelText.length > 16) {
                const words = labelText.split(' ');
                labelText = words.slice(0, Math.ceil(words.length / 2)).join(' ') + '\n' + words.slice(Math.ceil(words.length / 2)).join(' ');

            }

            group.add(new Konva.Text({ x: labelX - 40, y: labelY - 8, text: labelText, fontSize: 10, fontFamily: 'Inter, Arial', fill: '#475569', width: 80, align: 'center' }));
        });

        // Legend
        const legendY = 50;
        group.add(new Konva.Circle({ x: centerX - 40, y: legendY, radius: 4, fill: '#7c3aed' }));
        group.add(new Konva.Text({ x: centerX - 30, y: legendY - 5, text: 'You', fontSize: 11, fontFamily: 'Inter, Arial', fill: '#64748b' }));
        group.add(new Konva.Circle({ x: centerX + 20, y: legendY, radius: 4, fill: '#fb7185' }));
        group.add(new Konva.Text({ x: centerX + 30, y: legendY - 5, text: 'Average', fontSize: 11, fontFamily: 'Inter, Arial', fill: '#64748b' }));

        layer.add(group);
        applyZIndex(group, attrs);
    };

    const addBarGraph = (attrs, items, title) => {
        const x = attrs.x || 0;
        const y = attrs.y || 0;
        const scaleX = attrs.scaleX || 1;
        const scaleY = attrs.scaleY || 1;
        const rotation = attrs.rotation || 0;
        const width = attrs.width || 360;
        const height = attrs.height || 220;
        const group = new Konva.Group({ x, y, scaleX, scaleY, rotation, name: 'graph-placeholder', graphType: attrs.graphType });

        group.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: '#ffffff' }));
        group.add(new Konva.Text({ x: 10, y: 8, text: title || 'Bar', fontSize: 16, fontFamily: 'Inter, Arial', fontStyle: '600', fill: '#1e293b' }));

        const rows = items.length ? items : [{ name: 'Skill', score: 80 }];
        const barX = 10;
        const barW = width - 20;
        const rowH = Math.max(24, Math.floor((height - 40) / rows.length));
        let currentY = 36;

        rows.forEach((item) => {
            const label = item.name || item.label || 'Skill';
            let value = item.score || item.percentage || item.value || 0;
            const ratio = normalizeScore(value) || 0;

            group.add(new Konva.Text({ x: barX, y: currentY - 2, text: String(label), fontSize: 11, fontFamily: 'Inter, Arial', fill: '#475569' }));
            group.add(new Konva.Text({ x: barX + barW - 40, y: currentY - 2, text: Math.round(ratio * 100) + '%', fontSize: 11, fontFamily: 'Inter, Arial', fill: '#475569', align: 'right', width: 40 }));
            group.add(new Konva.Rect({ x: barX, y: currentY + 12, width: barW, height: 6, fill: '#e2e8f0', cornerRadius: 3 }));

            let fillC = '#dc2626'; // < 50%
            if (ratio >= 0.8) fillC = '#22c55e';
            else if (ratio >= 0.5) fillC = '#eab308';

            group.add(new Konva.Rect({ x: barX, y: currentY + 12, width: Math.max(4, barW * ratio), height: 6, fill: fillC, cornerRadius: 3 }));
            currentY += rowH;
        });

        layer.add(group);
        applyZIndex(group, attrs);
    };

    const addCompetencyTable = (attrs, items, title) => {
        const group = new Konva.Group({
            x: attrs.x || 0,
            y: attrs.y || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            rotation: attrs.rotation || 0
        });

        const titleText = new Konva.Text({
            text: title,
            fontSize: 18,
            fontFamily: 'Inter, Arial',
            fontStyle: '600',
            fill: '#4b5563',
            y: 0
        });
        group.add(titleText);

        const scoreHeader = new Konva.Text({
            text: 'Score',
            fontSize: 18,
            fontFamily: 'Inter, Arial',
            fontStyle: '600',
            fill: '#4b5563',
            x: 350,
            y: 0
        });
        group.add(scoreHeader);

        let currentY = 50;
        const safeItems = (Array.isArray(items) && items.length) ? items : [{ name: 'N/A', score: 'X.X' }];
        safeItems.forEach((it) => {
            const name = typeof it === 'string' ? it : (it.name || 'N/A');
            const scoreVal = typeof it === 'string' ? 'X.X' : (it.score !== undefined ? it.score : (it.percentage !== undefined ? it.percentage : 'X.X'));

            group.add(new Konva.Text({
                text: String(name),
                fontSize: 14,
                fontFamily: 'Inter, Arial',
                fill: '#64748b',
                y: currentY
            }));
            group.add(new Konva.Text({
                text: String(scoreVal),
                fontSize: 14,
                fontFamily: 'Inter, Arial',
                fill: '#64748b',
                x: 350,
                y: currentY
            }));
            currentY += 35;
        });
        layer.add(group);
        applyZIndex(group, attrs);
    };

    const addSuggestionTable = (attrs, suggestionsObj) => {
        const group = new Konva.Group({
            x: attrs.x || 0,
            y: attrs.y || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            rotation: attrs.rotation || 0
        });

        let currentY = 0;
        const addSection = (title, itemsArray) => {
            if (!itemsArray || !itemsArray.length) return;
            group.add(new Konva.Text({
                text: title,
                fontSize: 22,
                fontFamily: 'Inter, Arial',
                fontStyle: '600',
                fill: '#1e293b',
                y: currentY
            }));
            currentY += 40;

            const firstItem = itemsArray[0];
            const nameRole = `${firstItem.name || firstItem.advisor || 'Advisor'} - ${firstItem.role || firstItem.company || 'Company'}`;
            group.add(new Konva.Text({
                text: nameRole,
                fontSize: 14,
                fontFamily: 'Inter, Arial',
                fontStyle: '500',
                fill: '#475569',
                y: currentY
            }));

            const currentBoxWidth = attrs.width || 650;
            const iconX = Math.max(400, currentBoxWidth - 120);
            const calendarGroup = new Konva.Group({ x: iconX, y: currentY - 2 });
            // Avoid drawing line elements inside the calendar icon; when the
            // suggestion group is scaled, that small line can stretch into a
            // full-width separator.
            calendarGroup.add(new Konva.Rect({ width: 16, height: 16, stroke: '#475569', strokeWidth: 1.5, cornerRadius: 2 }));
            group.add(calendarGroup);

            group.add(new Konva.Text({
                text: firstItem.date || 'XX-XX-XXXX',
                fontSize: 14,
                fontFamily: 'Inter, Arial',
                fill: '#475569',
                x: iconX + 40,
                y: currentY
            }));
            currentY += 35;

            itemsArray.forEach(adv => {
                if (Array.isArray(adv.points)) {
                    adv.points.forEach(pt => {
                        group.add(new Konva.Circle({ x: 10, y: currentY + 7, radius: 2, fill: '#1e293b' }));

                        let txt = String(pt);
                        if (txt.length > 70) txt = txt.substring(0, 67) + '...';

                        group.add(new Konva.Text({
                            text: txt,
                            fontSize: 14,
                            fontFamily: 'Inter, Arial',
                            fill: '#1e293b',
                            x: 25,
                            y: currentY
                        }));
                        currentY += 35;
                    });
                }
            });
            currentY += 40;
        };

        if (suggestionsObj) {
            addSection('Outstanding', suggestionsObj.Outstanding || suggestionsObj.outstanding);
            addSection('Opportunities', suggestionsObj.Opportunities || suggestionsObj.opportunities);
        }
        layer.add(group);
        applyZIndex(group, attrs);
    };

    // Replace inline text like "Name {StudentName}" or just "{StudentName}"
    const resolveValue = (key) => {
        if (!key) return '';
        const cleanKey = String(key).replace(/[{}]/g, '');
        if (dataMap[cleanKey] !== undefined) return dataMap[cleanKey];
        if (dataMap[key] !== undefined) return dataMap[key];
        if (dataMap.student && dataMap.student[cleanKey] !== undefined) return dataMap.student[cleanKey];
        if (cleanKey === 'AcademyYear' || cleanKey === 'academyYear') {
            const year = dataMap.AcademyYear || dataMap.academyYear || '';
            return year ? 'Academic Year ' + year : 'Academic Year';
        }
        return '';
    };

    const replaceTextVariables = (text) => {
        if (typeof text !== 'string') return text;
        const regex = /{[^}]+}/g;
        let result = text;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const val = resolveValue(match[0]);
            if (val !== '' && val !== undefined) {
                result = result.replace(match[0], val);
            }
        }
        // If the entire text was a variable that resolved to something, return the resolved value
        // But if there are no braces, or no variables matched, we might just try resolving the whole text as a key
        if (result === text && !text.includes('{')) {
            const val = resolveValue(text);
            if (val !== '' && val !== undefined) return val;
        }
        return result;
    };

    // Load nodes
    templateJSON.elements.forEach((el) => {
        const attrs = Object.assign({}, el.attrs || {});
        if (el.className === 'Text') {
            const originalText = attrs.text || '';
            const keyToLookFor = attrs.variableName || attrs.placeholder || originalText;

            // Replicate the exact replacement logic
            let finalValue = originalText;
            const singleKeyMatcher = extractPlaceholderKey(attrs, originalText);
            if (singleKeyMatcher) {
                const v = resolveValue(singleKeyMatcher);
                if (v !== '' && v !== undefined) finalValue = v;
            } else {
                finalValue = replaceTextVariables(originalText);
            }

            attrs.text = finalValue;

            const node = new Konva.Text(attrs);
            layer.add(node);
            applyZIndex(node, el.attrs);
        } else if (el.className === 'Image') {
            if (attrs.name === 'graph-placeholder') {
                const graphType = attrs.graphType || '';
                const isRadar = graphType.includes('Radar');
                const cleanKey = graphType.replace(/Graph_/g, '');
                const isGeneral = cleanKey.includes('General');

                const fallbackItems = isGeneral
                    ? (dataMap.GeneralCompetencies || dataMap.generalCompetencies || [])
                    : (dataMap.SpecificCompetencies || dataMap.specificCompetencies || []);

                let pData = {
                    labels: fallbackItems.map(i => i.name),
                    datasets: [{
                        label: 'You', data: fallbackItems.map(i => i.percentage || i.score || 0)
                    }, {
                        label: 'Average', data: fallbackItems.map(i => i.average || Math.max(0, (i.percentage || i.score || 0) - 10))
                    }]
                };

                const title = isGeneral ? 'General Competencies' : 'Specific Competencies';

                if (isRadar) {
                    addRadarGraph(attrs, pData, fallbackItems, title);
                } else {
                    addBarGraph(attrs, fallbackItems, title);
                }
            } else if (el._loadedImage) {
                // sanitize attrs to avoid exporting strokes/borders around images
                if (attrs) {
                    delete attrs.stroke;
                    delete attrs.strokeWidth;
                    delete attrs.strokeEnabled;
                }
                const isBanner = !!attrs.isBanner || (el._loadedImage.width > el._loadedImage.height * 2);
                if (isBanner) {
                    attrs.imageSmoothingEnabled = false;
                    if (typeof attrs.x === 'number') attrs.x = Math.round(attrs.x);
                    if (typeof attrs.y === 'number') attrs.y = Math.round(attrs.y);
                    if (typeof attrs.width === 'number') attrs.width = Math.round(attrs.width);
                    if (typeof attrs.height === 'number') attrs.height = Math.round(attrs.height);
                }
                const node = new Konva.Image(Object.assign({}, attrs, { image: el._loadedImage }));
                layer.add(node);
                applyZIndex(node, el.attrs);
            }
        } else if (el.className === 'Group') {
            if (attrs.name === 'competency-table') {
                const key = attrs.variableName || '{GeneralCompetencies}';
                const isGeneral = String(key).indexOf('General') >= 0;
                const items = isGeneral
                    ? (dataMap.GeneralCompetencies || dataMap.generalCompetencies || [])
                    : (dataMap.SpecificCompetencies || dataMap.specificCompetencies || []);
                const safeItems = isGeneral
                    ? completeCompetencies(items, defaultGeneralCompetencies)
                    : ((Array.isArray(items) && items.length) ? items : [{ name: 'N/A', score: 'X.X' }]);
                const title = isGeneral ? 'General Competencies' : 'Specific Competencies';
                addCompetencyTable(attrs, safeItems, title);
            } else if (attrs.name === 'suggestion-table') {
                const sug = dataMap.Suggestion || dataMap.suggestion || {};
                addSuggestionTable(attrs, {
                    Outstanding: dataMap.Outstanding || dataMap.outstanding || sug.Outstanding || sug.outstanding,
                    Opportunities: dataMap.Opportunities || dataMap.opportunities || sug.Opportunities || sug.opportunities
                });
            }
        }
    });

    function extractPlaceholderKey(attrs, textValue) {
        if (attrs && attrs.variableName) return attrs.variableName;
        if (attrs && attrs.placeholder) return attrs.placeholder;
        if (typeof textValue === 'string') {
            const match = textValue.match(/\{[^}]+\}/);
            if (match && match[0] === textValue) return match[0]; // ONLY if it's the exact string e.g. "{StudentName}"
        }
        return '';
    }

    // Sort to handle zIndex properly
    const nodes = layer.children.slice();
    nodes.sort((a, b) => {
        const aZ = a.zIndex() || 0;
        const bZ = b.zIndex() || 0;
        return aZ - bZ;
    });
    nodes.forEach(n => n.moveToTop());

    // Remove thin full-width separators that can appear as artifacts
    // (e.g., editor-drawn horizontal rules or placeholder borders). We look
    // for Line nodes that are nearly horizontal and span most of the page,
    // or Rect nodes with a stroke that are very wide but very short.
    try {
        const childrenCopy = layer.children.slice();
        // Debug: optionally log candidate separator nodes when window.__PDF_DEBUG__ is true
        const debug = !!(typeof window !== 'undefined' && window.__PDF_DEBUG__);
        childrenCopy.forEach((node) => {
            const attrs = (typeof node.getAttrs === 'function') ? node.getAttrs() : (node.attrs || {});
            // Konva Line: points array [x1,y1,x2,y2,...]
            if (node.className === 'Line' && Array.isArray(attrs.points) && attrs.points.length >= 4) {
                const pts = attrs.points;
                const ys = [];
                for (let i = 1; i < pts.length; i += 2) ys.push(pts[i]);
                const minY = Math.min.apply(null, ys);
                const maxY = Math.max.apply(null, ys);
                const span = Math.abs(pts[pts.length - 2] - pts[0]);
                // Relaxed thresholds: allow up to 3px variance and 85% span
                if (debug) console.log('PDF Export: Line node', { pts, minY, maxY, span });
                if ((maxY - minY) <= 3 && span >= (width * 0.85)) {
                    try { node.destroy(); } catch (e) { }
                }
            }

            // Konva Rect used as a thin stroked separator
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

        // Also remove any thin full-width filled Rects (common separators)
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
        // swallow errors — this cleanup is best-effort
    }

    layer.draw();

    // Final sanitization: clear stroke attributes on any Rect/Line/Image nodes
    // (including inside Groups) to ensure no borders are rendered in the PDF.
    try {
        const sanitize = (node) => {
            try {
                const cls = node.getClassName ? node.getClassName() : (node.className || '');
                if (cls === 'Rect' || cls === 'Image' || cls === 'Line') {
                    if (typeof node.stroke === 'function') node.stroke(null);
                    if (typeof node.strokeWidth === 'function') node.strokeWidth(0);
                    // for older attr-based nodes
                    try { node.setAttr && node.setAttr('stroke', null); } catch (e) { }
                    try { node.setAttr && node.setAttr('strokeWidth', 0); } catch (e) { }
                }
            } catch (e) { }
            // recurse into children if any
            try {
                if (typeof node.getChildren === 'function') {
                    const children = node.getChildren().toArray ? node.getChildren().toArray() : [];
                    for (const c of children) sanitize(c);
                }
            } catch (e) { }
        };

        const all = layer.children.slice();
        all.forEach(n => sanitize(n));
        layer.draw();
    } catch (e) {
        // best-effort
    }

    // Convert to PDF
    return new Promise((resolve) => {
        setTimeout(() => {
            const dataUrl = stage.toDataURL({ pixelRatio: 2 }); // High-res
            // A4: 210 x 297 mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (height * pdfWidth) / width;

            // Add a tiny bleed to avoid 1px edge lines from canvas scaling
            pdf.addImage(dataUrl, 'PNG', -0.5, -0.5, pdfWidth + 1, pdfHeight + 1);
            pdf.save(filename);

            // cleanup
            document.body.removeChild(container);
            resolve();
        }, 500); // 500ms delay to ensure all images and fonts drew properly
    });
}
