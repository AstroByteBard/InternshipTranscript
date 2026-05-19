export default function insertVariable(variableName, opts = {}) {
    if (!variableName) return;

    if (variableName === '{GeneralCompetencies}' || variableName === '{SpecificCompetencies}') {
        return this.addCompetencyTable(variableName, opts);
    } else if (variableName === '{Suggestion}') {
        return this.addSuggestionTable(opts);
    } else if (variableName.startsWith('{Graph')) {
        return this.addGraphPlaceholder(variableName, opts);
    } else {
        const mapping = {
            '{StudentName}': this.exampleData.studentName || 'Name',
            '{StudentID}': this.exampleData.studentID || 'Student ID',
            '{School}': this.exampleData.school || 'School',
            '{Program}': this.exampleData.program || 'Major',
            '{AcademyYear}': 'Academic Year XXXX'
        };
        const text = mapping[variableName] || variableName;
        return this.addTextBlock(text, {
            ...opts,
            onCreate: (node) => {
                node.setAttr('variableName', variableName);
                node.setAttr('placeholder', variableName);
                if (typeof opts.onCreate === 'function') opts.onCreate(node);
            }
        });
    }
}