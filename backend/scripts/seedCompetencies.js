'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const config = require('../config/config');
const HardSkill = require('../server/Project/Competencies/models/hardskill.model');
const SoftSkill = require('../server/Project/Competencies/models/softskill.model');
const Suggestions = require('../server/Project/Competencies/models/suggestions.model');

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected successfully.');

        const year = "2024";

        // --- Soft Skills Seed ---
        console.log('Seeding Soft Skills...');
        await SoftSkill.deleteMany({ year: year });
        await SoftSkill.create({
            year: year,
            title: [
                { key: 'en', value: 'General Competencies (Soft Skills)' },
                { key: 'th', value: 'สมรรถนะทั่วไป (Soft Skills)' }
            ],
            description: [
                { key: 'en', value: 'Assessment of general professional behaviors and interpersonal skills.' },
                { key: 'th', value: 'การประเมินพฤติกรรมวิชาชีพทั่วไปและทักษะระหว่างบุคคล' }
            ],
            config: [
                {
                    label: [{ key: 'en', value: 'Communication' }, { key: 'th', value: 'การสื่อสาร' }],
                    question: [{ key: 'en', value: 'Ability to express ideas clearly and listen actively.' }, { key: 'th', value: 'ความสามารถในการแสดงความคิดเห็นอย่างชัดเจนและฟังอย่างตั้งใจ' }]
                },
                {
                    label: [{ key: 'en', value: 'Teamwork' }, { key: 'th', value: 'การทำงานเป็นทีม' }],
                    question: [{ key: 'en', value: 'Collaborates effectively with others to achieve common goals.' }, { key: 'th', value: 'ทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพเพื่อบรรลุเป้าหมายร่วมกัน' }]
                },
                {
                    label: [{ key: 'en', value: 'Problem Solving' }, { key: 'th', value: 'การแก้ปัญหา' }],
                    question: [{ key: 'en', value: 'Identifies issues and implements effective solutions.' }, { key: 'th', value: 'ระบุปัญหาและดำเนินการแก้ปัญหาอย่างมีประสิทธิภาพ' }]
                },
                {
                    label: [{ key: 'en', value: 'Responsibility' }, { key: 'th', value: 'ความรับผิดชอบ' }],
                    question: [{ key: 'en', value: 'Shows commitment and reliability in assigned tasks.' }, { key: 'th', value: 'แสดงความมุ่งมั่นและความน่าเชื่อถือในงานที่ได้รับมอบหมาย' }]
                }
            ],
            active: true
        });

        // --- Hard Skills Seed ---
        console.log('Seeding Hard Skills...');
        await HardSkill.deleteMany({ year: year });
        await HardSkill.create({
            year: year,
            title: [
                { key: 'en', value: 'Specific Competencies (Hard Skills)' },
                { key: 'th', value: 'สมรรถนะเฉพาะทาง (Hard Skills)' }
            ],
            description: [
                { key: 'en', value: 'Assessment of technical skills and course-specific knowledge.' },
                { key: 'th', value: 'การประเมินทักษะทางเทคนิคและความรู้เฉพาะหลักสูตร' }
            ],
            config: [
                {
                    label: [{ key: 'en', value: 'Technical Proficiency' }, { key: 'th', value: 'ความเชี่ยวชาญทางเทคนิค' }],
                    question: [{ key: 'en', value: 'Knowledge of tools and technologies.' }, { key: 'th', value: 'ความรู้เกี่ยวกับเครื่องมือและเทคโนโลยี' }]
                },
                {
                    label: [{ key: 'en', value: 'Work Quality' }, { key: 'th', value: 'คุณภาพของงาน' }],
                    question: [{ key: 'en', value: 'Accuracy and completeness of technical outputs.' }, { key: 'th', value: 'ความถูกต้องและครบถ้วนของผลงานทางเทคนิค' }]
                },
                {
                    label: [{ key: 'en', value: 'Innovation' }, { key: 'th', value: 'นวัตกรรม' }],
                    question: [{ key: 'en', value: 'Ability to apply creative solutions to technical challenges.' }, { key: 'th', value: 'ความสามารถในการประยุกต์ใช้วิธีการสร้างสรรค์ในการแก้ปัญหาทางเทคนิค' }]
                }
            ],
            active: true
        });

        // --- Suggestions Seed ---
        console.log('Seeding Suggestions...');
        await Suggestions.deleteMany({ year: year });
        await Suggestions.create({
            year: year,
            title: [
                { key: 'en', value: 'Suggestions and Feedback' },
                { key: 'th', value: 'ข้อเสนอแนะและผลตอบรับ' }
            ],
            description: [
                { key: 'en', value: 'Advisor remarks on student performance and future growth.' },
                { key: 'th', value: 'ความเห็นของอาจารย์ที่ปรึกษาต่อผลการปฏิบัติงานและการเติบโตในอนาคต' }
            ],
            config: [
                {
                    label: [{ key: 'en', value: 'Strengths' }, { key: 'th', value: 'จุดแข็ง' }],
                    question: [{ key: 'en', value: 'What are the student\'s primary strengths?' }, { key: 'th', value: 'จุดเด่นเบื้องต้นของนักศึกษาคืออะไร?' }]
                },
                {
                    label: [{ key: 'en', value: 'Areas for Improvement' }, { key: 'th', value: 'สิ่งที่ควรพัฒนา' }],
                    question: [{ key: 'en', value: 'Which areas should the student focus on developing?' }, { key: 'th', value: 'นักศึกษาควรเน้นพัฒนาในด้านใด?' }]
                },
                {
                    label: [{ key: 'en', value: 'General Comments' }, { key: 'th', value: 'ความเห็นทั่วไป' }],
                    question: [{ key: 'en', value: 'Any other feedback for the student.' }, { key: 'th', value: 'ข้อเสนอแนะอื่นๆ สำหรับนักศึกษา' }]
                }
            ],
            active: true
        });

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

seed();
