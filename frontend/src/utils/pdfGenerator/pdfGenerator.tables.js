import Konva from 'konva';
import {
    addThaiWordBreaks,
    applyZIndex,
    computeBBox,
    wrapTextManual,
    getLocaleFontFamily
} from '@/utils/pdfGenerator/pdfGenerator.logic';
import { createPdfTableHelpers } from '@/utils/pdfGenerator/pdfGenerator.tables.helpers';

export const createPdfTableRenderers = ({ layer, dataMap = {} } = {}) => {
    const { ptToString, getName, normalize } = createPdfTableHelpers(dataMap);

    const getSuggestionSectionLabel = (isOpportunity) => {
        const lang = (dataMap && dataMap.__language) ? String(dataMap.__language).toLowerCase() : 'en';
        if (lang.startsWith('th')) {
            return isOpportunity ? 'จุดที่ควรพัฒนา' : 'จุดเด่น';
        }
        return isOpportunity ? 'Opportunity' : 'Outstanding';
    };

    const addCompetencyTable = (attrs, items, title, placeholderChildren) => {
        const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
        const defaultFontFamily = attrs.fontFamily || getLocaleFontFamily(lang);
        const group = new Konva.Group({
            x: attrs.x || 0,
            y: attrs.y || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            rotation: attrs.rotation || 0
        });

        const childList = Array.isArray(placeholderChildren) ? placeholderChildren : [];
        const textChildren = childList.filter((child) => child && child.className === 'Text');
        const displayTitle = (lang === 'th')
            ? (title === 'General Competencies' ? 'ทักษะทั่วไป' : 'ทักษะเฉพาะทาง')
            : (title || 'Competencies');
        const scoreLabel = lang === 'th' ? 'คะแนน' : 'Score';

        const templateOr = (templateAttrs, fallback) => Object.assign({}, fallback, templateAttrs || {});
        const addTextNode = (templateAttrs, overrides) => {
            group.add(new Konva.Text(Object.assign({}, templateAttrs || {}, overrides || {})));
        };

        if (textChildren.length) {
            const titleTemplate = textChildren[0] && textChildren[0].attrs ? textChildren[0].attrs : {};
            const scoreTemplate = textChildren[1] && textChildren[1].attrs ? textChildren[1].attrs : {};

            addTextNode(templateOr(titleTemplate, {
                fontFamily: defaultFontFamily,
                fontSize: 18,
                fontStyle: '600',
                fill: attrs.fill || '#1e293b',
                x: 0,
                y: 0
            }), {
                text: displayTitle,
                fontFamily: titleTemplate.fontFamily || defaultFontFamily,
                fontSize: titleTemplate.fontSize || 18,
                fontStyle: titleTemplate.fontStyle || '600',
                fill: titleTemplate.fill || attrs.fill || '#1e293b',
                x: typeof titleTemplate.x === 'number' ? titleTemplate.x : 0,
                y: typeof titleTemplate.y === 'number' ? titleTemplate.y : 0,
                width: titleTemplate.width,
                align: titleTemplate.align,
                lineHeight: titleTemplate.lineHeight,
                wrap: titleTemplate.wrap
            });

            addTextNode(templateOr(scoreTemplate, {
                fontFamily: defaultFontFamily,
                fontSize: 18,
                fontStyle: '600',
                fill: attrs.fill || '#1e293b',
                x: 350,
                y: 0
            }), {
                text: scoreLabel,
                fontFamily: scoreTemplate.fontFamily || defaultFontFamily,
                fontSize: scoreTemplate.fontSize || 18,
                fontStyle: scoreTemplate.fontStyle || '600',
                fill: scoreTemplate.fill || attrs.fill || '#1e293b',
                x: typeof scoreTemplate.x === 'number' ? scoreTemplate.x : 350,
                y: typeof scoreTemplate.y === 'number' ? scoreTemplate.y : 0,
                width: scoreTemplate.width,
                align: scoreTemplate.align,
                lineHeight: scoreTemplate.lineHeight,
                wrap: scoreTemplate.wrap
            });

            const rowTemplates = textChildren.slice(2);
            items.forEach((item, index) => {
                const nameTemplate = rowTemplates[2 * index] && rowTemplates[2 * index].attrs ? rowTemplates[2 * index].attrs : {};
                const scoreTemplateItem = rowTemplates[2 * index + 1] && rowTemplates[2 * index + 1].attrs ? rowTemplates[2 * index + 1].attrs : {};

                addTextNode(nameTemplate, {
                    text: item && item.name ? String(item.name) : 'N/A',
                    fontFamily: nameTemplate.fontFamily || defaultFontFamily,
                    fontSize: nameTemplate.fontSize || attrs.fontSize || 14,
                    fontStyle: nameTemplate.fontStyle || attrs.fontStyle || 'normal',
                    fill: nameTemplate.fill || attrs.fill || '#475569'
                });

                addTextNode(scoreTemplateItem, {
                    text: item && item.score !== undefined ? String(item.score) : 'X.X',
                    fontFamily: scoreTemplateItem.fontFamily || defaultFontFamily,
                    fontSize: scoreTemplateItem.fontSize || attrs.fontSize || 14,
                    fontStyle: scoreTemplateItem.fontStyle || attrs.fontStyle || 'normal',
                    fill: scoreTemplateItem.fill || attrs.fill || '#475569'
                });
            });

            layer.add(group);
            applyZIndex(group, attrs);
            return group;
        }

        // Fallback path when the template did not serialize children.
        const titleFontSize = 18;
        const contentFontSize = attrs.fontSize || 14;
        group.add(new Konva.Text({ text: displayTitle, fontSize: titleFontSize, fontFamily: defaultFontFamily, fontStyle: '600', fill: attrs.fill || '#1e293b', x: 0, y: 0 }));
        group.add(new Konva.Text({ text: scoreLabel, fontSize: titleFontSize, fontFamily: defaultFontFamily, fontStyle: '600', fill: attrs.fill || '#1e293b', x: 350, y: 0 }));
        let currentY = 50;
        const groupX = attrs.x || 0;
        const maxTableWidth = 794 - groupX - 10;
        const nameWidth = Math.min(320, maxTableWidth - 80);

        items.forEach((item) => {
            const nameNode = new Konva.Text({ text: item && item.name ? String(item.name) : 'N/A', fontSize: contentFontSize, fontFamily: defaultFontFamily, fontStyle: attrs.fontStyle || 'normal', fill: attrs.fill || '#475569', y: currentY, width: nameWidth, wrap: 'word' });
            group.add(nameNode);
            const scoreNode = new Konva.Text({ text: item && item.score !== undefined ? String(item.score) : 'X.X', fontSize: contentFontSize, fontFamily: defaultFontFamily, fontStyle: attrs.fontStyle || 'normal', fill: attrs.fill || '#475569', x: nameWidth + 30, y: currentY });
            group.add(scoreNode);
            const rowH = Math.max(nameNode.height(), scoreNode.height());
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
        const defaultFontFamily = attrs.fontFamily || getLocaleFontFamily(lang);

        const hasNestedGroups = Array.isArray(placeholderChildren) && placeholderChildren.some((c) => c && c.className === 'Group');
        const columns = [];

        if (hasNestedGroups) {
            placeholderChildren.forEach((child) => {
                if (!child || child.className !== 'Group') return;
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
            let colW = Number(attrs.width || 0);
            let labelText = null;
            let labelFontSize = 20;
            let contentFontSize = 14;
            let contentLineHeight = 1.4;
            let contentPlaceholderWidth = null;
            let labelAttrs = null;
            let contentAttrs = null;

            placeholderChildren.forEach((ch) => {
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

        if (columns.length >= 2) {
            if (!columns[0].labelText || columns[0].labelText.toLowerCase().includes('oppor')) columns[0].labelText = 'Outstanding';
            if (!columns[1].labelText || columns[1].labelText.toLowerCase().includes('outstand')) columns[1].labelText = 'Opportunity';
        }

        try {
            const totalW = (typeof attrs.width === 'number' && attrs.width > 0) ? attrs.width : 650;
            const gap = Number(attrs.columnGap || 20);
            const xs = columns.map((c) => Math.round(Number(c.x || 0)));
            const uniqueXs = new Set(xs);
            const invalid = columns.length === 0 || columns.some((c) => !Number.isFinite(c.x) || !Number.isFinite(c.width) || c.width <= 8) || uniqueXs.size !== columns.length;
            if (invalid) {
                if (columns.length >= 2) {
                    const w1 = Math.floor((totalW - gap) / 2);
                    const w2 = totalW - gap - w1;
                    columns[0] = Object.assign({}, columns[0] || {}, { x: 0, width: w1, labelFontSize: (columns[0] && columns[0].labelFontSize) || 18, contentFontSize: (columns[0] && columns[0].contentFontSize) || 12, contentLineHeight: (columns[0] && columns[0].contentLineHeight) || 1.2 });
                    columns[1] = Object.assign({}, columns[1] || {}, { x: w1 + gap, width: w2, labelFontSize: (columns[1] && columns[1].labelFontSize) || 18, contentFontSize: (columns[1] && columns[1].contentFontSize) || 12, contentLineHeight: (columns[1] && columns[1].contentLineHeight) || 1.2 });
                } else if (columns.length === 1) {
                    columns[0] = Object.assign({}, columns[0], { x: 0, width: totalW, labelFontSize: (columns[0] && columns[0].labelFontSize) || 18, contentFontSize: (columns[0] && columns[0].contentFontSize) || 12, contentLineHeight: (columns[0] && columns[0].contentLineHeight) || 1.2 });
                } else {
                    columns.push({ x: 0, width: totalW, labelText: 'Outstanding', labelFontSize: 18, contentFontSize: 12, contentLineHeight: 1.2, labelAttrs: null, contentAttrs: null });
                }
            } else {
                columns.forEach((c) => {
                    c.labelFontSize = Math.max(10, Math.min(48, c.labelFontSize || 18));
                    c.contentFontSize = Math.max(8, Math.min(32, c.contentFontSize || 12));
                    c.contentLineHeight = c.contentLineHeight || 1.2;
                    c.x = Math.round(c.x || 0);
                    c.width = Math.round(c.width || 0);
                });
            }
        } catch (e) { }

        const isForcedOpportunity = attrs.placeholderType?.toLowerCase().includes('oppor') || attrs.variableName?.toLowerCase().includes('oppor');
        const isForcedOutstanding = attrs.placeholderType?.toLowerCase().includes('outstand') || attrs.variableName?.toLowerCase().includes('outstand');

        const outstandingGroups = normalize(suggestionsObj.Outstanding || suggestionsObj.outstanding || [], dataMap.StudentName || 'Student');
        const opportunityGroups = normalize(suggestionsObj.Opportunities || suggestionsObj.opportunities || suggestionsObj.Opportunity || [], dataMap.StudentName || 'Student');

        if (columns.length >= 2) {
            const renderColumn = (colDef, groups, isOpp = false) => {
                if (!groups || !groups.length) return 0;
                const colGroup = new Konva.Group({ x: colDef.x || 0, y: colDef.y || 0 });
                group.add(colGroup);
                let y = 0;

                const labelText = getSuggestionSectionLabel(isOpp);
                const labelBaseAttrs = Object.assign({}, colDef.labelAttrs || {});
                const labelNode = new Konva.Text(Object.assign({}, labelBaseAttrs, {
                    text: labelText,
                    fontSize: colDef.labelFontSize || labelBaseAttrs.fontSize || 16,
                    fontFamily: labelBaseAttrs.fontFamily || defaultFontFamily,
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

                const itemsFlat = [];
                groups.forEach((g) => {
                    if (!g) return;
                    if (Array.isArray(g.points) && g.points.length) {
                        g.points.forEach((pt) => itemsFlat.push({ owner: g, text: pt }));
                    }
                });

                const contentBaseAttrs = colDef.contentAttrs || {};
                const AFTER_HEADER_INDENT = 12;
                const rawTextX = (typeof contentBaseAttrs.x === 'number') ? contentBaseAttrs.x : SUGGESTION_CONTENT_X;
                const labelLeftX = (typeof labelBaseAttrs.x === 'number') ? labelBaseAttrs.x : 0;
                const textX = Math.max(SUGGESTION_CONTENT_X, Math.max(rawTextX, labelLeftX + AFTER_HEADER_INDENT));
                const groupX = attrs.x || 0;
                const sX = attrs.scaleX || 1;
                const maxColWidth = ((740 - groupX) / sX) - colDef.x - textX - 10;

                let targetWidth = (typeof colDef.width === 'number' && colDef.width > 20) ? (colDef.width - 20) : ((typeof contentBaseAttrs.width === 'number') ? contentBaseAttrs.width : (contentBaseAttrs.contentPlaceholderWidth || colDef.contentPlaceholderWidth || 250));
                const contentWidth = Math.max(20, Math.min(targetWidth, maxColWidth));

                itemsFlat.forEach((it) => {
                    const fontSize = (typeof contentBaseAttrs.fontSize === 'number') ? contentBaseAttrs.fontSize : (colDef.contentFontSize || 12);
                    const itemY = y;
                    const bullet = new Konva.Circle({ x: Math.max(0, textX - 8), y: itemY + (fontSize * 0.6), radius: 3, fill: attrs.fill || '#1e293b' });
                    colGroup.add(bullet);

                    const rawText = ptToString(it.text, lang);
                    const txtFull = (contentBaseAttrs && contentBaseAttrs.wrap === 'none') ? rawText : addThaiWordBreaks(rawText);
                    const txtNode = new Konva.Text(Object.assign({}, contentBaseAttrs, {
                        text: txtFull,
                        fontSize: fontSize,
                        fontFamily: contentBaseAttrs.fontFamily || defaultFontFamily,
                        fontStyle: contentBaseAttrs.fontStyle || attrs.fontStyle || 'normal',
                        fill: contentBaseAttrs.fill || attrs.fill || '#1e293b',
                        x: textX,
                        y: itemY,
                        width: contentWidth,
                        align: 'left',
                        lineHeight: (typeof contentBaseAttrs.lineHeight === 'number') ? contentBaseAttrs.lineHeight : SUGGESTION_CONTENT_LINE_HEIGHT,
                        wrap: (typeof contentBaseAttrs.wrap === 'string') ? contentBaseAttrs.wrap : 'word'
                    }));
                    colGroup.add(txtNode);
                    const h = Math.ceil(txtNode.height() || (fontSize * SUGGESTION_CONTENT_LINE_HEIGHT));
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

            let labelText = getSuggestionSectionLabel(isOpp);
            const labelNode = new Konva.Text({
                text: labelText,
                fontSize: col.labelFontSize || 16,
                fontFamily: (col.labelAttrs && col.labelAttrs.fontFamily) || defaultFontFamily,
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
            data.forEach((g) => {
                if (!g) return;
                if (Array.isArray(g.points) && g.points.length) {
                    g.points.forEach((pt) => itemsFlat.push({ owner: g, text: pt }));
                }
            });

            const contentBaseAttrs = col.contentAttrs || {};
            const AFTER_HEADER_INDENT = 12;
            const rawTextX = (typeof contentBaseAttrs.x === 'number') ? contentBaseAttrs.x : SUGGESTION_CONTENT_X;
            const labelLeftX = (col.labelAttrs && typeof col.labelAttrs.x === 'number') ? col.labelAttrs.x : 0;
            const textX = Math.max(SUGGESTION_CONTENT_X, Math.max(rawTextX, labelLeftX + AFTER_HEADER_INDENT));
            const groupX = attrs.x || 0;
            const sX = attrs.scaleX || 1;
            const rightBoundary = isOpp ? 770 : 370;
            const maxColWidth = ((rightBoundary - groupX) / sX) - (col.x || 0) - textX - 5;

            const preferredSingleColContentWidth = (typeof col.width === 'number' && col.width > 20) ? (col.width - 20) : null;
            const contentWidth = preferredSingleColContentWidth ? Math.max(20, Math.min(preferredSingleColContentWidth, maxColWidth)) : ((typeof contentBaseAttrs.width === 'number') ? Math.max(20, Math.min(contentBaseAttrs.width, maxColWidth)) : Math.max(100, maxColWidth));

            itemsFlat.forEach((it) => {
                const fontSize = (typeof contentBaseAttrs.fontSize === 'number') ? contentBaseAttrs.fontSize : (col.contentFontSize || 12);
                const itemY = y;
                const bullet = new Konva.Circle({ x: Math.max(0, textX - 8), y: itemY + (fontSize * 0.6), radius: 3, fill: attrs.fill || '#1e293b' });
                colGroup.add(bullet);

                const rawText = ptToString(it.text, lang);
                const txtFull = (contentBaseAttrs && contentBaseAttrs.wrap === 'none') ? rawText : wrapTextManual(rawText, contentWidth, (typeof contentBaseAttrs.fontSize === 'number') ? contentBaseAttrs.fontSize : (col.contentFontSize || 13), contentBaseAttrs.fontFamily || defaultFontFamily);
                const txtNode = new Konva.Text(Object.assign({}, contentBaseAttrs, {
                    text: txtFull,
                    fontSize: fontSize,
                    fontFamily: contentBaseAttrs.fontFamily || defaultFontFamily,
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
            const addSection = (title, itemsArray) => {
                if (!itemsArray || !itemsArray.length) return;
                const boxWidth = (attrs.width && typeof attrs.width === 'number') ? attrs.width : 650;
                const leftMargin = 10;
                const textX = leftMargin + 15;
                const textWidth = Math.max(120, boxWidth - textX - 20);

                const titleNode = new Konva.Text({ text: title, fontSize: 22, fontFamily: defaultFontFamily, fontStyle: '600', fill: '#1e293b', x: 0, y: currentY, width: boxWidth });
                group.add(titleNode);
                currentY += (titleNode.height() || 28) + 8;

                const firstItem = itemsArray[0] || {};
                const nameRole = `${getName(firstItem, dataMap.StudentName || 'Student')} - ${firstItem.role || 'Student'}`;
                const nameNode = new Konva.Text({ text: nameRole, fontSize: 14, fontFamily: defaultFontFamily, fontStyle: '500', fill: '#475569', x: 0, y: currentY, width: Math.max(120, boxWidth - 120) });
                group.add(nameNode);

                const iconX = Math.max(400, boxWidth - 120);
                const calendarGroup = new Konva.Group({ x: iconX, y: currentY - 2 });
                calendarGroup.add(new Konva.Rect({ width: 16, height: 16, stroke: '#475569', strokeWidth: 1.5, cornerRadius: 2 }));
                group.add(calendarGroup);

                const dateNode = new Konva.Text({ text: firstItem.date || 'XX-XX-XXXX', fontSize: 14, fontFamily: defaultFontFamily, fill: '#475569', x: iconX + 40, y: currentY, width: 120 });
                group.add(dateNode);

                currentY += Math.max(nameNode.height() || 18, dateNode.height() || 18) + 8;

                itemsArray.forEach((adv) => {
                    if (Array.isArray(adv.points)) {
                        adv.points.forEach((pt) => {
                            const bullet = new Konva.Circle({ x: leftMargin, y: currentY + 7, radius: 3, fill: '#1e293b' });
                            group.add(bullet);

                            const txtFull = addThaiWordBreaks(ptToString(pt, lang));
                            const txtNode = new Konva.Text({
                                text: txtFull,
                                fontSize: 14,
                                fontFamily: defaultFontFamily,
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

            addSection(getSuggestionSectionLabel(false), outstandingGroups);
            addSection(getSuggestionSectionLabel(true), opportunityGroups);
        }

        layer.add(group);
        applyZIndex(group, attrs);
        return group;
    };

    return {
        addCompetencyTable,
        addSuggestionTable
    };
};
