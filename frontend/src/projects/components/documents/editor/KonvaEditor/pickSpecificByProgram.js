export default function pickSpecificByProgram(list, exampleData) {
    if (!Array.isArray(list) || !list.length) return null;

    const programName = this.normalizeText(exampleData && exampleData.program);
    if (programName) {
        const exact = list.find(item => {
            const programTitle = this.getProgramTitleEn(item && item.program);
            return this.normalizeText(programTitle) === programName;
        });
        if (exact) return exact;
    }

    const byProgramTitleLength = list
        .map(item => ({
            item,
            title: this.getProgramTitleEn(item && item.program)
        }))
        .sort((a, b) => (b.title || '').length - (a.title || '').length);

    if (byProgramTitleLength.length && byProgramTitleLength[0].item) {
        return byProgramTitleLength[0].item;
    }

    return list[0];
}