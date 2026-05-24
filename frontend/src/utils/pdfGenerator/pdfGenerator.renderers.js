import Konva from 'konva';
import { addThaiWordBreaks, applyZIndex, resolveLocalizedValue, getLocaleFontFamily } from '@/utils/pdfGenerator/pdfGenerator.logic';

export const createPdfRenderDispatch = ({
    layer,
    dataMap,
    renderGraphPlaceholder,
    addCompetencyTable,
    addSuggestionTable,
    resolveValue,
    replaceTextVariables,
    extractPlaceholderKey,
    renderedNodesByOrder,
    onCompetencyBottom
}) => {
    let competencyBottom = null;

    const updateCompetencyBottom = (bottom) => {
        if (!bottom) return;
        if (!competencyBottom || bottom > competencyBottom) competencyBottom = bottom;
        if (typeof onCompetencyBottom === 'function') onCompetencyBottom(competencyBottom);
    };

    const localeFontFamily = (lang) => getLocaleFontFamily(lang);

    const renderTextNode = (el, attrs) => {
        const originalText = attrs.text || '';
        const singleKeyMatcher = extractPlaceholderKey(attrs, originalText);

        let finalValue = originalText;
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

        const fontFamily = localeFontFamily(lang);

        const sX = (attrs.scaleX || 1);
        const finalWidth = attrs.width || ((794 - (attrs.x || 0)) / sX - 10);
        const resolvedFontFamily = attrs.fontFamily || fontFamily;

        const node = new Konva.Text(Object.assign({}, attrs, {
            text: addThaiWordBreaks(finalValue),
            width: finalWidth,
            wrap: 'word',
            fontFamily: resolvedFontFamily
        }));
        layer.add(node);
        applyZIndex(node, el.attrs);
        if (typeof attrs.createdOrder === 'number') {
            renderedNodesByOrder.set(Number(attrs.createdOrder), node);
        }
    };

    const renderImageNode = (el, attrs) => {
        const isGraph = attrs.elementType === 'graph' || attrs.name === 'graph-placeholder' || (attrs.variableName && attrs.variableName.includes('Graph_'));
        if (isGraph) {
            renderGraphPlaceholder(attrs);
            return;
        }

        if (!el._loadedImage) return;

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
    };

    const renderGroupNode = (el, attrs) => {
        if (attrs.elementType === 'graph' || attrs.name === 'graph-placeholder') {
            renderGraphPlaceholder(attrs);
            return;
        }

        const vn = String(attrs.variableName || '').toLowerCase();
        const isCompTable = attrs.name === 'competency-table' || vn.includes('generalcompet') || vn.includes('specificcompet') || (vn.includes('competenc') && !vn.includes('graph'));

        if (isCompTable) {
            const key = attrs.variableName || (vn.includes('general') ? '{GeneralCompetencies}' : '{SpecificCompetencies}');
            const isGeneral = String(key).indexOf('General') >= 0;
            const items = isGeneral
                ? (dataMap.GeneralCompetencies || dataMap.generalCompetencies || [])
                : (dataMap.SpecificCompetencies || dataMap.specificCompetencies || []);
            const safeItems = Array.isArray(items) ? items : [];
            const title = isGeneral ? 'General Competencies' : 'Specific Competencies';

            try {
                const topY = (attrs.y || 0);
                const h = (typeof attrs.height === 'number' && attrs.height > 0) ? attrs.height : 0;
                const bottom = topY + h;
                updateCompetencyBottom(bottom);
            } catch (e) { }

            addCompetencyTable(attrs, safeItems, title, attrs.children);
        } else if (attrs.name === 'suggestion-table' || attrs.name === 'suggestion-table-part') {
            const isPart = attrs.name === 'suggestion-table-part';
            const savedChildren = Array.isArray(attrs.children) ? attrs.children : null;
            const sug = dataMap.Suggestion || dataMap.suggestion || {};
            const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';

            const pickLocalizedSection = (value) => {
                const resolved = resolveLocalizedValue(value, lang);
                if (Array.isArray(resolved)) return resolved;
                if (resolved && typeof resolved === 'object') {
                    const langKey = String(lang || 'en').toLowerCase().startsWith('th') ? 'th' : 'en';
                    const altKey = langKey === 'th' ? 'en' : 'th';
                    if (Array.isArray(resolved[langKey])) return resolved[langKey];
                    if (Array.isArray(resolved[altKey])) return resolved[altKey];
                }
                return resolved;
            };

            let suggestionsObj;
            if (isPart) {
                const partVn = String(attrs.variableName || '').toLowerCase();
                const isOutstanding = partVn.includes('outstanding');
                const data = isOutstanding
                    ? pickLocalizedSection(dataMap.Outstanding || dataMap.outstanding || sug.Outstanding || sug.outstanding || [])
                    : pickLocalizedSection(dataMap.Opportunities || dataMap.opportunities || sug.Opportunities || sug.opportunities || []);

                suggestionsObj = isOutstanding ? { Outstanding: data } : { Opportunities: data };
            } else {
                suggestionsObj = {
                    Outstanding: pickLocalizedSection(dataMap.Outstanding || dataMap.outstanding || sug.Outstanding || sug.outstanding),
                    Opportunities: pickLocalizedSection(dataMap.Opportunities || dataMap.opportunities || sug.Opportunities || sug.opportunities)
                };
            }

            const localAttrs = Object.assign({}, attrs);
            addSuggestionTable(localAttrs, suggestionsObj, savedChildren);
        }
    };

    const renderElements = (elements) => {
        elements.forEach((el) => {
            const attrs = Object.assign({}, el.attrs || {});

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
                renderTextNode(el, attrs);
            } else if (el.className === 'Image') {
                renderImageNode(el, attrs);
            } else if (el.className === 'Group') {
                renderGroupNode(el, attrs);
            }
        });

        return competencyBottom;
    };

    return {
        renderElements,
        getCompetencyBottom: () => competencyBottom
    };
};
