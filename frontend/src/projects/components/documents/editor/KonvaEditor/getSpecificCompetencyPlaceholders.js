export default function getSpecificCompetencyPlaceholders() {
    const fromConfig = this.getSpecificCompetencyLabels();
    if (Array.isArray(fromConfig) && fromConfig.length) {
        const maxLength = fromConfig.reduce((max, label) => {
            const length = Math.max(1, String(label || '').trim().length || 1);
            return Math.max(max, length);
        }, 1);
        return fromConfig.map(() => 'X'.repeat(maxLength));
    }

    const list = (this.exampleData && this.exampleData.competencies && this.exampleData.competencies.competenciesList)
        ? this.exampleData.competencies.competenciesList
        : [];
    if (Array.isArray(list) && list.length) {
        const maxLength = list.reduce((max, item) => {
            const name = item && item.name ? String(item.name) : '';
            const length = Math.max(1, name.trim().length || 1);
            return Math.max(max, length);
        }, 1);
        return list.map(() => 'X'.repeat(maxLength));
    }

    const fallbackLabels = [
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxx'
    ];
    return fallbackLabels.map((label) => {
        const length = Math.max(1, String(label || '').trim().length || 1);
        return 'X'.repeat(length);
    });
}