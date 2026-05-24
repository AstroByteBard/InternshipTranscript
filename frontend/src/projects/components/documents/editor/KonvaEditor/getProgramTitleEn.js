export default function getProgramTitleEn(program, key = 'en') {
    if (!program || !Array.isArray(program.title)) return '';
    return this.getLocalizedValue(program.title, key);
}