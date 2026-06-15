import Konva from 'konva';
import { formatChartLabel } from '@/utils/chartLabel';
import {
    addThaiWordBreaks,
    applyZIndex,
    findTemplateTextAttrs,
    getPercentForItem,
    normalizeScore,
    resolveLocalizedText,
    resolveLocalizedValue,
    getLocaleFontFamily,
    wrapTextManual,
    wrapTextManualForRadarLabel,
    valueToPercent
} from '@/utils/pdfGenerator/pdfGenerator.logic';

export const createPdfGraphRenderers = ({ layer, dataMap = {} } = {}) => {
    const RADAR_LABEL_OUTER_MARGIN = 40;

    const findGraphTitleAttrs = (templateChildren, title, fallbackTitle) => {
        return findTemplateTextAttrs(templateChildren, title)
            || findTemplateTextAttrs(templateChildren, fallbackTitle)
            || {};
    };

    const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
    const fontFamilyForLang = getLocaleFontFamily(lang);
    const localizedText = (value, fallbackLang = lang) => resolveLocalizedText(value, fallbackLang);
    const localizedCollection = (value) => {
        const resolved = resolveLocalizedValue(value, lang);
        if (Array.isArray(resolved)) return resolved;
        if (resolved && typeof resolved === 'object') {
            const langKey = String(lang || 'en').toLowerCase().startsWith('th') ? 'th' : 'en';
            const altKey = langKey === 'th' ? 'en' : 'th';
            if (Array.isArray(resolved[langKey])) return resolved[langKey];
            if (Array.isArray(resolved[altKey])) return resolved[altKey];
        }
        return [];
    };

    const getEmptyResultMessage = () => String(lang || 'en').toLowerCase().startsWith('th')
        ? 'ยังไม่ได้รับผลลัพธ์การฝึกงาน'
        : 'Internship results are not available yet.';

    const addRadarGraph = (attrs, graphData, items, title, templateChildren = []) => {
        const x = attrs.x || 0;
        const y = attrs.y || 0;
        const scaleX = attrs.scaleX || 1;
        const scaleY = attrs.scaleY || 1;
        const rotation = attrs.rotation || 0;
        const width = attrs.width || 360;
        const height = attrs.height || 260;
        const group = new Konva.Group({ x, y, scaleX, scaleY, rotation, name: 'graph-placeholder', graphType: attrs.graphType });

        const titleAttrs = findGraphTitleAttrs(templateChildren, title, String(title || '').includes('ทักษะทั่วไป')
            ? 'General Competencies'
            : (String(title || '').includes('ทักษะเฉพาะทาง') ? 'Specific Competencies' : title));
        const layoutScale = Math.max(0.55, Math.min(1.25, Math.min(width / 600, height / 450)));
        const pdfLang = lang;
        const isThaiLang = String(pdfLang).toLowerCase().startsWith('th');

        group.add(new Konva.Text({
            x: typeof titleAttrs.x === 'number' ? titleAttrs.x : 10,
            y: typeof titleAttrs.y === 'number' ? titleAttrs.y : 8,
            text: title || 'Radar',
            fontSize: titleAttrs.fontSize || attrs.titleFontSize || attrs.fontSize || Math.round(16 * layoutScale),
            fontFamily: titleAttrs.fontFamily || fontFamilyForLang,
            fontStyle: titleAttrs.fontStyle || '600',
            fill: titleAttrs.fill || '#1e293b',
            width: typeof titleAttrs.width === 'number' ? titleAttrs.width : (width - 20),
            align: titleAttrs.align || 'left'
        }));

        const labels = (graphData.labels && graphData.labels.length)
            ? graphData.labels.map((label) => localizedText(label, pdfLang))
            : items.map((item) => localizedText(item && (item.name || item.label || item.title || item.text || item), pdfLang));
        const radarLabelTemplateAttrsFromTemplate = (() => {
            if (!Array.isArray(templateChildren) || !templateChildren.length) return [];
            const skipTexts = new Set([
                String(title || '').trim().toLowerCase(),
                'you',
                'average',
                '20',
                '40',
                '60',
                '80',
                '100'
            ]);
            return templateChildren
                .filter((child) => {
                    const attrs = child && child.attrs ? child.attrs : null;
                    if (!attrs || child.className !== 'Text') return false;
                    const text = String(attrs.text || '').replace(/\s+/g, ' ').trim().toLowerCase();
                    if (!text || skipTexts.has(text)) return false;
                    if (attrs.placeholderType) return false;
                    if (typeof attrs.width === 'number' && attrs.width < 60) return false;
                    if (attrs.fontStyle && String(attrs.fontStyle).toLowerCase() !== 'bold') return false;
                    return true;
                })
                .map((child) => Object.assign({}, child.attrs || {}));
        })();

        let radarLabelTemplateAttrs = radarLabelTemplateAttrsFromTemplate || [];
        const sides = Math.max(3, labels.length);
        const centerX = width / 2;
        const radius = Math.max(40, Math.min(width, height) * 0.34 * layoutScale);
        const centerY = Math.round(height * 0.72);
        const labelOffsetX = Math.max(12, Math.round(25 * layoutScale));
        const labelOffsetY = Math.max(10, Math.round(20 * layoutScale));
        const labelFontSize = Math.max(10, Math.round((attrs.labelFontSize || attrs.fontSize || 12) * layoutScale));
        const labelWidth = Math.max(70, Math.round(120 * layoutScale));

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
        } catch (e) { }

        try {
            const englishLabels = items.map((item) => localizedText(item && (item.name || item.label || item.title || item.text || item), 'en')).slice(0, Math.max(0, (labels && labels.length) ? labels.length : 0));
            const engMatched = englishLabels.map((lbl) => findTemplateTextAttrs(templateChildren, lbl) || null);
            if (engMatched && engMatched.some((a) => a)) {
                radarLabelTemplateAttrs = engMatched.slice(0, (labels ? labels.length : 0)).map(a => a ? Object.assign({}, a) : null);
            }
        } catch (e) { }

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
        } catch (e) { }

        try {
            const titleNorm = String(title || '').toLowerCase();
            const isGeneralTitle = titleNorm.indexOf('general') >= 0 || titleNorm.indexOf('ทักษะทั่วไป') >= 0;
            if (isGeneralTitle && !isThaiLang) {
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
                engMatched.forEach((a, idx) => {
                    if (a) {
                        radarLabelTemplateAttrs[idx] = Object.assign({}, a);
                    }
                });
            }
        } catch (e) { }

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
                fontFamily: tickAttrs.fontFamily || fontFamilyForLang,
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
            const labelAttrs = (radarLabelTemplateAttrs[i] && typeof radarLabelTemplateAttrs[i] === 'object')
                ? radarLabelTemplateAttrs[i]
                : (findTemplateTextAttrs(templateChildren, origLabel) || {});
            const templateText = typeof labelAttrs.text === 'string' ? String(labelAttrs.text).trim() : '';
            const hasTemplateText = !!templateText && !/^X+$/i.test(templateText);
            const resolvedWidth = typeof labelAttrs.width === 'number' ? labelAttrs.width : labelWidth;
            const resolvedAlign = labelAttrs.align || defaultAlign;
            const fontSz = labelAttrs.fontSize || attrs.labelFontSize || attrs.fontSize || labelFontSize;
            const fontFamily = labelAttrs.fontFamily || fontFamilyForLang;
            const wrapWidth = isThaiLang ? Math.max(70, Math.round(resolvedWidth * 0.75)) : resolvedWidth;

            const sourceLabel = isThaiLang && hasTemplateText
                ? templateText
                : String(origLabel || templateText || '');
            const labelTextValue = isThaiLang
                ? wrapTextManualForRadarLabel(sourceLabel, wrapWidth, fontSz, fontFamily, 3)
                : (sourceLabel === templateText && hasTemplateText
                    ? templateText
                    : formatChartLabel(sourceLabel, Math.max(18, Math.floor(resolvedWidth / Math.max(1, fontSz)) + 4), pdfLang));
            const labelText = Array.isArray(labelTextValue)
                ? labelTextValue.join('\n')
                : String(labelTextValue || '');

            const lineH = labelAttrs.lineHeight || 1;
            const lines = labelText.split('\n').length || 1;
            const labelHeight = Math.round(lines * fontSz * lineH);

            const hasTemplatePosition = (typeof labelAttrs.x === 'number') && (typeof labelAttrs.y === 'number');
            let resolvedX = (resolvedAlign === 'center' ? idealX - (resolvedWidth / 2) : (resolvedAlign === 'left' ? idealX : idealX - resolvedWidth));
            let resolvedY = (idealY - Math.round(isThaiLang ? 10 : (8 * layoutScale)));

            if (hasTemplatePosition) {
                resolvedX = labelAttrs.x;
                resolvedY = labelAttrs.y;
            }

            const allowNudge = !hasTemplatePosition && !hasTemplateText;
            if (allowNudge) {
                const labelCenterX = resolvedX + (resolvedWidth / 2);
                const labelCenterY = resolvedY + (labelHeight / 2);
                const dx = labelCenterX - centerX;
                const dy = labelCenterY - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = radius + RADAR_LABEL_OUTER_MARGIN + Math.max(0, Math.round(labelHeight / 3));
                if (dist < minDist) {
                    const targetDist = minDist;
                    const newCenterX = centerX + targetDist * Math.cos(angle);
                    const newCenterY = centerY + targetDist * Math.sin(angle);
                    resolvedX = (resolvedAlign === 'center') ? (newCenterX - resolvedWidth / 2) : (resolvedAlign === 'left' ? newCenterX : (newCenterX - resolvedWidth));
                    resolvedY = newCenterY - labelHeight / 2;
                }
            }

            group.add(new Konva.Text({
                x: resolvedX,
                y: resolvedY,
                text: labelText,
                fontSize: fontSz,
                fontFamily: labelAttrs.fontFamily || fontFamilyForLang,
                fill: labelAttrs.fill || '#475569',
                width: resolvedWidth,
                align: resolvedAlign,
                fontStyle: labelAttrs.fontStyle || 'bold',
                lineHeight: labelAttrs.lineHeight || 1.05,
                wrap: labelAttrs.wrap || 'none'
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
            // Keep legend readable when the template doesn't provide explicit sizing.
            fontSize: youLegendAttrs.fontSize || attrs.legendFontSize || Math.round((isThaiLang ? 10 : 11) * layoutScale),
            fontFamily: youLegendAttrs.fontFamily || fontFamilyForLang,
            fill: youLegendAttrs.fill || '#64748b'
        }));
        group.add(new Konva.Circle({ x: centerX + 20, y: legendY, radius: 4, fill: '#fb7185' }));
        const avgLegendAttrs = findTemplateTextAttrs(templateChildren, lblAvg) || {};
        group.add(new Konva.Text({
            x: typeof avgLegendAttrs.x === 'number' ? avgLegendAttrs.x : centerX + 30,
            y: typeof avgLegendAttrs.y === 'number' ? avgLegendAttrs.y : legendY - 5,
            text: lblAvg,
            fontSize: avgLegendAttrs.fontSize || attrs.legendFontSize || Math.round((isThaiLang ? 10 : 11) * layoutScale),
            fontFamily: avgLegendAttrs.fontFamily || fontFamilyForLang,
            fill: avgLegendAttrs.fill || '#64748b'
        }));

        layer.add(group);
        applyZIndex(group, attrs);
    };

    const addBarGraph = (barAttrs, items, title, templateChildren = []) => {
        const x = Number(barAttrs.x || 0);
        const y = Number(barAttrs.y || 0);
        const scaleX = Number(barAttrs.scaleX || 1);
        const scaleY = Number(barAttrs.scaleY || 1);
        const rotation = Number(barAttrs.rotation || 0);
        const width = Number(barAttrs.width || 360);
        const height = Number(barAttrs.height || 220);
        const group = new Konva.Group({ x, y, scaleX, scaleY, rotation, name: 'graph-placeholder', graphType: barAttrs.graphType });

        const isThaiLang = String(lang || '').toLowerCase().startsWith('th');
        const rows = Array.isArray(items) && items.length ? items : [{ name: 'Skill', score: 80 }];
        const normalizedRows = rows.map((item) => ({
            label: resolveLocalizedText(item && (item.name || item.label || item.title || item.text || item), lang),
            percent: getPercentForItem(item)
        }));
        const titleAttrs = findGraphTitleAttrs(templateChildren, title, title);

        group.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: '#ffffff' }));
        group.add(new Konva.Text({
            x: typeof titleAttrs.x === 'number' ? titleAttrs.x : 10,
            y: typeof titleAttrs.y === 'number' ? titleAttrs.y : 8,
            text: title || 'Bar',
            fontSize: titleAttrs.fontSize || barAttrs.titleFontSize || barAttrs.fontSize || 16,
            fontFamily: titleAttrs.fontFamily || fontFamilyForLang,
            fontStyle: titleAttrs.fontStyle || '600',
            fill: titleAttrs.fill || '#1e293b',
            width: typeof titleAttrs.width === 'number' ? titleAttrs.width : undefined,
            align: titleAttrs.align || 'left'
        }));

        const barX = 0;
        const barW = width;
        const templateNodes = Array.isArray(templateChildren)
            ? templateChildren
                .filter((child) => child && child.attrs)
                .slice()
                .sort((a, b) => {
                    const ao = Number(a.attrs.createdOrder || 0);
                    const bo = Number(b.attrs.createdOrder || 0);
                    if (ao !== bo) return ao - bo;
                    const ay = Number(a.attrs.y || 0);
                    const by = Number(b.attrs.y || 0);
                    if (ay !== by) return ay - by;
                    return Number(a.attrs.x || 0) - Number(b.attrs.x || 0);
                })
            : [];

        const hasTemplateLayout = templateNodes.some((child) => child.className === 'Rect') && templateNodes.some((child) => child.className === 'Text');

        if (hasTemplateLayout) {
            const textNodes = templateNodes
                .filter((child) => child.className === 'Text')
                .map((child) => ({ child, attrs: Object.assign({}, child.attrs || {}) }))
                .sort((a, b) => {
                    const ay = Number(a.attrs.y || 0);
                    const by = Number(b.attrs.y || 0);
                    if (ay !== by) return ay - by;
                    return Number(a.attrs.x || 0) - Number(b.attrs.x || 0);
                });

            const rectNodes = templateNodes
                .filter((child) => child.className === 'Rect')
                .filter((child) => {
                    const attrs = child.attrs || {};
                    if (attrs.name === 'graph-bg') return false;
                    const h = Number(attrs.height || 0);
                    return h <= 20;
                })
                .map((child) => ({ child, attrs: Object.assign({}, child.attrs || {}) }))
                .sort((a, b) => {
                    const ay = Number(a.attrs.y || 0);
                    const by = Number(b.attrs.y || 0);
                    if (ay !== by) return ay - by;
                    return Number(a.attrs.x || 0) - Number(b.attrs.x || 0);
                });

            const titleNode = textNodes.length ? textNodes[0] : null;
            if (titleNode) {
                group.add(new Konva.Text(Object.assign({}, titleNode.attrs, {
                    text: title || String(titleNode.attrs.text || 'Bar'),
                    fontFamily: titleNode.attrs.fontFamily || fontFamilyForLang
                })));
            }

            const dataTextNodes = titleNode ? textNodes.slice(1) : textNodes;
            const labelTextNodes = dataTextNodes.filter(({ attrs }) => !/%$/.test(String(attrs.text || '').trim()));
            const percentTextNodes = dataTextNodes.filter(({ attrs }) => /%$/.test(String(attrs.text || '').trim()));

            labelTextNodes.forEach(({ attrs }, index) => {
                const row = normalizedRows[index] || normalizedRows[normalizedRows.length - 1] || { label: 'Skill', percent: 80 };
                const rawText = String(attrs.text || '');
                const finalText = row.label || rawText || 'Skill';
                group.add(new Konva.Text(Object.assign({}, attrs, {
                    text: finalText,
                    fontFamily: attrs.fontFamily || fontFamilyForLang
                })));
            });

            percentTextNodes.forEach(({ attrs }, index) => {
                const row = normalizedRows[index] || normalizedRows[normalizedRows.length - 1] || { label: 'Skill', percent: 80 };
                group.add(new Konva.Text(Object.assign({}, attrs, {
                    text: `${Math.round(row.percent || 0)}%`,
                    fontFamily: attrs.fontFamily || fontFamilyForLang
                })));
            });

            rectNodes.forEach(({ attrs }, index) => {
                const row = normalizedRows[Math.floor(index / 2)] || normalizedRows[normalizedRows.length - 1] || { label: 'Skill', percent: 80 };
                const barRatio = normalizeScore(row.percent) || 0;
                const nextAttrs = Object.assign({}, attrs);
                if (index % 2 === 0) {
                    nextAttrs.width = typeof attrs.width === 'number' ? attrs.width : barW;
                } else {
                    const trackWidth = (index > 0 && rectNodes[index - 1] && typeof rectNodes[index - 1].attrs.width === 'number')
                        ? rectNodes[index - 1].attrs.width
                        : barW;
                    nextAttrs.width = Math.max(4, Math.round(trackWidth * barRatio));
                }
                group.add(new Konva.Rect(nextAttrs));
            });
        } else {
            let currentY = 36;
            rows.forEach((item) => {
                const label = resolveLocalizedText(item && (item.name || item.label || item.title || item.text || item), lang) || 'Skill';
                const ratio = normalizeScore(getPercentForItem(item)) || 0;

                const labelAttrs = findTemplateTextAttrs(templateChildren, label) || {};
                const labelFontSize = labelAttrs.fontSize || barAttrs.labelFontSize || barAttrs.fontSize || 11;
                const labelFontFamily = labelAttrs.fontFamily || fontFamilyForLang;
                const maxLabelWidth = Math.max(140, barW - 60);
                const charsPerLine = isThaiLang
                    ? Math.max(10, Math.min(18, Math.floor(maxLabelWidth / Math.max(1, labelFontSize * 1.1))))
                    : Math.max(14, Math.min(30, Math.floor(maxLabelWidth / Math.max(1, labelFontSize * 0.75))));
                const formattedLabel = formatChartLabel(label, charsPerLine, lang);
                const labelText = Array.isArray(formattedLabel) ? formattedLabel.join('\n') : String(formattedLabel || label);
                const labelLineCount = Math.max(1, String(labelText || '').split('\n').length);
                const rowH = Math.max(55, Math.ceil((labelLineCount * labelFontSize * 1.25) + 24));

                group.add(new Konva.Text({
                    x: typeof labelAttrs.x === 'number' ? labelAttrs.x : barX,
                    y: typeof labelAttrs.y === 'number' ? labelAttrs.y : (currentY - 2),
                    text: labelText,
                    fontSize: labelFontSize,
                    fontFamily: labelFontFamily,
                    fill: labelAttrs.fill || '#475569',
                    fontStyle: labelAttrs.fontStyle || undefined,
                    width: typeof labelAttrs.width === 'number' ? labelAttrs.width : undefined,
                    align: labelAttrs.align || 'left',
                    wrap: 'none',
                    lineHeight: labelAttrs.lineHeight || 1.1
                }));
                group.add(new Konva.Text({ x: barX + barW - 40, y: currentY - 2, text: Math.round(ratio * 100) + '%', fontSize: 11, fontFamily: fontFamilyForLang, fill: '#475569', align: 'right', width: 40 }));
                group.add(new Konva.Rect({ x: barX, y: currentY + 12, width: barW, height: 6, fill: '#e2e8f0', cornerRadius: 3 }));
                group.add(new Konva.Rect({ x: barX, y: currentY + 12, width: Math.max(4, barW * ratio), height: 6, fill: '#dc2626', cornerRadius: 3 }));
                currentY += rowH;
            });
        }

        layer.add(group);
        applyZIndex(group, barAttrs);
    };

    const renderGraphPlaceholder = (attrs) => {
        const graphType = attrs.graphType || attrs.variableName || '';
        const graphKind = String(attrs.graphKind || '').toLowerCase();
        const isRadar = graphKind === 'radar' || String(graphType).includes('Radar');
        const cleanKey = String(graphType).replace(/Graph_/g, '');
        const isGeneral = String(attrs.graphScope || '').toLowerCase() === 'general' || cleanKey.includes('General');
        const templateChildren = Array.isArray(attrs.children) ? attrs.children : [];
        const width = attrs.width || 360;
        const height = attrs.height || 260;
        const layoutScale = Math.max(0.55, Math.min(1.25, Math.min(width / 600, height / 450)));
        const group = new Konva.Group({
            x: attrs.x || 0,
            y: attrs.y || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            rotation: attrs.rotation || 0,
            name: 'graph-placeholder',
            graphType: attrs.graphType
        });
        let title = isGeneral ? 'General Competencies' : 'Specific Competencies';

        const fallbackItems = isGeneral
            ? localizedCollection(dataMap.GeneralCompetencies || dataMap.generalCompetencies || [])
            : localizedCollection(dataMap.SpecificCompetencies || dataMap.specificCompetencies || []);

        if (!fallbackItems.length) {
            const titleAttrs = findGraphTitleAttrs(templateChildren, title, String(title || '').includes('à¸—à¸±à¸à¸©à¸°à¸—à¸±à¹ˆà¸§à¹„à¸›')
                ? 'General Competencies'
                : (String(title || '').includes('à¸—à¸±à¸à¸©à¸°à¹€à¸‰à¸žà¸²à¸°à¸—à¸²à¸‡') ? 'Specific Competencies' : title));
            group.add(new Konva.Text({
                x: typeof titleAttrs.x === 'number' ? titleAttrs.x : 10,
                y: typeof titleAttrs.y === 'number' ? titleAttrs.y : 8,
                text: title || 'Radar',
                fontSize: titleAttrs.fontSize || attrs.titleFontSize || attrs.fontSize || Math.round(16 * layoutScale),
                fontFamily: titleAttrs.fontFamily || fontFamilyForLang,
                fontStyle: titleAttrs.fontStyle || '600',
                fill: titleAttrs.fill || '#1e293b',
                width: typeof titleAttrs.width === 'number' ? titleAttrs.width : (width - 20),
                align: titleAttrs.align || 'left'
            }));

            group.add(new Konva.Text({
                x: 16,
                y: Math.round(height * 0.5),
                text: getEmptyResultMessage(),
                fontSize: Math.max(12, Math.round(13 * layoutScale)),
                fontFamily: fontFamilyForLang,
                fontStyle: 'normal',
                fill: '#64748b',
                width: Math.max(120, width - 32),
                align: 'left',
                wrap: 'word',
                lineHeight: 1.35
            }));

            layer.add(group);
            applyZIndex(group, attrs);
            return group;
        }

        const pData = {
            labels: fallbackItems.map((i) => localizedText(i && (i.name || i.label || i.title || i.text || i), lang)),
            datasets: [{
                label: 'You', data: fallbackItems.map((i) => getPercentForItem(i))
            }, {
                label: 'Average', data: fallbackItems.map((i) => (i && i.average !== undefined && i.average !== null)
                    ? (typeof i.average === 'number' ? Number(i.average) : valueToPercent(i.average))
                    : Math.max(0, getPercentForItem(i) - 10))
            }]
        };

        if (lang === 'th') {
            title = isGeneral ? 'ทักษะทั่วไป' : 'ทักษะเฉพาะทาง';
            pData.datasets[0].label = 'คุณ';
            pData.datasets[1].label = 'ค่าเฉลี่ย';
        }

        if (isRadar) {
            addRadarGraph(attrs, pData, fallbackItems, title, templateChildren);
        } else {
            addBarGraph(attrs, fallbackItems, title, templateChildren);
        }
    };

    return {
        addRadarGraph,
        addBarGraph,
        renderGraphPlaceholder
    };
};
