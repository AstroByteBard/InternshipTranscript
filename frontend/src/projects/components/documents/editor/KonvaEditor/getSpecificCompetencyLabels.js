export default function getSpecificCompetencyLabels() {
    if (this.specificCompetencyLabels && this.specificCompetencyLabels.length) {
        return this.specificCompetencyLabels;
    }
    return [
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx'
    ];
}