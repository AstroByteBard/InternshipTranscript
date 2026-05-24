export default function getGeneralCompetencyLabels() {
    const locale = String(this.templateLocale || 'th').toLowerCase();
    const isThai = locale.startsWith('th');
    if (this.generalCompetencyLabels && this.generalCompetencyLabels.length) {
        return this.generalCompetencyLabels;
    }
    return isThai ? [
        'ความคิดสร้างสรรค์',
        'การคิดวิเคราะห์และการแก้ปัญหา',
        'ความฉลาดรู้ด้านดิจิทัล',
        'ความใฝ่รู้และการเรียนรู้ตลอดชีวิต',
        'ความยืดหยุ่นและความคล่องตัว',
        'จิตอาสาและความเห็นอกเห็นใจ',
        'ภาวะผู้นำและอิทธิพลทางสังคม',
        'การทำงานร่วมกับผู้อื่น',
        'ความเข้าใจวัฒนธรรมและพลเมือง',
        'ความคิดเชิงผู้ประกอบการ',
        'ทักษะภาษาต่างประเทศ',
        'การสื่อสาร'
    ] : [
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