export const createPdfTableHelpers = (dataMap = {}) => {
    const ptToString = (pt, lang) => {
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
            if (pt.title || pt.content) {
                const t = (pt.title && (pt.title[lang] || pt.title.en || pt.title.th)) ? (pt.title[lang] || pt.title.en || pt.title.th) : '';
                const c = (pt.content && (pt.content[lang] || pt.content.en || pt.content.th)) ? (pt.content[lang] || pt.content.en || pt.content.th) : '';
                if (t && c) return String(t) + '\n' + String(c);
                if (t) return String(t);
                if (c) return String(c);
            }
            if (pt[lang]) return String(pt[lang]);
            if (pt.th || pt.en) return String(pt.th || pt.en);
            if (pt.text) return ptToString(pt.text, lang);
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
                return ptToString(pt.value, lang);
            }
            if (Array.isArray(pt)) return pt.map((p) => ptToString(p, lang)).join(', ');
            if (pt.answer && pt.answer.value) return ptToString(pt.answer.value, lang);
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
        const lang = (dataMap && dataMap.__language) ? dataMap.__language : 'en';
        const items = Array.isArray(maybeItems) ? maybeItems : (maybeItems ? [maybeItems] : []);
        if (!items.length) return [];

        const extractSuggestionPoints = (value) => {
            const points = [];
            const pushPoint = (input) => {
                if (input == null) return;
                if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
                    const text = ptToString(input, lang).trim();
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
            return [{ id: 1, name: defaultName || dataMap.StudentName || 'Student', role: 'Student', picture: dataMap.StudentPhoto || '', date: '', points: items.map((pt) => ptToString(pt, lang)) }];
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
                    points: it.points.map((pt) => ptToString(pt, lang))
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
                        points: pts.map((pt) => ptToString(pt, lang))
                    };
                }
            }

            const single = ptToString(it, lang);
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

    return {
        ptToString,
        getName,
        normalize
    };
};
