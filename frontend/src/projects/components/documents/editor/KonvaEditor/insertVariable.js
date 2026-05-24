export default function insertVariable(variableName, opts = {}) {
    if (!variableName) return;

    const locale = String(opts.locale || this.templateLocale || 'th').toLowerCase();
    const isThai = locale.startsWith('th');

    if (variableName === '{GeneralCompetencies}' || variableName === '{SpecificCompetencies}') {
        return this.addCompetencyTable(variableName, opts);
    } else if (variableName === '{Suggestion}') {
        return this.addSuggestionTable(opts);
    } else if (variableName.startsWith('{Graph')) {
        return this.addGraphPlaceholder(variableName, opts);
    } else {
        const linkedOrderMap = {
            '{StudentName}': 0,
            '{School}': 1,
            '{Program}': 2,
            '{StudentID}': 3,
            '{AcademyYear}': 4,
        };
        const isLinkedDataVariable = Object.prototype.hasOwnProperty.call(linkedOrderMap, variableName);
        const linkedDataVariableGap = locale.startsWith('en') ? 20 : 0;
        // Use explicit language-specific fields (Th/En) only
        const mapping = {
            '{StudentName}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.studentNameTh ? this.exampleData.studentNameTh : '') : (this.exampleData && this.exampleData.studentNameEn ? this.exampleData.studentNameEn : ''),
            '{StudentID}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.studentIDTh ? this.exampleData.studentIDTh : '') : (this.exampleData && this.exampleData.studentIDEn ? this.exampleData.studentIDEn : ''),
            '{School}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.schoolTh ? this.exampleData.schoolTh : '') : (this.exampleData && this.exampleData.schoolEn ? this.exampleData.schoolEn : ''),
            '{Program}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.programTh ? this.exampleData.programTh : '') : (this.exampleData && this.exampleData.programEn ? this.exampleData.programEn : ''),
            '{AcademyYear}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.academyYearTh ? this.exampleData.academyYearTh : '') : (this.exampleData && this.exampleData.academyYearEn ? this.exampleData.academyYearEn : '')
        };
        const text = mapping[variableName] || variableName;
        return this.addTextBlock(text, {
            ...opts,
            onCreate: (node) => {
                node.setAttr('variableName', variableName);
                node.setAttr('placeholder', variableName);
                if (isLinkedDataVariable) {
                    node.setAttr('dataVariableLinked', true);
                    node.setAttr('dataVariableOrder', linkedOrderMap[variableName]);
                    node.setAttr('linkedDataVariableGap', linkedDataVariableGap);
                    node.setAttr('linkedDataVariableGroup', 'student-profile');
                    if (typeof this.enableManualDataVariableLinking === 'function') {
                        this.enableManualDataVariableLinking(node);
                    }
                }
                if (typeof opts.onCreate === 'function') opts.onCreate(node);
            }
        });
    }
}