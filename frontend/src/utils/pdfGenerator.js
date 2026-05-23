import Konva from 'konva';
import { jsPDF } from 'jspdf';
import wordcut from 'wordcut';
import { formatChartLabel } from '@/utils/chartLabel';

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

    const templateRoot = templateJSON && templateJSON.content && Array.isArray(templateJSON.content.elements)
        ? templateJSON.content
        : templateJSON;
    const elements = Array.isArray(templateRoot && templateRoot.elements) ? templateRoot.elements : [];

    const width = templateRoot.width || templateJSON.width || 794;
    const height = templateRoot.height || templateJSON.height || 1123;

    const stage = new Konva.Stage({
        container: container,
        width: width,
        height: height
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Initialize third-party Thai segmenter if available
    try {
        if (typeof wordcut !== 'undefined' && wordcut && typeof wordcut.init === 'function') {
            try { wordcut.init(); } catch (e) { /* ignore init errors */ }
        }
    } catch (e) { /* ignore */ }

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
    const preloads = elements.map(async (el) => {
        if (el.className === 'Image') {
            const attrs = el.attrs || {};
            // Support preloading of chart images passed via dataMap.__chartImages
            if (attrs.name === 'graph-placeholder') {
                const graphType = attrs.graphType || '';
                const cleanKey = graphType.replace(/Graph_/g, '').toLowerCase();
                const chartImages = dataMap && dataMap.__chartImages ? dataMap.__chartImages : null;
                let imgSrc = null;
                if (chartImages) {
                    if (cleanKey.indexOf('general') >= 0 && (chartImages.general || chartImages.General)) imgSrc = chartImages.general || chartImages.General;
                    else if (cleanKey.indexOf('specific') >= 0 && (chartImages.specific || chartImages.Specific)) imgSrc = chartImages.specific || chartImages.Specific;
                    else if (chartImages[cleanKey]) imgSrc = chartImages[cleanKey];
                }
                if (imgSrc) {
                    el._loadedImage = await loadImage(imgSrc);
                    return el;
                }
            }

            if (el.src && el.src !== '') {
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
        }
        // Debug output to help troubleshoot duplicated headers
        try {
            if (typeof window !== 'undefined' && window.__PDF_DEBUG__) {
                console.log('PDF Export: suggestion-table attrs:', attrs);
                console.log('PDF Export: computed columns:', columns);
            }
        } catch (e) { }
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

    // Helper to measure text width accurately using a hidden canvas
    const measureTextWidth = (text, fontSize, fontFamily) => {
        if (typeof document === 'undefined') return text.length * (fontSize * 0.5); // Fallback for non-browser
        const canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'));
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontSize}px ${fontFamily}`;
        return ctx.measureText(text).width;
    };

    // Manual wrapping for Thai text (and others)
    const wrapTextManual = (text, maxWidth, fontSize, fontFamily) => {
        if (!text || typeof text !== 'string') return text;
        // Prefer third-party word segmentation when available for Thai
        let segmentsArr = null;
        try {
            if (wordcut && typeof wordcut.cut === 'function') {
                try {
                    // wordcut.cut may return words separated by '|' or spaces.
                    // Normalize any '|' to spaces before splitting.
                    let spaced = wordcut.cut(text || '') || '';
                    spaced = String(spaced).replace(/\|/g, ' ');
                    segmentsArr = spaced.split(/\s+/).filter(Boolean);
                } catch (e) {
                    segmentsArr = null;
                }
            }
        } catch (e) { segmentsArr = null; }

        if (!segmentsArr) {
            if (typeof Intl === 'undefined' || !Intl.Segmenter) return text;
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            segmentsArr = Array.from(segmenter.segment(text)).map(s => s.segment);
        }

        // Use dynamic programming to minimize raggedness (optimal line breaks)
        // Build words array (preserve existing newlines as separate tokens)
        const words = [];
        for (const w of segmentsArr) {
            if (w === '\n') {
                words.push('\n');
            } else {
                words.push(w);
            }
        }

        // Precompute widths for any run of words (i..j)
        const n = words.length;
        const INF = 1e9;
        const widths = Array.from({ length: n }, () => Array(n).fill(INF));
        for (let i = 0; i < n; i++) {
            if (words[i] === '\n') { widths[i][i] = 0; continue; }
            let acc = '';
            for (let j = i; j < n; j++) {
                if (words[j] === '\n') break;
                acc += words[j];
                widths[i][j] = measureTextWidth(acc, fontSize, fontFamily);
            }
        }

        // DP: cost[k] = minimal badness for words[0..k-1]
        const cost = Array(n + 1).fill(INF);
        const prev = Array(n + 1).fill(-1);
        cost[0] = 0;

        const badness = (w) => Math.pow(Math.max(0, maxWidth - w), 2);

        for (let i = 0; i < n; i++) {
            if (cost[i] >= INF) continue;
            if (words[i] === '\n') {
                if (cost[i + 1] > cost[i]) { cost[i + 1] = cost[i]; prev[i + 1] = i; }
                continue;
            }
            for (let j = i; j < n; j++) {
                if (words[j] === '\n') { // treat newline as line break
                    if (cost[j + 1] > cost[i]) { cost[j + 1] = cost[i]; prev[j + 1] = i; }
                    break;
                }
                const w = widths[i][j];
                if (w === INF || w > maxWidth) break;
                const c = cost[i] + badness(w);
                if (c < cost[j + 1]) { cost[j + 1] = c; prev[j + 1] = i; }
            }
        }

        // Reconstruct lines
        const linesArr = [];
        let idx = n;
        const splits = [];
        while (idx > 0) {
            const p = prev[idx];
            if (p === -1) { // fallback: greedy
                let cur = '';
                for (let k = 0; k < n; k++) {
                    if (words[k] === '\n') { linesArr.push(cur); cur = ''; continue; }
                    const test = cur + words[k];
                    if (measureTextWidth(test, fontSize, fontFamily) > maxWidth && cur !== '') { linesArr.push(cur); cur = words[k]; } else { cur = test; }
                }
                if (cur) linesArr.push(cur);
                return linesArr.join('\n');
            }
            splits.push([p, idx]);
            idx = p;
        }
        splits.reverse();
        for (const [s, e] of splits) {
            let line = '';
            for (let k = s; k < e; k++) {
                if (words[k] === '\n') continue;
                line += words[k];
            }
            linesArr.push(line);
        }
        return linesArr.join('\n');
    };

    // Helper to allow Thai text to wrap in Konva (legacy fallback if needed)
    const addThaiWordBreaks = (text) => {
        if (!text || typeof text !== 'string') return text;

        try {
            if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
                const segments = segmenter.segment(text);
                let result = '';
                for (const segment of segments) {
                    result += segment.segment + '\u200B';
                }
                return result;
            }
        } catch (e) { }

        // If segmenter is not available, return original text to avoid ugly mid-character breaks
        return text;
    };

    const applyZIndex = (node, attrs) => {
        if (typeof attrs.zIndex === 'number') {
            node.zIndex(attrs.zIndex);
        }
    };

    const getVisibleTextWidth = (node) => {
        try {
            const attrs = node && typeof node.getAttrs === 'function' ? node.getAttrs() : {};
            const text = String((typeof node.text === 'function' ? node.text() : attrs.text) || '');
            if (!text) return 0;
            const fontSize = Number((typeof node.fontSize === 'function' ? node.fontSize() : attrs.fontSize) || 16);
            const fontFamily = String((typeof node.fontFamily === 'function' ? node.fontFamily() : attrs.fontFamily) || 'Arial');
            const padding = Number((typeof node.padding === 'function' ? node.padding() : attrs.padding) || 0);
            const lines = text.split(/\r?\n/);
            const widestLine = lines.reduce((max, line) => Math.max(max, measureTextWidth(String(line || ''), fontSize, fontFamily)), 0);
            const scaleX = Number((typeof node.scaleX === 'function' ? node.scaleX() : attrs.scaleX) || 1);
            return (widestLine + padding * 2) * Math.max(1, scaleX);
        } catch (err) {
            return 0;
        }
    };

    const renderedNodesByOrder = new Map();

    const applyManualLinkedVariableExportLayout = () => {
        const gap = 20;
        const linkedSources = [];

        renderedNodesByOrder.forEach((node) => {
            try {
                const attrs = node && typeof node.getAttrs === 'function' ? node.getAttrs() : null;
                if (!attrs) return;
                if (attrs.linkedConnectionMode !== 'manual') return;
                if (typeof attrs.linkedTargetCreatedOrder === 'undefined' || attrs.linkedTargetCreatedOrder === null) return;
                linkedSources.push(node);
            } catch (err) { /* ignore */ }
        });

        linkedSources.sort((a, b) => {
            const aOrder = Number(a.getAttr && a.getAttr('createdOrder')) || 0;
            const bOrder = Number(b.getAttr && b.getAttr('createdOrder')) || 0;
            return aOrder - bOrder;
        });

        linkedSources.forEach((sourceNode) => {
            try {
                const sourceAttrs = sourceNode.getAttrs ? sourceNode.getAttrs() : {};
                const targetOrder = Number(sourceAttrs.linkedTargetCreatedOrder);
                if (!Number.isFinite(targetOrder)) return;

                const targetNode = renderedNodesByOrder.get(targetOrder);
                if (!targetNode) return;

                const sourceX = typeof sourceNode.x === 'function' ? sourceNode.x() : Number(sourceAttrs.x || 0);
                const sourceY = typeof sourceNode.y === 'function' ? sourceNode.y() : Number(sourceAttrs.y || 0);
                const sourceBox = typeof sourceNode.getClientRect === 'function' ? sourceNode.getClientRect({ skipTransform: false }) : null;
                const targetBox = typeof targetNode.getClientRect === 'function' ? targetNode.getClientRect({ skipTransform: false }) : null;
                if (!sourceBox || !targetBox) return;

                const sourceVisibleWidth = Math.max(0, getVisibleTextWidth(sourceNode));
                const targetVisibleWidth = Math.max(0, getVisibleTextWidth(targetNode));
                const shouldPlaceRight = targetBox.x >= sourceBox.x;
                const nextX = shouldPlaceRight
                    ? Math.max(0, Math.round(sourceBox.x + (sourceVisibleWidth || sourceBox.width) + gap))
                    : Math.max(0, Math.round(sourceBox.x - (targetVisibleWidth || targetBox.width) - gap));
                const nextY = Math.round(sourceY);

                if (typeof targetNode.position === 'function') {
                    targetNode.position({ x: nextX, y: nextY });
                } else {
                    if (typeof targetNode.x === 'function') targetNode.x(nextX);
                    if (typeof targetNode.y === 'function') targetNode.y(nextY);
                }
            } catch (err) { /* ignore */ }
        });
    };

    const lookupNestedValue = (source, path) => {
        if (!source || !path) return undefined;
        if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];

        const parts = String(path).split('.').filter(Boolean);
        if (!parts.length) return undefined;

        let current = source;
        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            if (Object.prototype.hasOwnProperty.call(current, part)) {
                current = current[part];
                continue;
            }
            const compactPart = part.replace(/\s+/g, '');
            if (compactPart !== part && Object.prototype.hasOwnProperty.call(current, compactPart)) {
                current = current[compactPart];
                continue;
            }
            return undefined;
        }

        return current;
    };

    const normalizeScore = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return null;
        if (num <= 5) return Math.max(0, Math.min(1, num / 5));
        if (num <= 10) return Math.max(0, Math.min(1, num / 10));
        if (num <= 100) return Math.max(0, Math.min(1, num / 100));
        return Math.max(0, Math.min(1, num));
    };

    const valueToPercent = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return 0;
        if (num >= 0 && num < 1) return Math.round(num * 100);
        if (num >= 1 && num <= 5) return Math.round((num / 5) * 100);
        if (num > 5 && num <= 10) return Math.round((num / 10) * 100);
        if (num >= 0 && num <= 100) return Math.round(num);
        return Math.max(0, Math.min(100, Math.round(num)));
    };

    const getPercentForItem = (item) => {
        if (item === undefined || item === null) return 0;
        if (typeof item === 'number' || (typeof item === 'string' && item.trim() !== '' && !isNaN(item))) {
            return valueToPercent(item);
        }
        if (typeof item === 'object') {
            if (item.percentage !== undefined && item.percentage !== null) return Number(item.percentage);
            if (item.score !== undefined && item.score !== null) return valueToPercent(item.score);
            if (item.value !== undefined && item.value !== null) return valueToPercent(item.value);
        }
        return 0;
    };

    const normalizeTextForMatch = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();

    const findTemplateTextAttrs = (templateChildren, matchText) => {
        if (!Array.isArray(templateChildren) || !templateChildren.length) return null;
        const needle = normalizeTextForMatch(matchText);
        if (!needle) return null;

        const exact = templateChildren.find((child) => {
            const attrs = child && child.attrs ? child.attrs : null;
            if (!attrs || child.className !== 'Text') return false;
            return normalizeTextForMatch(attrs.text) === needle;
        });
        if (exact && exact.attrs) return Object.assign({}, exact.attrs);

        const partial = templateChildren.find((child) => {
            const attrs = child && child.attrs ? child.attrs : null;
            if (!attrs || child.className !== 'Text') return false;
            const hay = normalizeTextForMatch(attrs.text);
            return hay && (hay.includes(needle) || needle.includes(hay));
        });
        return partial && partial.attrs ? Object.assign({}, partial.attrs) : null;
    };

    const getRadarLabelTemplateAttrs = (templateChildren, title) => {
        if (!Array.isArray(templateChildren) || !templateChildren.length) return [];
        const skipTexts = new Set([
            normalizeTextForMatch(title),
            normalizeTextForMatch('You'),
            normalizeTextForMatch('Average'),
            normalizeTextForMatch('20'),
            normalizeTextForMatch('40'),
            normalizeTextForMatch('60'),
            normalizeTextForMatch('80'),
            normalizeTextForMatch('100')
        ]);

        return templateChildren
            .filter((child) => {
                const attrs = child && child.attrs ? child.attrs : null;
                if (!attrs || child.className !== 'Text') return false;
                const text = normalizeTextForMatch(attrs.text);
                if (!text || skipTexts.has(text)) return false;
                if (attrs.placeholderType) return false;
                if (typeof attrs.width === 'number' && attrs.width < 60) return false;
                if (attrs.fontStyle && String(attrs.fontStyle).toLowerCase() !== 'bold') return false;
                return true;
            })
            .map((child) => Object.assign({}, child.attrs || {}));
    };

    // Fixed outward margin (pixels) to ensure radar labels sit outside the polygon
    const RADAR_LABEL_OUTER_MARGIN = 40;



    const addRadarGraph = (attrs, graphData, items, title, templateChildren = []) => {
        const x = attrs.x || 0;
        const y = attrs.y || 0;
        const scaleX = attrs.scaleX || 1;
        const scaleY = attrs.scaleY || 1;
        const rotation = attrs.rotation || 0;
        const width = attrs.width || 360;
        const height = attrs.height || 260;
        const group = new Konva.Group({ x, y, scaleX, scaleY, rotation, name: 'graph-placeholder', graphType: attrs.graphType });

        // Try to find title attrs by the localized title first; if not found,
        // fall back to canonical English titles so templates authored in English
        // still provide the intended font size/position for localized titles.
        const titleAttrs = (() => {
            let t = findTemplateTextAttrs(templateChildren, title);
            if (!t) {
                const ttl = String(title || '').toLowerCase();
                let canonical = null;
                if (ttl.indexOf('general') >= 0 || ttl.indexOf('ทักษะทั่วไป') >= 0) canonical = 'General Competencies';
                else if (ttl.indexOf('specific') >= 0 || ttl.indexOf('ทักษะเฉพาะ') >= 0) canonical = 'Specific Competencies';
                if (canonical) t = findTemplateTextAttrs(templateChildren, canonical) || t;
            }
            return t || {};
        })();
        const layoutScale = Math.max(0.55, Math.min(1.25, Math.min(width / 600, height / 450)));
        const pdfLang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
        const isThaiLang = String(pdfLang).toLowerCase().startsWith('th');

        group.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: '#ffffff' }));
        group.add(new Konva.Text({
            x: typeof titleAttrs.x === 'number' ? titleAttrs.x : 10,
            y: typeof titleAttrs.y === 'number' ? titleAttrs.y : 8,
            text: title || 'Radar',
            fontSize: titleAttrs.fontSize || 16,
            fontFamily: titleAttrs.fontFamily || 'Inter, Arial',
            fontStyle: titleAttrs.fontStyle || '600',
            fill: titleAttrs.fill || '#1e293b',
            width: typeof titleAttrs.width === 'number' ? titleAttrs.width : undefined,
            align: titleAttrs.align || 'left'
        }));

        const labels = (graphData.labels && graphData.labels.length)
            ? graphData.labels
            : items.map((item) => item.name || item.label || '');
        const radarLabelTemplateAttrsFromTemplate = getRadarLabelTemplateAttrs(templateChildren, title);
        let radarLabelTemplateAttrs = radarLabelTemplateAttrsFromTemplate || [];
        const sides = Math.max(3, labels.length);
        const centerX = width / 2;
        const radius = Math.max(40, Math.min(width, height) * 0.34 * layoutScale);
        const centerY = Math.round(height * 0.72);
        const labelOffsetX = Math.max(12, Math.round(25 * layoutScale));
        const labelOffsetY = Math.max(10, Math.round(20 * layoutScale));
        const labelFontSize = Math.max(10, Math.round(12 * layoutScale));
        const labelWidth = Math.max(70, Math.round(120 * layoutScale));

        // If template contains positioned text nodes around the radar, map them by angular order
        try {
            if (Array.isArray(templateChildren) && templateChildren.length) {
                const positioned = templateChildren
                    .filter((child) => child && child.attrs && child.className === 'Text')
                    .map((child) => {
                        const attrs = Object.assign({}, child.attrs || {});
                        if (typeof attrs.x !== 'number' || typeof attrs.y !== 'number') return null;
                        const w = typeof attrs.width === 'number' ? attrs.width : labelWidth;
                        const h = typeof attrs.fontSize === 'number' ? attrs.fontSize : labelFontSize;
                        const cx = attrs.x + (w / 2);
                        const cy = attrs.y + (h / 2);
                        const dx = cx - centerX;
                        const dy = cy - centerY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx);
                        return { attrs, dist, angle };
                    })
                    .filter(Boolean)
                    .filter((o) => o.dist > (radius * 0.9) && o.dist < (radius * 1.3));

                positioned.sort((a, b) => {
                    const na = (a.angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
                    const nb = (b.angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
                    return na - nb;
                });

                const positionedAttrs = positioned.map((p) => p.attrs);
                if (positionedAttrs.length === sides) {
                    radarLabelTemplateAttrs = positionedAttrs.slice(0, sides);
                }
            }
        } catch (e) {
            // ignore and fallback to original template attrs
        }

        // If the template contains text nodes that match the English labels exactly,
        // prefer those attrs (positions + font sizes) and use them only when all labels match.
        try {
            const englishLabels = items.map((item) => (item && (item.name || item.label)) ? String(item.name || item.label || '') : '').slice(0, Math.max(0, (labels && labels.length) ? labels.length : 0));
            const engMatched = englishLabels.map((lbl) => findTemplateTextAttrs(templateChildren, lbl) || null);
            // If any English label matches a template node, prefer those attrs for the corresponding indices.
            if (engMatched && engMatched.some((a) => a)) {
                radarLabelTemplateAttrs = engMatched.slice(0, (labels ? labels.length : 0)).map(a => a ? Object.assign({}, a) : null);
            }
        } catch (e) {
            // ignore and keep previous mapping
        }
        // For Specific Competencies: map each label index to the nearest positioned
        // template text node by angular distance so we use template positions per-index.
        try {
            const ttl = String(title || '').toLowerCase();
            const isSpecificTitle = ttl.indexOf('specific') >= 0 || ttl.indexOf('ทักษะเฉพาะ') >= 0;
            if (isSpecificTitle && Array.isArray(templateChildren) && templateChildren.length) {
                const positionedAll = templateChildren
                    .filter((child) => child && child.attrs && child.className === 'Text')
                    .map((child) => {
                        const attrs = Object.assign({}, child.attrs || {});
                        if (typeof attrs.x !== 'number' || typeof attrs.y !== 'number') return null;
                        const w = typeof attrs.width === 'number' ? attrs.width : labelWidth;
                        const h = typeof attrs.fontSize === 'number' ? attrs.fontSize : labelFontSize;
                        const cx = attrs.x + (w / 2);
                        const cy = attrs.y + (h / 2);
                        const dx = cx - centerX;
                        const dy = cy - centerY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const angle = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);
                        return { attrs, dist, angle };
                    })
                    .filter(Boolean)
                    .filter((o) => o.dist > (radius * 0.6) && o.dist < (radius * 1.6));

                if (positionedAll.length) {
                    const used = new Array(positionedAll.length).fill(false);
                    for (let i = 0; i < sides; i++) {
                        const idealAngle = ((Math.PI * 2 * i) / sides - Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
                        let bestIdx = -1;
                        let bestDiff = Infinity;
                        for (let j = 0; j < positionedAll.length; j++) {
                            if (used[j]) continue;
                            const a = positionedAll[j].angle;
                            let diff = Math.abs(a - idealAngle);
                            if (diff > Math.PI) diff = 2 * Math.PI - diff;
                            if (diff < bestDiff) {
                                bestDiff = diff;
                                bestIdx = j;
                            }
                        }
                        if (bestIdx >= 0) {
                            used[bestIdx] = true;
                            radarLabelTemplateAttrs[i] = Object.assign({}, positionedAll[bestIdx].attrs);
                        }
                    }
                }
            }
        } catch (e) {
            // ignore
        }
        // If this is the general competencies radar, prefer the canonical English labels
        try {
            const titleNorm = String(title || '').toLowerCase();
            const isGeneralTitle = titleNorm.indexOf('general') >= 0 || titleNorm.indexOf('ทักษะทั่วไป') >= 0;
            if (isGeneralTitle) {
                const DEFAULT_GENERAL_LABELS = [
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
                const engList = DEFAULT_GENERAL_LABELS.slice(0, sides);
                const engMatched = engList.map((lbl) => findTemplateTextAttrs(templateChildren, lbl) || null);
                // override per-index when a matching english attr exists
                engMatched.forEach((a, idx) => {
                    if (a) {
                        radarLabelTemplateAttrs[idx] = Object.assign({}, a);
                    }
                });
            }
        } catch (e) {
            // ignore
        }
        // processedLabels are generated per-label below because width/fontSize
        // may come from template attrs — we need those values to wrap Thai correctly.

        for (let r = 1; r <= 5; r++) {
            const currentR = (radius / 5) * r;
            const points = [];
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                points.push(centerX + currentR * Math.cos(angle), centerY + currentR * Math.sin(angle));
            }
            group.add(new Konva.Line({ points, closed: true, stroke: '#e2e8f0', strokeWidth: 1 }));
        }

        for (let r = 1; r <= 5; r++) {
            const val = r * 20;
            const tickY = centerY - (radius / 5) * r;
            const tickAttrs = findTemplateTextAttrs(templateChildren, String(val)) || {};
            group.add(new Konva.Text({
                x: typeof tickAttrs.x === 'number' ? tickAttrs.x : centerX - 16,
                y: typeof tickAttrs.y === 'number' ? tickAttrs.y : (tickY - 6),
                text: String(val),
                fontSize: tickAttrs.fontSize || 10,
                fontFamily: tickAttrs.fontFamily || 'Inter, Arial',
                fill: tickAttrs.fill || '#64748b',
                width: typeof tickAttrs.width === 'number' ? tickAttrs.width : 32,
                align: tickAttrs.align || 'center'
            }));
        }

        const values = (graphData.you && graphData.you.length) ? graphData.you : items.map((item) => getPercentForItem(item));
        const avgValues = (graphData.average && graphData.average.length)
            ? graphData.average
            : items.map((item) => {
                if (item && item.average !== undefined && item.average !== null) {
                    return (typeof item.average === 'number') ? Number(item.average) : valueToPercent(item.average);
                }
                return Math.max(0, getPercentForItem(item) - 10);
            });

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

        labels.slice(0, sides).forEach((origLabel, i) => {
            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
            const idealX = centerX + (radius + labelOffsetX) * Math.cos(angle);
            const idealY = centerY + (radius + labelOffsetY) * Math.sin(angle);
            const cos = Math.cos(angle);
            const defaultAlign = Math.abs(cos) < 0.25 ? 'center' : (cos > 0 ? 'left' : 'right');
            const labelAttrs = radarLabelTemplateAttrs[i] || findTemplateTextAttrs(templateChildren, origLabel) || {};
            const resolvedWidth = typeof labelAttrs.width === 'number' ? labelAttrs.width : labelWidth;
            const resolvedAlign = labelAttrs.align || defaultAlign;
            const fontSz = labelAttrs.fontSize || labelFontSize;
            const fontFamily = labelAttrs.fontFamily || 'Inter, Arial';

            // Determine label text with proper Thai wrapping when needed
            const formattedLabel = formatChartLabel(origLabel, Math.max(18, Math.floor(resolvedWidth / Math.max(1, fontSz)) + 4), pdfLang);
            let labelText = Array.isArray(formattedLabel) ? formattedLabel.join('\n') : String(formattedLabel || '');

            const lineH = labelAttrs.lineHeight || 1;
            const lines = (labelText || '').split('\n').length || 1;
            const labelHeight = Math.round(lines * fontSz * lineH);

            // compute resolvedX/Y (use saved if present, otherwise ideal)
            const hasTemplatePosition = (typeof labelAttrs.x === 'number') && (typeof labelAttrs.y === 'number');
            let resolvedX = (resolvedAlign === 'center' ? idealX - (resolvedWidth / 2) : (resolvedAlign === 'left' ? idealX : idealX - resolvedWidth));
            let resolvedY = (idealY - Math.round(isThaiLang ? 10 : (8 * layoutScale)));

            if (hasTemplatePosition) {
                // Use template's exact position/size/font when both x and y are provided
                resolvedX = labelAttrs.x;
                resolvedY = labelAttrs.y;
            }

            // compute label center and ensure it is outside the radar area (avoid overlap)
            // For Thai multiline labels, always allow an outward nudge even when template
            // coordinates exist, because the English template y-position is usually only
            // valid for a single line.
            const allowNudge = !hasTemplatePosition || (isThaiLang && labelHeight > fontSz * 1.1);
            if (allowNudge) {
                const labelCenterX = resolvedX + (resolvedWidth / 2);
                const labelCenterY = resolvedY + (labelHeight / 2);
                const dx = labelCenterX - centerX;
                const dy = labelCenterY - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Include half label height so text clears the polygon edge
                const minDist = radius + RADAR_LABEL_OUTER_MARGIN + Math.max(0, Math.round(labelHeight / 3));
                if (dist < minDist) {
                    // nudge outward along angle to sit just outside the polygon
                    const targetDist = minDist;
                    const newCenterX = centerX + targetDist * Math.cos(angle);
                    const newCenterY = centerY + targetDist * Math.sin(angle);
                    // rederive resolvedX/Y from new center (resolvedX is left coordinate)
                    resolvedX = (resolvedAlign === 'center') ? (newCenterX - resolvedWidth / 2) : (resolvedAlign === 'left' ? newCenterX : (newCenterX - resolvedWidth));
                    resolvedY = newCenterY - labelHeight / 2;
                }
            }

            group.add(new Konva.Text({
                x: resolvedX,
                y: resolvedY,
                text: labelText,
                fontSize: fontSz,
                fontFamily,
                fill: labelAttrs.fill || '#475569',
                width: resolvedWidth,
                align: resolvedAlign,
                fontStyle: labelAttrs.fontStyle || 'bold',
                lineHeight: labelAttrs.lineHeight || undefined,
                wrap: labelAttrs.wrap || (isThaiLang ? 'none' : 'word')
            }));
        });

        const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
        const lblYou = String(lang).toLowerCase().startsWith('th') ? 'คุณ' : 'You';
        const lblAvg = String(lang).toLowerCase().startsWith('th') ? 'ค่าเฉลี่ย' : 'Average';
        const legendY = Math.round(50 * layoutScale);
        group.add(new Konva.Circle({ x: centerX - 40, y: legendY, radius: 4, fill: '#7c3aed' }));
        const youLegendAttrs = findTemplateTextAttrs(templateChildren, lblYou) || {};
        group.add(new Konva.Text({
            x: typeof youLegendAttrs.x === 'number' ? youLegendAttrs.x : centerX - 30,
            y: typeof youLegendAttrs.y === 'number' ? youLegendAttrs.y : legendY - 5,
            text: lblYou,
            fontSize: youLegendAttrs.fontSize || (isThaiLang ? 10 : 11),
            fontFamily: youLegendAttrs.fontFamily || 'Inter, Arial',
            fill: youLegendAttrs.fill || '#64748b'
        }));
        group.add(new Konva.Circle({ x: centerX + 20, y: legendY, radius: 4, fill: '#fb7185' }));
        const avgLegendAttrs = findTemplateTextAttrs(templateChildren, lblAvg) || {};
        group.add(new Konva.Text({
            x: typeof avgLegendAttrs.x === 'number' ? avgLegendAttrs.x : centerX + 30,
            y: typeof avgLegendAttrs.y === 'number' ? avgLegendAttrs.y : legendY - 5,
            text: lblAvg,
            fontSize: avgLegendAttrs.fontSize || (isThaiLang ? 10 : 11),
            fontFamily: avgLegendAttrs.fontFamily || 'Inter, Arial',
            fill: avgLegendAttrs.fill || '#64748b'
        }));

        layer.add(group);
        applyZIndex(group, attrs);
    };

    const addBarGraph = (attrs, items, title, templateChildren = []) => {
        const x = attrs.x || 0;
        const y = attrs.y || 0;
        const scaleX = attrs.scaleX || 1;
        const scaleY = attrs.scaleY || 1;
        const rotation = attrs.rotation || 0;
        const width = attrs.width || 360;
        const height = attrs.height || 220;
        const group = new Konva.Group({ x, y, scaleX, scaleY, rotation, name: 'graph-placeholder', graphType: attrs.graphType });

        const titleAttrs = findTemplateTextAttrs(templateChildren, title) || {};

        group.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: '#ffffff' }));
        group.add(new Konva.Text({
            x: typeof titleAttrs.x === 'number' ? titleAttrs.x : 10,
            y: typeof titleAttrs.y === 'number' ? titleAttrs.y : 8,
            text: title || 'Bar',
            fontSize: titleAttrs.fontSize || 16,
            fontFamily: titleAttrs.fontFamily || 'Inter, Arial',
            fontStyle: titleAttrs.fontStyle || '600',
            fill: titleAttrs.fill || '#1e293b',
            width: typeof titleAttrs.width === 'number' ? titleAttrs.width : undefined,
            align: titleAttrs.align || 'left'
        }));

        const rows = items.length ? items : [{ name: 'Skill', score: 80 }];
        const barX = 10;
        const barW = width - 20;
        const rowH = Math.max(24, Math.floor((height - 40) / rows.length));
        let currentY = 36;

        rows.forEach((item) => {
            const label = item.name || item.label || 'Skill';
            const ratio = normalizeScore(getPercentForItem(item)) || 0;

            const labelAttrs = findTemplateTextAttrs(templateChildren, label) || {};
            group.add(new Konva.Text({
                x: typeof labelAttrs.x === 'number' ? labelAttrs.x : barX,
                y: typeof labelAttrs.y === 'number' ? labelAttrs.y : (currentY - 2),
                text: String(label),
                fontSize: labelAttrs.fontSize || 11,
                fontFamily: labelAttrs.fontFamily || 'Inter, Arial',
                fill: labelAttrs.fill || '#475569',
                fontStyle: labelAttrs.fontStyle || undefined,
                width: typeof labelAttrs.width === 'number' ? labelAttrs.width : undefined,
                align: labelAttrs.align || 'left'
            }));
            group.add(new Konva.Text({ x: barX + barW - 40, y: currentY - 2, text: Math.round(ratio * 100) + '%', fontSize: 11, fontFamily: 'Inter, Arial', fill: '#475569', align: 'right', width: 40 }));
            group.add(new Konva.Rect({ x: barX, y: currentY + 12, width: barW, height: 6, fill: '#e2e8f0', cornerRadius: 3 }));
            group.add(new Konva.Rect({ x: barX, y: currentY + 12, width: Math.max(4, barW * ratio), height: 6, fill: '#dc2626', cornerRadius: 3 }));
            currentY += rowH;
        });

        layer.add(group);
        applyZIndex(group, attrs);
    };

    const renderGraphPlaceholder = (attrs) => {
        const graphType = attrs.graphType || attrs.variableName || '';
        const graphKind = String(attrs.graphKind || '').toLowerCase();
        const isRadar = graphKind === 'radar' || String(graphType).includes('Radar');
        const cleanKey = String(graphType).replace(/Graph_/g, '');
        const isGeneral = String(attrs.graphScope || '').toLowerCase() === 'general' || cleanKey.includes('General');

        const fallbackItems = isGeneral
            ? (dataMap.GeneralCompetencies || dataMap.generalCompetencies || [])
            : (dataMap.SpecificCompetencies || dataMap.specificCompetencies || []);

        const pData = {
            labels: fallbackItems.map((i) => i.name),
            datasets: [{
                label: 'You', data: fallbackItems.map((i) => getPercentForItem(i))
            }, {
                label: 'Average', data: fallbackItems.map((i) => (i && i.average !== undefined && i.average !== null)
                    ? (typeof i.average === 'number' ? Number(i.average) : valueToPercent(i.average))
                    : Math.max(0, getPercentForItem(i) - 10))
            }]
        };

        let title = isGeneral ? 'General Competencies' : 'Specific Competencies';
        const lang = dataMap.__language || 'en';
        if (lang === 'th') {
            title = isGeneral ? 'ทักษะทั่วไป' : 'ทักษะเฉพาะทาง';
            pData.datasets[0].label = 'คุณ';
            pData.datasets[1].label = 'ค่าเฉลี่ย';
        }

        const templateChildren = Array.isArray(attrs.children) ? attrs.children : [];

        if (isRadar) {
            addRadarGraph(attrs, pData, fallbackItems, title, templateChildren);
        } else {
            addBarGraph(attrs, fallbackItems, title, templateChildren);
        }
    };

    const addCompetencyTable = (attrs, items, title, placeholderChildren) => {
        const group = new Konva.Group({
            x: attrs.x || 0,
            y: attrs.y || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            rotation: attrs.rotation || 0
        });

        // Try to extract styles from attrs or template placeholder if available
        let titleFontSize = 20;
        let contentFontSize = attrs.fontSize || 14;
        let contentFill = attrs.fill || '#475569';
        let contentFontFamily = attrs.fontFamily || 'Inter, Arial';
        let contentFontStyle = attrs.fontStyle || 'normal';
        let titleFill = attrs.fill || '#1e293b';

        if (Array.isArray(placeholderChildren) && placeholderChildren.length) {
            placeholderChildren.forEach(child => {
                const cAttrs = child.attrs || {};
                if (cAttrs.text === title || cAttrs.text === 'Score') {
                    titleFontSize = cAttrs.fontSize || titleFontSize;
                    titleFill = cAttrs.fill || titleFill;
                } else if (cAttrs.text === 'X.X' || (cAttrs.fontSize && cAttrs.fontSize < 18)) {
                    contentFontSize = cAttrs.fontSize || contentFontSize;
                    contentFill = cAttrs.fill || contentFill;
                }
            });
        }

        const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
        let displayTitle = title || 'Competencies';
        let scoreLabel = 'Score';

        if (lang === 'th') {
            if (displayTitle === 'General Competencies') displayTitle = 'ทักษะทั่วไป';
            else if (displayTitle === 'Specific Competencies') displayTitle = 'ทักษะเฉพาะทาง';
            scoreLabel = 'คะแนน';
        }

        group.add(new Konva.Text({
            text: displayTitle,
            fontSize: titleFontSize,
            fontFamily: contentFontFamily,
            fontStyle: '600',
            fill: titleFill,
            y: 0
        }));

        group.add(new Konva.Text({
            text: scoreLabel,
            fontSize: titleFontSize,
            fontFamily: contentFontFamily,
            fontStyle: '600',
            fill: titleFill,
            x: 350,
            y: 0
        }));

        let currentY = 50;
        const groupX = attrs.x || 0;
        const maxTableWidth = 794 - groupX - 10;
        const nameWidth = Math.min(320, maxTableWidth - 80); // Ensure space for Score column

        items.forEach((item) => {
            const name = addThaiWordBreaks(item.name || 'N/A');
            const score = item.score !== undefined ? String(item.score) : 'X.X';

            const nameNode = new Konva.Text({
                text: name,
                fontSize: contentFontSize,
                fontFamily: contentFontFamily,
                fontStyle: contentFontStyle,
                fill: contentFill,
                y: currentY,
                width: nameWidth,
                wrap: 'word'
            });
            group.add(nameNode);

            const scoreNode = new Konva.Text({
                text: score,
                fontSize: contentFontSize,
                fontFamily: contentFontFamily,
                fontStyle: contentFontStyle,
                fill: contentFill,
                x: nameWidth + 30,
                y: currentY
            });
            group.add(scoreNode);

            const rowH = Math.max(nameNode.height(), scoreNode.height());
            // Match Editor spacing: use a larger multiplier for vertical separation
            currentY += Math.max(rowH + 8, contentFontSize * 2.8);
        });

        layer.add(group);
        applyZIndex(group, attrs);
        return group;
    };

    const addSuggestionTable = (attrs, suggestionsObj, placeholderChildren) => {
        const SUGGESTION_HEADER_CONTENT_GAP = 8;
        const SUGGESTION_ITEM_GAP = 2;
        const SUGGESTION_CONTENT_X = 20;
        const SUGGESTION_CONTENT_LINE_HEIGHT = 1.4;
        const group = new Konva.Group({
            x: attrs.x || 0,
            y: attrs.y || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            rotation: attrs.rotation || 0
        });

        let currentY = 0;

        const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';

        const ptToString = (pt) => {
            if (pt === null || pt === undefined) return '';
            if (typeof pt === 'string') {
                const trimmed = pt.trim();
                if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (parsed && typeof parsed === 'object') {
                            if (parsed[lang]) return String(parsed[lang]);
                            if (parsed.th || parsed.en) return String(parsed.th || parsed.en);
                        }
                    } catch (e) { }
                }
                return pt;
            }
            if (typeof pt === 'number') return String(pt);
            if (typeof pt === 'object') {
                // New structure support: { title: {th,en}, content: {th,en} }
                if (pt.title || pt.content) {
                    const t = (pt.title && (pt.title[lang] || pt.title.en || pt.title.th)) ? (pt.title[lang] || pt.title.en || pt.title.th) : '';
                    const c = (pt.content && (pt.content[lang] || pt.content.en || pt.content.th)) ? (pt.content[lang] || pt.content.en || pt.content.th) : '';
                    if (t && c) return String(t) + '\n' + String(c);
                    if (t) return String(t);
                    if (c) return String(c);
                }
                if (pt[lang]) return String(pt[lang]);
                if (pt.th || pt.en) return String(pt.th || pt.en);
                if (pt.text) return ptToString(pt.text);
                if (pt.value) {
                    if (typeof pt.value === 'string') {
                        const valTrimmed = pt.value.trim();
                        if (valTrimmed.startsWith('{') && valTrimmed.endsWith('}')) {
                            try {
                                const parsed = JSON.parse(valTrimmed);
                                if (parsed && typeof parsed === 'object') {
                                    if (parsed[lang]) return String(parsed[lang]);
                                    if (parsed.th || parsed.en) return String(parsed.th || parsed.en);
                                }
                            } catch (e) { }
                        }
                    }
                    return ptToString(pt.value);
                }
                if (Array.isArray(pt)) return pt.map(p => ptToString(p)).join(', ');
                if (pt.answer && pt.answer.value) return ptToString(pt.answer.value);
                return JSON.stringify(pt);
            }
            return String(pt);
        };

        const getName = (item, fallbackName) => {
            if (!item) return fallbackName || 'Advisor';
            if (typeof item === 'string') return item;
            if (item.name) {
                if (typeof item.name === 'string') return item.name;
                if (typeof item.name === 'object') return item.name.en || item.name.th || JSON.stringify(item.name);
                if (Array.isArray(item.name)) return item.name.join(' ');
            }
            if (item.advisor) return String(item.advisor);
            if (item.role && item.role !== 'Student') return String(item.role);
            return fallbackName || 'Advisor';
        };

        const normalize = (maybeItems, defaultName) => {
            const items = Array.isArray(maybeItems) ? maybeItems : (maybeItems ? [maybeItems] : []);
            if (!items.length) return [];

            const extractSuggestionPoints = (value) => {
                const points = [];
                const pushPoint = (input) => {
                    if (input == null) return;
                    if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
                        const text = ptToString(input).trim();
                        if (text) points.push(text);
                        return;
                    }
                    if (Array.isArray(input)) {
                        input.forEach(pushPoint);
                        return;
                    }
                    if (typeof input !== 'object') return;
                    if (Array.isArray(input.items)) {
                        input.items.forEach(pushPoint);
                        return;
                    }
                    if (input.content !== undefined) {
                        pushPoint(input.content);
                        return;
                    }
                    if (input.title && !input.items) {
                        pushPoint(input.title);
                        return;
                    }
                    if (input.answer && input.answer.value) {
                        pushPoint(input.answer.value);
                        return;
                    }
                    if (input.value !== undefined) {
                        pushPoint(input.value);
                        return;
                    }
                    const fallbackText = input[lang] || input.en || input.th || input.text || '';
                    if (fallbackText) points.push(String(fallbackText));
                };
                pushPoint(value);
                return points.filter(Boolean);
            };

            if (typeof items[0] === 'object' && !Array.isArray(items[0])) {
                const first = items[0];
                const bucketPoints = extractSuggestionPoints(first.items || first.points || first.content || first.value || first);
                if (bucketPoints.length) {
                    return [{
                        id: 1,
                        name: getName(first, defaultName || dataMap.StudentName || 'Student'),
                        role: first.role || 'Student',
                        picture: first.picture || dataMap.StudentPhoto || '',
                        date: first.date || '',
                        points: bucketPoints
                    }];
                }
            }

            if (typeof items[0] === 'string') {
                return [{ id: 1, name: defaultName || dataMap.StudentName || 'Student', role: 'Student', picture: dataMap.StudentPhoto || '', date: '', points: items.map(ptToString) }];
            }

            const groups = items.map((it, idx) => {
                if (!it) return null;
                if (Array.isArray(it.points)) {
                    return {
                        id: it.id || idx + 1,
                        name: getName(it, defaultName || dataMap.StudentName || 'Student'),
                        role: it.role || 'Student',
                        picture: it.picture || dataMap.StudentPhoto || '',
                        date: it.date || '',
                        points: it.points.map(ptToString)
                    };
                }

                const val = (it.answer && it.answer.value) ? it.answer.value : (it.value || null);
                if (val && typeof val === 'object') {
                    const pts = extractSuggestionPoints(val.outstanding || val.opportunity || val.suggestion || val.suggestions || val.items || val.content || val);
                    if (pts.length) {
                        return {
                            id: it.id || idx + 1,
                            name: getName(it, defaultName || dataMap.StudentName || 'Student'),
                            role: it.role || 'Student',
                            picture: it.picture || dataMap.StudentPhoto || '',
                            date: it.date || '',
                            points: pts.map(ptToString)
                        };
                    }
                }

                const single = ptToString(it);
                return {
                    id: it.id || idx + 1,
                    name: getName(it, defaultName || dataMap.StudentName || 'Student'),
                    role: it.role || 'Student',
                    picture: it.picture || dataMap.StudentPhoto || '',
                    date: it.date || '',
                    points: single ? [single] : []
                };
            }).filter(Boolean);

            return groups;
        };

        // Detect if children are meant to be columns (nested Groups) or flat elements (Rect, Text, etc.)
        const hasNestedGroups = Array.isArray(placeholderChildren) && placeholderChildren.some(c => c && c.className === 'Group');
        const columns = [];

        if (hasNestedGroups) {
            placeholderChildren.forEach((child) => {
                if (!child || child.className !== 'Group') return; // Only Groups act as column definitions here
                const cAttrs = child.attrs || {};
                const cChildren = Array.isArray(child.children) ? child.children : (Array.isArray(cAttrs.children) ? cAttrs.children : []);
                let colX = Number(cAttrs.x || 0);
                let colY = Number(cAttrs.y || 0);
                let colW = (typeof cAttrs.width === 'number' && cAttrs.width > 0) ? Number(cAttrs.width) : 0;
                let labelText = null;
                let labelFontSize = (typeof cAttrs.labelFontSize === 'number') ? cAttrs.labelFontSize : 20;
                let contentFontSize = (typeof cAttrs.contentFontSize === 'number') ? cAttrs.contentFontSize : 14;
                let contentLineHeight = (typeof cAttrs.lineHeight === 'number') ? cAttrs.lineHeight : 1.4;
                let contentPlaceholderWidth = null;
                let labelAttrs = null;
                let contentAttrs = null;

                for (const ch of cChildren) {
                    if (!ch || !ch.attrs) continue;
                    const a = ch.attrs || {};
                    const textValue = String(a.text || '').trim();
                    const looksLikeHeader = textValue && !a.placeholderType && !/^X{4,}$/.test(textValue) && textValue !== '•';
                    if (!labelText && looksLikeHeader) {
                        labelText = a.text;
                        labelFontSize = a.fontSize || labelFontSize;
                        labelAttrs = Object.assign({}, a);
                    }
                    if ((a.placeholderType === 'suggestion-item' || a.placeholderType === 'suggestion') || (/^X{4,}$/.test(String(a.text || '')))) {
                        contentFontSize = a.fontSize || contentFontSize;
                        contentLineHeight = a.lineHeight || contentLineHeight;
                        contentPlaceholderWidth = a.width || contentPlaceholderWidth;
                        contentAttrs = Object.assign({}, a);
                    }
                    if (!colW && typeof a.width === 'number') colW = Math.max(colW, a.width || 0);
                }

                if (!colW || colW < 20) {
                    const bbox = computeBBox(cChildren);
                    colW = Math.max(20, (bbox.maxX - bbox.minX) || (attrs.width ? (attrs.width / 2) : 300));
                }

                if (!labelText || /^[X\s]+$/.test(labelText)) {
                    labelText = (columns.length === 0) ? 'Outstanding' : 'Opportunity';
                }

                columns.push({ x: colX, y: colY, width: colW, labelText, labelFontSize, contentFontSize, contentLineHeight, contentPlaceholderWidth, labelAttrs, contentAttrs });
            });
        } else if (Array.isArray(placeholderChildren) && placeholderChildren.length) {
            // Flat elements: treat the entire group as ONE column
            let colW = Number(attrs.width || 0);
            let labelText = null;
            let labelFontSize = 20;
            let contentFontSize = 14;
            let contentLineHeight = 1.4;
            let contentPlaceholderWidth = null;
            let labelAttrs = null;
            let contentAttrs = null;

            placeholderChildren.forEach(ch => {
                const a = ch.attrs || {};
                const textValue = String(a.text || '').trim();
                const looksLikeHeader = textValue && !a.placeholderType && !/^X{4,}$/.test(textValue) && textValue !== '•';
                if (!labelText && looksLikeHeader) {
                    labelText = a.text;
                    labelFontSize = a.fontSize || labelFontSize;
                    labelAttrs = Object.assign({}, a);
                }
                if (a.placeholderType === 'suggestion' || a.placeholderType === 'suggestion-item' || /^X{4,}$/.test(String(a.text || ''))) {
                    contentFontSize = a.fontSize || contentFontSize;
                    contentLineHeight = a.lineHeight || contentLineHeight;
                    contentPlaceholderWidth = a.width || contentPlaceholderWidth;
                    contentAttrs = Object.assign({}, a);
                }
                if (!colW && typeof a.width === 'number') colW = Math.max(colW, a.width || 0);
            });

            if (!colW || colW < 20) {
                const bbox = computeBBox(placeholderChildren);
                colW = Math.max(20, (bbox.maxX - bbox.minX) || 300);
            }

            if (!labelText) {
                const vn = String(attrs.variableName || attrs.name || '').toLowerCase();
                labelText = vn.includes('oppor') ? 'Opportunity' : 'Outstanding';
            }

            columns.push({ x: 0, y: 0, width: colW, labelText, labelFontSize, contentFontSize, contentLineHeight, contentPlaceholderWidth, labelAttrs, contentAttrs });
        } else {
            // fallback: try attrs to infer two columns if saved
            const leftLabels = Array.isArray(attrs.labelsLeft) ? attrs.labelsLeft : (Array.isArray(attrs.labels) ? attrs.labels.slice(0, 1) : ['Outstanding']);
            const rightLabels = Array.isArray(attrs.labelsRight) ? attrs.labelsRight : (Array.isArray(attrs.labels) ? attrs.labels.slice(1) : ['Opportunity']);
            const defaultW = typeof attrs.width === 'number' ? attrs.width : 650;
            if (rightLabels && rightLabels.length) {
                const w = Math.floor((defaultW - (attrs.columnGap || 20)) / 2);
                columns.push({ x: 0, y: 0, width: w, labelText: leftLabels && leftLabels[0] ? leftLabels[0] : 'Outstanding', labelFontSize: 18, contentFontSize: 12, contentLineHeight: 1.4, labelAttrs: null, contentAttrs: null });
                columns.push({ x: w + (attrs.columnGap || 20), y: 0, width: defaultW - w - (attrs.columnGap || 20), labelText: rightLabels && rightLabels[0] ? rightLabels[0] : 'Opportunity', labelFontSize: 18, contentFontSize: 12, contentLineHeight: 1.4, labelAttrs: null, contentAttrs: null });
            } else {
                columns.push({ x: 0, y: 0, width: defaultW, labelText: 'Outstanding', labelFontSize: 20, contentFontSize: 12, contentLineHeight: 1.4, labelAttrs: null, contentAttrs: null });
            }
        }

        columns.sort((a, b) => a.x - b.x);

        // Re-verify label names after sorting to ensure left is Outstanding, right is Opportunity
        if (columns.length >= 2) {
            if (!columns[0].labelText || columns[0].labelText.toLowerCase().includes('oppor')) columns[0].labelText = 'Outstanding';
            if (!columns[1].labelText || columns[1].labelText.toLowerCase().includes('outstand')) columns[1].labelText = 'Opportunity';
        }

        // Validate column positions and widths; fall back to computed two-column
        // layout when template placeholders don't include reliable x/width values.
        try {
            const totalW = (typeof attrs.width === 'number' && attrs.width > 0) ? attrs.width : 650;
            const gap = Number(attrs.columnGap || 20);
            const xs = columns.map(c => Math.round(Number(c.x || 0)));
            const uniqueXs = new Set(xs);
            const invalid = columns.length === 0 || columns.some(c => !Number.isFinite(c.x) || !Number.isFinite(c.width) || c.width <= 8) || uniqueXs.size !== columns.length;
            if (invalid) {
                if (columns.length >= 2) {
                    const w1 = Math.floor((totalW - gap) / 2);
                    const w2 = totalW - gap - w1;
                    columns[0] = Object.assign({}, columns[0] || {}, { x: 0, width: w1, labelFontSize: (columns[0] && columns[0].labelFontSize) || 18, contentFontSize: (columns[0] && columns[0].contentFontSize) || 12, contentLineHeight: (columns[0] && columns[0].contentLineHeight) || 1.2 });
                    columns[1] = Object.assign({}, columns[1] || {}, { x: w1 + gap, width: w2, labelFontSize: (columns[1] && columns[1].labelFontSize) || 18, contentFontSize: (columns[1] && columns[1].contentFontSize) || 12, contentLineHeight: (columns[1] && columns[1].contentLineHeight) || 1.2 });
                } else if (columns.length === 1) {
                    columns[0] = Object.assign({}, columns[0], { x: 0, width: totalW, labelFontSize: (columns[0] && columns[0].labelFontSize) || 18, contentFontSize: (columns[0] && columns[0].contentFontSize) || 12, contentLineHeight: (columns[0] && columns[0].contentLineHeight) || 1.2 });
                } else {
                    const w = totalW;
                    columns.push({ x: 0, width: w, labelText: 'Outstanding', labelFontSize: 18, contentFontSize: 12, contentLineHeight: 1.2, labelAttrs: null, contentAttrs: null });
                }
            } else {
                // Relax font size normalization to respect template styles
                columns.forEach(c => {
                    c.labelFontSize = Math.max(10, Math.min(48, c.labelFontSize || 18));
                    c.contentFontSize = Math.max(8, Math.min(32, c.contentFontSize || 12));
                    c.contentLineHeight = c.contentLineHeight || 1.2;
                    c.x = Math.round(c.x || 0);
                    c.width = Math.round(c.width || 0);
                });
            }
        } catch (e) {
            // fall back silently
        }

        // Determine if this entire table is forced to one type via attributes
        const isForcedOpportunity = attrs.placeholderType?.toLowerCase().includes('oppor') || attrs.variableName?.toLowerCase().includes('oppor');
        const isForcedOutstanding = attrs.placeholderType?.toLowerCase().includes('outstand') || attrs.variableName?.toLowerCase().includes('outstand');

        const outstandingGroups = normalize(suggestionsObj.Outstanding || suggestionsObj.outstanding || [], dataMap.StudentName || 'Student');
        const opportunityGroups = normalize(suggestionsObj.Opportunities || suggestionsObj.opportunities || suggestionsObj.Opportunity || [], dataMap.StudentName || 'Student');

        // Render into columns when template provides column layout
        if (columns.length >= 2) {
            const renderColumn = (colDef, groups, isOpp = false) => {
                if (!groups || !groups.length) return 0;
                const colGroup = new Konva.Group({ x: colDef.x || 0, y: colDef.y || 0 });
                group.add(colGroup);
                let y = 0;

                const labelText = isOpp ? 'Opportunity' : 'Outstanding';
                const labelBaseAttrs = Object.assign({}, colDef.labelAttrs || {});
                const labelNode = new Konva.Text(Object.assign({}, labelBaseAttrs, {
                    text: labelText,
                    fontSize: colDef.labelFontSize || labelBaseAttrs.fontSize || 16,
                    fontFamily: labelBaseAttrs.fontFamily || attrs.fontFamily || 'Inter, Arial',
                    fontStyle: labelBaseAttrs.fontStyle || '600',
                    fill: labelBaseAttrs.fill || attrs.fill || '#1e293b',
                    x: typeof labelBaseAttrs.x === 'number' ? labelBaseAttrs.x : 0,
                    y: typeof labelBaseAttrs.y === 'number' ? labelBaseAttrs.y : y,
                    width: typeof labelBaseAttrs.width === 'number' ? labelBaseAttrs.width : colDef.width,
                    align: labelBaseAttrs.align || 'left',
                    lineHeight: labelBaseAttrs.lineHeight || 1.0,
                    wrap: labelBaseAttrs.wrap || 'none'
                }));
                colGroup.add(labelNode);
                y += (Math.ceil(labelNode.height() || (colDef.labelFontSize || 16))) + SUGGESTION_HEADER_CONTENT_GAP;

                // Flatten groups into item points to fill the column
                const itemsFlat = [];
                groups.forEach(g => {
                    if (!g) return;
                    if (Array.isArray(g.points) && g.points.length) {
                        g.points.forEach(pt => itemsFlat.push({ owner: g, text: pt }));
                    }
                });

                const leftMargin = 6;
                const contentBaseAttrs = colDef.contentAttrs || {};
                // Prefer template's contentAttrs.x but ensure a minimum left indent to match Editor
                const AFTER_HEADER_INDENT = 12;
                const rawTextX = (typeof contentBaseAttrs.x === 'number') ? contentBaseAttrs.x : SUGGESTION_CONTENT_X;
                // If label exists, nudge content further right to separate from header
                const labelLeftX = (typeof labelBaseAttrs.x === 'number') ? labelBaseAttrs.x : 0;
                const textX = Math.max(SUGGESTION_CONTENT_X, Math.max(rawTextX, labelLeftX + AFTER_HEADER_INDENT));
                const groupX = attrs.x || 0;
                const sX = attrs.scaleX || 1;
                // Clamp width based on paper edge, accounting for scale and indentation (740 is safer than 794)
                const maxColWidth = ((740 - groupX) / sX) - colDef.x - textX - 10;

                // Prefer editor behavior: use column width minus padding (colDef.width - 20) when available
                let targetWidth = (typeof colDef.width === 'number' && colDef.width > 20) ? (colDef.width - 20) : ((typeof contentBaseAttrs.width === 'number') ? contentBaseAttrs.width : (contentBaseAttrs.contentPlaceholderWidth || colDef.contentPlaceholderWidth || 250));
                const contentWidth = Math.max(20, Math.min(targetWidth, maxColWidth));

                itemsFlat.forEach((it, idx) => {
                    const fontSize = (typeof contentBaseAttrs.fontSize === 'number') ? contentBaseAttrs.fontSize : (colDef.contentFontSize || 12);
                    // Keep first content line below header gap; do not override with template y.
                    const itemY = y;
                    const bullet = new Konva.Circle({ x: Math.max(0, textX - 8), y: itemY + (fontSize * 0.6), radius: 3, fill: attrs.fill || '#1e293b' });
                    colGroup.add(bullet);

                    const rawText = ptToString(it.text);
                    const txtFull = (contentBaseAttrs && contentBaseAttrs.wrap === 'none') ? rawText : addThaiWordBreaks(rawText);
                    const txtNode = new Konva.Text(Object.assign({}, contentBaseAttrs, {
                        text: txtFull,
                        fontSize: fontSize,
                        fontFamily: contentBaseAttrs.fontFamily || attrs.fontFamily || 'Inter, Arial',
                        fontStyle: contentBaseAttrs.fontStyle || attrs.fontStyle || 'normal',
                        fill: contentBaseAttrs.fill || attrs.fill || '#1e293b',
                        x: textX,
                        y: itemY,
                        width: contentWidth,
                        align: 'left',
                        // Use template lineHeight if provided, otherwise default to editor standard
                        lineHeight: (typeof contentBaseAttrs.lineHeight === 'number') ? contentBaseAttrs.lineHeight : SUGGESTION_CONTENT_LINE_HEIGHT,
                        wrap: (typeof contentBaseAttrs.wrap === 'string') ? contentBaseAttrs.wrap : 'word'
                    }));
                    colGroup.add(txtNode);
                    const h = Math.ceil(txtNode.height() || (fontSize * SUGGESTION_CONTENT_LINE_HEIGHT));
                    // Match Editor spacing: add proportional padding below each suggestion and round up
                    y = itemY + h + SUGGESTION_ITEM_GAP;
                });

                return y;
            };

            const leftH = renderColumn(columns[0], outstandingGroups, isForcedOpportunity ? true : false);
            const rightH = renderColumn(columns[1], opportunityGroups, isForcedOutstanding ? false : true);
            currentY = Math.max(leftH, rightH) + 12;
        } else if (columns.length === 1) {
            const col = columns[0];
            const isOpp = isForcedOpportunity || (outstandingGroups.length === 0 && opportunityGroups.length > 0);
            const data = isOpp ? opportunityGroups : outstandingGroups;
            if (!data || !data.length) return group;

            const colGroup = new Konva.Group({ x: col.x || 0, y: col.y || 0 });
            group.add(colGroup);
            let y = 0;

            const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
            let labelText = isOpp ? 'Opportunity' : 'Outstanding';
            if (lang === 'th') {
                labelText = isOpp ? 'จุดที่ควรพัฒนา' : 'จุดเด่น';
            }
            const labelNode = new Konva.Text({
                text: labelText,
                fontSize: col.labelFontSize || 16,
                fontFamily: (col.labelAttrs && col.labelAttrs.fontFamily) || attrs.fontFamily || 'Inter, Arial',
                fontStyle: (col.labelAttrs && col.labelAttrs.fontStyle) || '600',
                fill: (col.labelAttrs && col.labelAttrs.fill) || attrs.fill || '#1e293b',
                x: (col.labelAttrs && typeof col.labelAttrs.x === 'number') ? col.labelAttrs.x : 0,
                y: (col.labelAttrs && typeof col.labelAttrs.y === 'number') ? col.labelAttrs.y : y,
                width: (col.labelAttrs && typeof col.labelAttrs.width === 'number') ? col.labelAttrs.width : col.width,
                align: (col.labelAttrs && col.labelAttrs.align) || 'left',
                lineHeight: (col.labelAttrs && col.labelAttrs.lineHeight) || 1.0,
                wrap: (col.labelAttrs && col.labelAttrs.wrap) || 'none'
            });
            colGroup.add(labelNode);
            y += (Math.ceil(labelNode.height() || (col.labelFontSize || 16))) + SUGGESTION_HEADER_CONTENT_GAP;

            const itemsFlat = [];
            data.forEach(g => {
                if (!g) return;
                if (Array.isArray(g.points) && g.points.length) {
                    g.points.forEach(pt => itemsFlat.push({ owner: g, text: pt }));
                }
            });

            const leftMargin = 6;
            const contentBaseAttrs = col.contentAttrs || {};
            // Prefer template contentAttrs.x but enforce minimum indent like Editor and nudge after header
            const AFTER_HEADER_INDENT = 12;
            const rawTextX = (typeof contentBaseAttrs.x === 'number') ? contentBaseAttrs.x : SUGGESTION_CONTENT_X;
            const labelLeftX = (col.labelAttrs && typeof col.labelAttrs.x === 'number') ? col.labelAttrs.x : 0;
            const textX = Math.max(SUGGESTION_CONTENT_X, Math.max(rawTextX, labelLeftX + AFTER_HEADER_INDENT));
            const groupX = attrs.x || 0;
            const sX = attrs.scaleX || 1;
            const rightBoundary = isOpp ? 770 : 370;
            const maxColWidth = ((rightBoundary - groupX) / sX) - (col.x || 0) - textX - 5;

            // Editor behavior: prefer column width minus padding (col.width - 20) when available
            const preferredSingleColContentWidth = (typeof col.width === 'number' && col.width > 20) ? (col.width - 20) : null;
            const contentWidth = preferredSingleColContentWidth ? Math.max(20, Math.min(preferredSingleColContentWidth, maxColWidth)) : ((typeof contentBaseAttrs.width === 'number') ? Math.max(20, Math.min(contentBaseAttrs.width, maxColWidth)) : Math.max(100, maxColWidth));

            itemsFlat.forEach((it, idx) => {
                const fontSize = (typeof contentBaseAttrs.fontSize === 'number') ? contentBaseAttrs.fontSize : (col.contentFontSize || 12);
                // Keep first content line below header gap; do not override with template y.
                const itemY = y;
                const bullet = new Konva.Circle({ x: Math.max(0, textX - 8), y: itemY + (fontSize * 0.6), radius: 3, fill: attrs.fill || '#1e293b' });
                colGroup.add(bullet);

                const rawText = ptToString(it.text);
                const txtFull = (contentBaseAttrs && contentBaseAttrs.wrap === 'none') ? rawText : wrapTextManual(rawText, contentWidth, (typeof contentBaseAttrs.fontSize === 'number') ? contentBaseAttrs.fontSize : (col.contentFontSize || 13), contentBaseAttrs.fontFamily || attrs.fontFamily || 'Inter, Arial');
                const txtNode = new Konva.Text(Object.assign({}, contentBaseAttrs, {
                    text: txtFull,
                    fontSize: fontSize,
                    fontFamily: contentBaseAttrs.fontFamily || attrs.fontFamily || 'Inter, Arial',
                    fontStyle: contentBaseAttrs.fontStyle || attrs.fontStyle || 'normal',
                    fill: contentBaseAttrs.fill || attrs.fill || '#1e293b',
                    x: textX,
                    y: itemY,
                    width: contentWidth,
                    align: 'left',
                    lineHeight: (typeof contentBaseAttrs.lineHeight === 'number') ? contentBaseAttrs.lineHeight : SUGGESTION_CONTENT_LINE_HEIGHT,
                    wrap: (typeof contentBaseAttrs.wrap === 'string') ? contentBaseAttrs.wrap : 'none'
                }));
                colGroup.add(txtNode);
                const h = Math.ceil(txtNode.height() || (fontSize * SUGGESTION_CONTENT_LINE_HEIGHT));
                y = itemY + h + SUGGESTION_ITEM_GAP;
            });

            currentY = y + 12;
        } else {
            // fallback to stacked sections when only single column is available
            const addSection = (title, itemsArray) => {
                if (!itemsArray || !itemsArray.length) return;
                const boxWidth = (attrs.width && typeof attrs.width === 'number') ? attrs.width : 650;
                const leftMargin = 10;
                const textX = leftMargin + 15;
                const textWidth = Math.max(120, boxWidth - textX - 20);

                const titleNode = new Konva.Text({ text: title, fontSize: 22, fontFamily: 'Inter, Arial', fontStyle: '600', fill: '#1e293b', x: 0, y: currentY, width: boxWidth });
                group.add(titleNode);
                currentY += (titleNode.height() || 28) + 8;

                const firstItem = itemsArray[0] || {};
                const nameRole = `${getName(firstItem, dataMap.StudentName || 'Student')} - ${firstItem.role || 'Student'}`;
                const nameNode = new Konva.Text({ text: nameRole, fontSize: 14, fontFamily: 'Inter, Arial', fontStyle: '500', fill: '#475569', x: 0, y: currentY, width: Math.max(120, boxWidth - 120) });
                group.add(nameNode);

                const iconX = Math.max(400, boxWidth - 120);
                const calendarGroup = new Konva.Group({ x: iconX, y: currentY - 2 });
                calendarGroup.add(new Konva.Rect({ width: 16, height: 16, stroke: '#475569', strokeWidth: 1.5, cornerRadius: 2 }));
                group.add(calendarGroup);

                const dateNode = new Konva.Text({ text: firstItem.date || 'XX-XX-XXXX', fontSize: 14, fontFamily: 'Inter, Arial', fill: '#475569', x: iconX + 40, y: currentY, width: 120 });
                group.add(dateNode);

                currentY += Math.max(nameNode.height() || 18, dateNode.height() || 18) + 8;

                itemsArray.forEach(adv => {
                    if (Array.isArray(adv.points)) {
                        adv.points.forEach(pt => {
                            const bullet = new Konva.Circle({ x: leftMargin, y: currentY + 7, radius: 3, fill: '#1e293b' });
                            group.add(bullet);

                            const txtFull = addThaiWordBreaks(ptToString(pt));
                            const txtNode = new Konva.Text({
                                text: txtFull,
                                fontSize: 14,
                                fontFamily: 'Inter, Arial',
                                fill: '#1e293b',
                                x: textX,
                                y: currentY,
                                width: textWidth,
                                align: 'left',
                                wrap: 'word'
                            });
                            group.add(txtNode);

                            const h = Math.ceil(txtNode.height() || (14 * SUGGESTION_CONTENT_LINE_HEIGHT));
                            currentY += h + SUGGESTION_ITEM_GAP;
                        });
                    }
                });
                currentY += 12;
            };

            addSection('Outstanding', outstandingGroups);
            addSection('Opportunities', opportunityGroups);
        }


        layer.add(group);
        applyZIndex(group, attrs);

        return group;

        return group;
    };

    // Replace inline text like "Name {StudentName}" or just "{StudentName}"
    const resolveValue = (key) => {
        if (!key) return '';
        const cleanKey = String(key).replace(/[{}]/g, '');
        const normalized = String(cleanKey).replace(/\s+/g, '').toLowerCase();

        // Helper: stringify arrays/objects into readable text for Text nodes
        const stringify = (val) => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') return val;
            if (typeof val === 'number' || typeof val === 'boolean') return String(val);
            if (val && typeof val === 'object') {
                if (val.$date) {
                    const date = new Date(val.$date);
                    return Number.isNaN(date.getTime()) ? String(val.$date) : date.toLocaleString();
                }
                if (val.$oid) return String(val.$oid);
            }
            if (Array.isArray(val)) {
                const parts = val.map(el => {
                    if (el === null || el === undefined) return '';
                    if (typeof el === 'string') return el;
                    if (typeof el === 'number' || typeof el === 'boolean') return String(el);
                    if (typeof el === 'object') {
                        if (el.$date) {
                            const date = new Date(el.$date);
                            return Number.isNaN(date.getTime()) ? String(el.$date) : date.toLocaleString();
                        }
                        if (el.$oid) return String(el.$oid);
                        if (el.name) return String(el.name);
                        if (el.title) return (typeof el.title === 'string') ? el.title : (el.title.en || el.title.th || JSON.stringify(el.title));
                        if (Array.isArray(el.points)) return el.points.map(p => (typeof p === 'object' ? (p.text || p.value || JSON.stringify(p)) : String(p))).join('; ');
                        if (Array.isArray(el.outstanding)) return el.outstanding.join('; ');
                        if (Array.isArray(el.opportunity)) return el.opportunity.join('; ');
                        return JSON.stringify(el);
                    }
                    return String(el);
                }).filter(Boolean);
                return parts.join(', ');
            }
            if (typeof val === 'object') {
                if (val.$date) {
                    const date = new Date(val.$date);
                    return Number.isNaN(date.getTime()) ? String(val.$date) : date.toLocaleString();
                }
                if (val.$oid) return String(val.$oid);
                if (val.name) return String(val.name);
                if (val.title) return (typeof val.title === 'string') ? val.title : (val.title.en || val.title.th || JSON.stringify(val.title));
                if (Array.isArray(val.outstanding)) return val.outstanding.join('; ');
                if (Array.isArray(val.opportunity)) return val.opportunity.join('; ');
                if (val.text) return String(val.text);
                if (val.value && (typeof val.value === 'string' || typeof val.value === 'number')) return String(val.value);
                return JSON.stringify(val);
            }
            return String(val);
        };

        // Handle Academic/Academy Year variants first so we can return formatted text
        if (normalized === 'academicyear' || normalized === 'academyyear') {
            const year = dataMap.AcademyYear || dataMap.academyYear || dataMap.AcademicYear || dataMap.academicYear || dataMap['Academic Year'] || dataMap['academic year'] || '';
            return year ? 'Academic Year ' + year : 'Academic Year';
        }

        let v;
        v = lookupNestedValue(dataMap, cleanKey);
        if (v === undefined) v = lookupNestedValue(dataMap, key);
        if (v === undefined && dataMap.student) v = lookupNestedValue(dataMap.student, cleanKey);
        if (v === undefined && dataMap.student) v = lookupNestedValue(dataMap.student, key);
        if (v === undefined) v = '';

        return stringify(v);
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

    // computeBBox helper — reused for pre-scan and suggestion-table alignment
    const computeBBox = (children) => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const walk = (arr) => {
            for (const ch of arr) {
                if (!ch || !ch.attrs) continue;
                const a = ch.attrs || {};
                const x = (typeof a.x === 'number') ? a.x : 0;
                const y = (typeof a.y === 'number') ? a.y : 0;
                const w = (typeof a.width === 'number') ? a.width : 0;
                const h = (typeof a.height === 'number') ? a.height : 0;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + w);
                maxY = Math.max(maxY, y + h);
                if (Array.isArray(ch.children) && ch.children.length) walk(ch.children);
            }
        };
        try { walk(children); } catch (e) { }
        if (!isFinite(minX)) minX = 0;
        if (!isFinite(minY)) minY = 0;
        if (!isFinite(maxX)) maxX = minX;
        if (!isFinite(maxY)) maxY = minY;
        return { minX, minY, maxX, maxY };
    };

    // Pre-scan template elements to compute competency bottom Y so suggestions can be placed below
    let competencyBottom = null;
    try {
        elements.forEach((el) => {
            const attrs = el && el.attrs ? el.attrs : {};
            const topY = Number(attrs.y || 0);
            let elHeight = 0;
            let isCompetency = false;

            // Explicit Group named competency-table
            if (el.className === 'Group' && String(attrs.name || '').toLowerCase() === 'competency-table') {
                isCompetency = true;
                if (Array.isArray(attrs.children) && attrs.children.length) {
                    const bbox = computeBBox(attrs.children);
                    elHeight = Math.max(elHeight, (bbox.maxY - bbox.minY) || 0);
                }
                if (!elHeight && typeof attrs.height === 'number') elHeight = attrs.height;
            }

            // Text nodes that likely label the competency section
            if (!isCompetency && el.className === 'Text') {
                const textVal = String(attrs.text || attrs.placeholder || attrs.variableName || '').toLowerCase();
                if ((textVal.indexOf('specific') >= 0 && textVal.indexOf('compet') >= 0) || (textVal.indexOf('general') >= 0 && textVal.indexOf('compet') >= 0) || /specificcompetencies|generalcompetencies/.test(String(attrs.variableName || '').toLowerCase())) {
                    isCompetency = true;
                    elHeight = (typeof attrs.height === 'number' && attrs.height > 0) ? attrs.height : (typeof attrs.fontSize === 'number' ? attrs.fontSize * (attrs.lineHeight || 1.2) * (String(attrs.text || '').split('\n').length || 1) : 20);
                }
            }

            // Graph placeholders used for competency visuals
            if (!isCompetency && el.className === 'Image') {
                const name = String(attrs.name || '').toLowerCase();
                const gtype = String(attrs.graphType || '').toLowerCase();
                if (name === 'graph-placeholder' && (gtype.indexOf('specific') >= 0 || gtype.indexOf('general') >= 0 || String(attrs.variableName || '').toLowerCase().indexOf('compet') >= 0)) {
                    isCompetency = true;
                    elHeight = (typeof attrs.height === 'number' && attrs.height > 0) ? attrs.height : elHeight || 220;
                }
            }

            // Variable name hints
            if (!isCompetency && typeof attrs.variableName === 'string') {
                const vn = attrs.variableName.toLowerCase();
                if (vn.indexOf('specificcompet') >= 0 || vn.indexOf('generalcompet') >= 0 || vn.indexOf('competenc') >= 0) {
                    isCompetency = true;
                    if (!elHeight && typeof attrs.height === 'number') elHeight = attrs.height;
                }
            }

            if (isCompetency) {
                const bottom = topY + (elHeight || 0);
                if (!competencyBottom || bottom > competencyBottom) competencyBottom = bottom;
            }
        });
    } catch (e) { competencyBottom = null; }



    // Load nodes
    elements.forEach((el) => {
        const attrs = Object.assign({}, el.attrs || {});

        // Skip drawing static Text/Image placeholders for dynamic tables to avoid duplication.
        // We only skip if it's NOT a Group, because Groups are handled by dedicated builders below.
        const nameLower = String(attrs.name || '').toLowerCase();
        const varLower = String(attrs.variableName || attrs.placeholder || '').toLowerCase();
        const typeLower = String(attrs.placeholderType || '').toLowerCase();
        const textClean = String(attrs.text || '').trim().toLowerCase();

        const isDynamicPart = nameLower.includes('suggestion') ||
            typeLower.includes('suggestion') ||
            varLower.includes('outstand') || varLower.includes('oppor') ||
            textClean === 'outstanding' || textClean === 'opportunity' || textClean === 'opportunities' ||
            nameLower.includes('competency-table') ||
            (/specific|general/i.test(varLower) && /compet/i.test(varLower));

        if (isDynamicPart && el.className !== 'Group') {
            return;
        }

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

            const lang = dataMap.__language || 'en';
            if (lang === 'th') {
                if (finalValue === 'General Competencies') finalValue = 'ทักษะทั่วไป';
                else if (finalValue === 'Specific Competencies') finalValue = 'ทักษะเฉพาะทาง';
                else if (finalValue.startsWith('Academic Year ')) finalValue = finalValue.replace('Academic Year ', 'ปีการศึกษา ');
            }

            const sX = (attrs.scaleX || 1);
            const finalWidth = attrs.width || ((794 - (attrs.x || 0)) / sX - 10);
            const node = new Konva.Text(Object.assign({}, attrs, {
                text: addThaiWordBreaks(finalValue),
                width: finalWidth,
                wrap: 'word'
            }));
            layer.add(node);
            applyZIndex(node, el.attrs);
            if (typeof attrs.createdOrder === 'number') {
                renderedNodesByOrder.set(Number(attrs.createdOrder), node);
            }
        } else if (el.className === 'Image') {
            const isGraph = attrs.elementType === 'graph' || attrs.name === 'graph-placeholder' || (attrs.variableName && attrs.variableName.includes('Graph_'));
            if (isGraph) {
                renderGraphPlaceholder(attrs);
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
            if (attrs.elementType === 'graph' || attrs.name === 'graph-placeholder') {
                renderGraphPlaceholder(attrs);
            } else {
                const vn = String(attrs.variableName || '').toLowerCase();
                const isCompTable = attrs.name === 'competency-table' || vn.includes('generalcompet') || vn.includes('specificcompet') || (vn.includes('competenc') && !vn.includes('graph'));

                if (isCompTable) {
                    const key = attrs.variableName || (vn.includes('general') ? '{GeneralCompetencies}' : '{SpecificCompetencies}');
                    const isGeneral = String(key).indexOf('General') >= 0;
                    const items = isGeneral
                        ? (dataMap.GeneralCompetencies || dataMap.generalCompetencies || [])
                        : (dataMap.SpecificCompetencies || dataMap.specificCompetencies || []);
                    // Use actual provided general competency items when available.
                    // Fallback to defaults only when the provided list is empty.
                    const safeItems = Array.isArray(items) ? items : [];
                    const title = isGeneral ? 'General Competencies' : 'Specific Competencies';
                    // record bottom Y of competency area if possible (attrs.height expected)
                    try {
                        const topY = (attrs.y || 0);
                        const h = (typeof attrs.height === 'number' && attrs.height > 0) ? attrs.height : 0;
                        const bottom = topY + h;
                        if (bottom && (!competencyBottom || bottom > competencyBottom)) competencyBottom = bottom;
                    } catch (e) { }

                    addCompetencyTable(attrs, safeItems, title, attrs.children);
                } else if (attrs.name === 'suggestion-table' || attrs.name === 'suggestion-table-part') {
                    const isPart = attrs.name === 'suggestion-table-part';
                    const savedChildren = Array.isArray(attrs.children) ? attrs.children : null;
                    const sug = dataMap.Suggestion || dataMap.suggestion || {};

                    let suggestionsObj;
                    if (isPart) {
                        const vn = String(attrs.variableName || '').toLowerCase();
                        const isOutstanding = vn.includes('outstanding');
                        const data = isOutstanding
                            ? (dataMap.Outstanding || dataMap.outstanding || sug.Outstanding || sug.outstanding || [])
                            : (dataMap.Opportunities || dataMap.opportunities || sug.Opportunities || sug.opportunities || []);

                        suggestionsObj = isOutstanding ? { Outstanding: data } : { Opportunities: data };
                    } else {
                        suggestionsObj = {
                            Outstanding: dataMap.Outstanding || dataMap.outstanding || sug.Outstanding || sug.outstanding,
                            Opportunities: dataMap.Opportunities || dataMap.opportunities || sug.Opportunities || sug.opportunities
                        };
                    }

                    // Use exact saved position — trust attrs.x/attrs.y as designed in the editor.
                    // Do NOT apply any automatic bbox offset or competency-bottom nudging.
                    const localAttrs = Object.assign({}, attrs);

                    // Derive width from saved children bbox only when attrs.width is missing
                    if (!localAttrs.width && savedChildren && savedChildren.length) {
                        const bbox = computeBBox(savedChildren);
                        const w = (bbox.maxX - bbox.minX);
                        if (w > 0) localAttrs.width = w;
                    }

                    addSuggestionTable(localAttrs, suggestionsObj, savedChildren);
                }
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

    // Reposition manual-linked data variables into the same horizontal plane
    // with a fixed 20px gap before export, without affecting the editor canvas.
    try {
        applyManualLinkedVariableExportLayout();
    } catch (e) { }

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
