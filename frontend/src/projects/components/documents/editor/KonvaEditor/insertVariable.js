export default function insertVariable(variableName, opts = {}) {
    if (!variableName) return;

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
        const mapping = {
            '{StudentName}': this.exampleData.studentName || 'Name',
            '{StudentID}': this.exampleData.studentID || 'Student ID',
            '{School}': this.exampleData.school || 'School',
            '{Program}': this.exampleData.program || 'Major',
            '{AcademyYear}': 'Academic Year xxxx'
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
                    node.setAttr('linkedDataVariableGap', 0);
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