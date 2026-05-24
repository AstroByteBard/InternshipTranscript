import wordcut from 'wordcut';

const normalizeFontFamily = (fontFamily) => {
    return String(fontFamily || '')
        .split(',')
        .map((family) => {
            const trimmed = family.trim();
            if (!trimmed) return trimmed;
            const hasSpace = trimmed.indexOf(' ') >= 0;
            const hasQuotes = trimmed.indexOf('"') >= 0 || trimmed.indexOf("'") >= 0;
            return hasSpace && !hasQuotes ? `"${trimmed}"` : trimmed;
        })
        .join(', ');
};

export const measureTextWidth = (text, fontSize, fontFamily) => {
    if (typeof document === 'undefined') return text.length * (fontSize * 0.5);
    const canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'));
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px ${normalizeFontFamily(fontFamily)}`;
    return ctx.measureText(text).width;
};

export const wrapTextManual = (text, maxWidth, fontSize, fontFamily) => {
    if (!text || typeof text !== 'string') return text;

    const wrapParagraph = (paragraph) => {
        if (!paragraph) return '';

        let segmentsArr = null;
        try {
            if (wordcut && typeof wordcut.cut === 'function') {
                try {
                    let spaced = wordcut.cut(paragraph || '') || '';
                    spaced = String(spaced).replace(/\|/g, ' ');
                    segmentsArr = spaced.split(/\s+/).filter(Boolean);
                } catch (e) {
                    segmentsArr = null;
                }
            }
        } catch (e) {
            segmentsArr = null;
        }

        if (!segmentsArr) {
            if (typeof Intl === 'undefined' || !Intl.Segmenter) return paragraph;
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            segmentsArr = Array.from(segmenter.segment(paragraph)).map((s) => s.segment);
        }

        const words = [];
        for (const w of segmentsArr) {
            words.push(w === '\n' ? '\n' : w);
        }

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
                if (words[j] === '\n') {
                    if (cost[j + 1] > cost[i]) { cost[j + 1] = cost[i]; prev[j + 1] = i; }
                    break;
                }
                const w = widths[i][j];
                if (w === INF || w > maxWidth) break;
                const c = cost[i] + badness(w);
                if (c < cost[j + 1]) { cost[j + 1] = c; prev[j + 1] = i; }
            }
        }

        const linesArr = [];
        let idx = n;
        const splits = [];
        while (idx > 0) {
            const p = prev[idx];
            if (p === -1) {
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

    return String(text)
        .split(/\r?\n/)
        .map((paragraph) => wrapParagraph(paragraph))
        .join('\n');
};

export const wrapTextManualForRadarLabel = (text, maxWidth, fontSize, fontFamily, targetLines = 3) => {
    if (!text || typeof text !== 'string') return text;

    const scales = [1, 0.9, 0.8, 0.7, 0.6, 0.5];
    let best = text;

    for (const scale of scales) {
        const wrapped = wrapTextManual(text, Math.max(40, Math.round(maxWidth * scale)), fontSize, fontFamily);
        best = wrapped;
        const lineCount = String(wrapped || '').split('\n').filter(Boolean).length || 1;
        if (lineCount >= targetLines) {
            return wrapped;
        }
    }

    return best;
};

export const addThaiWordBreaks = (text) => {
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

    return text;
};

export const getLocaleFontFamily = (lang, fallback = 'Inter, Arial') => {
    const normalized = String(lang || 'en').toLowerCase();
    return normalized.startsWith('th')
        ? 'Noto Sans Thai, Sarabun, IBM Plex Sans Thai, Arial, sans-serif'
        : fallback;
};

export const applyZIndex = (node, attrs) => {
    if (typeof attrs.zIndex === 'number') {
        node.zIndex(attrs.zIndex);
    }
};

export const getVisibleTextWidth = (node, measureWidth = measureTextWidth) => {
    try {
        const attrs = node && typeof node.getAttrs === 'function' ? node.getAttrs() : {};
        const text = String((typeof node.text === 'function' ? node.text() : attrs.text) || '');
        if (!text) return 0;
        const fontSize = Number((typeof node.fontSize === 'function' ? node.fontSize() : attrs.fontSize) || 16);
        const fontFamily = normalizeFontFamily((typeof node.fontFamily === 'function' ? node.fontFamily() : attrs.fontFamily) || 'Arial');
        const padding = Number((typeof node.padding === 'function' ? node.padding() : attrs.padding) || 0);
        const lines = text.split(/\r?\n/);
        const widestLine = lines.reduce((max, line) => Math.max(max, measureWidth(String(line || ''), fontSize, fontFamily)), 0);
        const scaleX = Number((typeof node.scaleX === 'function' ? node.scaleX() : attrs.scaleX) || 1);
        return (widestLine + padding * 2) * Math.max(1, scaleX);
    } catch (err) {
        return 0;
    }
};

export const lookupNestedValue = (source, path) => {
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

export const resolveLocalizedValue = (value, lang = 'en') => {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map((item) => resolveLocalizedValue(item, lang));
    if (typeof value !== 'object') return value;

    const normalizedLang = String(lang || 'en').toLowerCase();
    const langKey = normalizedLang.startsWith('th') ? 'th' : 'en';
    const altKey = langKey === 'th' ? 'en' : 'th';

    if (Object.prototype.hasOwnProperty.call(value, langKey) && value[langKey] !== undefined) return value[langKey];
    if (Object.prototype.hasOwnProperty.call(value, altKey) && value[altKey] !== undefined) return value[altKey];

    for (const key of ['title', 'label', 'name', 'text', 'content']) {
        const nested = value[key];
        if (nested && typeof nested === 'object') {
            if (nested[langKey] !== undefined) return nested[langKey];
            if (nested[altKey] !== undefined) return nested[altKey];
            return nested;
        }
    }

    return value;
};

export const resolveLocalizedText = (value, lang = 'en') => {
    const resolved = resolveLocalizedValue(value, lang);
    if (resolved === null || resolved === undefined) return '';
    if (typeof resolved === 'string' || typeof resolved === 'number' || typeof resolved === 'boolean') {
        return String(resolved);
    }
    if (Array.isArray(resolved)) {
        return resolved.map((item) => resolveLocalizedText(item, lang)).filter(Boolean).join(', ');
    }
    if (typeof resolved === 'object') {
        return JSON.stringify(resolved);
    }
    return String(resolved);
};

export const normalizeScore = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    if (num <= 5) return Math.max(0, Math.min(1, num / 5));
    if (num <= 10) return Math.max(0, Math.min(1, num / 10));
    if (num <= 100) return Math.max(0, Math.min(1, num / 100));
    return Math.max(0, Math.min(1, num));
};

export const valueToPercent = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    if (num >= 0 && num < 1) return Math.round(num * 100);
    if (num >= 1 && num <= 5) return Math.round((num / 5) * 100);
    if (num > 5 && num <= 10) return Math.round((num / 10) * 100);
    if (num >= 0 && num <= 100) return Math.round(num);
    return Math.max(0, Math.min(100, Math.round(num)));
};

export const getPercentForItem = (item) => {
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

export const normalizeTextForMatch = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();

export const findTemplateTextAttrs = (templateChildren, matchText) => {
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

export const getRadarLabelTemplateAttrs = (templateChildren, title) => {
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

export const computeBBox = (children) => {
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

export const createPdfVariableHelpers = (dataMap = {}) => {
    const resolveValue = (key) => {
        if (!key) return '';
        const cleanKey = String(key).replace(/[{}]/g, '');
        const normalized = String(cleanKey).replace(/\s+/g, '').toLowerCase();

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
        if (result === text && !text.includes('{')) {
            const val = resolveValue(text);
            if (val !== '' && val !== undefined) return val;
        }
        return result;
    };

    const extractPlaceholderKey = (attrs, textValue) => {
        if (attrs && attrs.variableName) return attrs.variableName;
        if (attrs && attrs.placeholder) return attrs.placeholder;
        if (typeof textValue === 'string') {
            const match = textValue.match(/\{[^}]+\}/);
            if (match && match[0] === textValue) return match[0].replace(/[{}]/g, '');
        }
        return '';
    };

    return {
        resolveValue,
        replaceTextVariables,
        extractPlaceholderKey
    };
};