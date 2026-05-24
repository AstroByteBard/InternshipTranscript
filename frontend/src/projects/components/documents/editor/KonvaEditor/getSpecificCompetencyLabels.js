export default function getSpecificCompetencyLabels() {
    const locale = String(this.templateLocale || 'th').toLowerCase();
    const isThai = locale.startsWith('th');
    if (this.specificCompetencyLabels && this.specificCompetencyLabels.length) {
        return this.specificCompetencyLabels;
    }
    return isThai ? [
        'ตัวอย่างทักษะเฉพาะ',
        'ตัวอย่างทักษะเฉพาะ',
        'ตัวอย่างทักษะเฉพาะ',
        'ตัวอย่างทักษะเฉพาะ',
        'ตัวอย่างทักษะเฉพาะ'
    ] : [
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx'
    ];
}