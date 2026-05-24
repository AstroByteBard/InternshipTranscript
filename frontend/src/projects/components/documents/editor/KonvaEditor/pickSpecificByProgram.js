export default function pickSpecificByProgram(list, exampleData) {
    if (!Array.isArray(list) || !list.length) return null;

    const locale = String(this.templateLocale || 'th').toLowerCase();
    const localeKey = locale.startsWith('th') ? 'th' : 'en';
    const programName = this.normalizeText(exampleData && exampleData.program);

    const getTitleCandidates = (program) => {
        if (!program || !Array.isArray(program.title)) return [];
        return program.title
            .filter(Boolean)
            .map((item) => String(item.value || '').trim())
            .filter(Boolean);
    };

    const getLongestTitleLength = (program) => {
        const candidates = getTitleCandidates(program);
        if (!candidates.length) return 0;
        return candidates.reduce((max, title) => Math.max(max, this.normalizeText(title).length), 0);
    };

    if (programName) {
        const exact = list.find(item => {
            const titles = getTitleCandidates(item && item.program);
            return titles.some((title) => this.normalizeText(title) === programName) || this.normalizeText(this.getProgramTitleEn(item && item.program, localeKey)) === programName;
        });
        if (exact) return exact;
    }

    const byProgramTitleLength = list
        .map(item => ({
            item,
            titleLength: Math.max(
                getLongestTitleLength(item && item.program),
                this.normalizeText(this.getProgramTitleEn(item && item.program, localeKey)).length
            )
        }))
        .sort((a, b) => (b.titleLength || 0) - (a.titleLength || 0));

    if (byProgramTitleLength.length && byProgramTitleLength[0].item) {
        return byProgramTitleLength[0].item;
    }

    return list[0];
}