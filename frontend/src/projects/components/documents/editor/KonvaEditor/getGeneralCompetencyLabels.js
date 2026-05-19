export default function getGeneralCompetencyLabels() {
    if (this.generalCompetencyLabels && this.generalCompetencyLabels.length) {
        return this.generalCompetencyLabels;
    }
    return [
        'Creativity',
        'Analytical thinking and Problem solving',
        'Digital literacy',
        'Curiosity and life-long learning',
        'Resilience, flexibility and agility',
        'Voluntary and empathy',
        'Leadership and social influence',
        'Collaboration',
        'Cultural and civic literacy',
        'Entrepreneurial mindset',
        'Foreign language',
        'Communication'
    ];
}