export default function getProgramTitleEn(program) {
    if (!program || !Array.isArray(program.title)) return '';
    return this.getLocalizedValue(program.title, 'en');
}