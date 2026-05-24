const mongo = require('mongodb');
const StudentModel = require('../models/students.model');
const HardskillModel = require('../../Competencies/models/hardskill.model');
const SoftskillModel = require('../../Competencies/models/softskill.model');
const SchoolModel = require('../../Academic/models/school.model');
const ProgramModel = require('../../Academic/models/program.model');

const getLocalizedCandidates = (items) => {
    if (!Array.isArray(items)) return [];
    return items
        .filter(Boolean)
        .map((item) => {
            if (typeof item === 'string') {
                return { value: item, lang: 'en' };
            }
            return {
                value: item.value || item.name || item.title || '',
                lang: item.key || 'en'
            };
        })
        .filter((item) => String(item.value || '').trim());
};

const pickLongestLocalizedValue = (items) => {
    const candidates = getLocalizedCandidates(items);
    let longest = { value: '', lang: 'en', length: 0 };

    for (const candidate of candidates) {
        const value = String(candidate.value || '').trim();
        const length = value.length;
        if (length > longest.length) {
            longest = { value, lang: candidate.lang || 'en', length };
        }
    }

    return longest;
};

// Helper functions for masking sensitive data
const maskStudentName = (name, lang = 'en') => {
    if (!name) return (lang === 'th') ? 'ชื่อ' : 'Name';
    if (lang === 'th') {
        const prefix = 'ชื่อ ';
        const xCount = Math.max(0, name.length - prefix.length);
        return prefix + 'x'.repeat(xCount);
    } else {
        const prefix = 'Name ';
        const xCount = Math.max(0, name.length - prefix.length);
        return prefix + 'x'.repeat(xCount);
    }
};

const maskStudentID = (id, lang = 'en') => {
    if (!id || id.length < 9) return (lang === 'th') ? 'รหัสนักศึกษา' : 'Student ID';
    const xCount = Math.max(1, id.length - 9);
    return (lang === 'th' ? 'รหัสนักศึกษา ' : 'Student ID ') + 'x'.repeat(xCount);
};

const maskSchoolName = (name, lang = 'en') => {
    if (!name) return (lang === 'th') ? 'คณะ/โรงเรียน' : 'School';
    const prefix = (lang === 'th') ? 'คณะ/โรงเรียน ' : 'School ';
    if (name.length < prefix.length) return prefix.trim();
    const xCount = Math.max(1, name.length - prefix.length);
    return prefix + 'x'.repeat(xCount);
};

const maskProgramName = (name, lang = 'en') => {
    if (!name) return (lang === 'th') ? 'สาขาวิชา' : 'Major';
    const prefix = (lang === 'th') ? 'สาขาวิชา ' : 'Major ';
    if (name.length < prefix.length) return prefix.trim();
    const xCount = Math.max(1, name.length - prefix.length);
    return prefix + 'x'.repeat(xCount);
};

/**
 * Get longest student name in English
 */
exports.getLongestStudentNameData = async function () {
    try {
        const students = await StudentModel.find()
            .select('studentID name')
            .lean();

        let longest = {
            longestName: 'Name',
            length: 0,
            studentID: 'Student ID',
            lang: 'en'
        };

        for (const student of students) {
            const chosenName = pickLongestLocalizedValue(student.name);
            if (!chosenName.value) continue;

            if (chosenName.length > longest.length) {
                longest = {
                    longestName: maskStudentName(chosenName.value, chosenName.lang),
                    length: chosenName.length,
                    studentID: maskStudentID(student.studentID || '', chosenName.lang),
                    lang: chosenName.lang
                };
            }
        }

        return longest;
    } catch (err) {
        console.error('Error getting longest student name:', err);
        throw err;
    }
};

/**
 * Get longest school name in English
 */
exports.getLongestSchoolName = async function () {
    try {
        const schools = await SchoolModel.find()
            .select('title')
            .lean();

        let longest = {
            longestSchoolName: 'School',
            length: 0
        };

        for (const school of schools) {
            const chosenTitle = pickLongestLocalizedValue(school.title);
            if (!chosenTitle.value) continue;

            if (chosenTitle.length > longest.length) {
                longest = {
                    longestSchoolName: maskSchoolName(chosenTitle.value, chosenTitle.lang),
                    length: chosenTitle.length,
                    lang: chosenTitle.lang
                };
            }
        }

        return longest;
    } catch (err) {
        console.error('Error getting longest school name:', err);
        throw err;
    }
};

/**
 * Get longest program name in English
 */
exports.getLongestProgramName = async function () {
    try {
        const programs = await ProgramModel.find()
            .select('title')
            .lean();

        let longest = {
            longestProgramName: 'Major',
            length: 0
        };

        for (const program of programs) {
            const chosenTitle = pickLongestLocalizedValue(program.title);
            if (!chosenTitle.value) continue;

            if (chosenTitle.length > longest.length) {
                longest = {
                    longestProgramName: maskProgramName(chosenTitle.value, chosenTitle.lang),
                    length: chosenTitle.length,
                    lang: chosenTitle.lang
                };
            }
        }

        return longest;
    } catch (err) {
        console.error('Error getting longest program name:', err);
        throw err;
    }
};

/**
 * Get competency data for the program with most competencies
 */
exports.getMostCompetenciesProgram = async function () {
    try {
        const hardskills = await HardskillModel.find()
            .populate({
                path: 'program',
                select: 'title',
                model: 'Academic_Program'
            })
            .select('program title config')
            .lean();

        const softskills = await SoftskillModel.find()
            .select('title config')
            .lean();

        const programCounts = {};
        const programTitles = {};
        const programCompetencies = {};

        for (const skill of hardskills) {
            if (skill.program) {
                const programId = skill.program._id
                    ? skill.program._id.toString()
                    : (skill.program.toString ? skill.program.toString() : String(skill.program));

                if (!programCounts[programId]) {
                    programCounts[programId] = 0;
                    programTitles[programId] = skill.program.title || [];
                    programCompetencies[programId] = [];
                }

                programCounts[programId] += skill.config ? skill.config.length : 0;

                if (skill.title && Array.isArray(skill.title)) {
                    const titleEn = skill.title.find(t => t.key === 'en');
                    if (titleEn) {
                        programCompetencies[programId].push({
                            name: titleEn.value,
                            count: skill.config ? skill.config.length : 0
                        });
                    }
                }
            }
        }

        let maxProgram = null;
        let maxCount = 0;
        for (const [programId, count] of Object.entries(programCounts)) {
            if (count > maxCount) {
                maxCount = count;
                maxProgram = programId;
            }
        }

        let result = {
            programWithMostCompetencies: 'Major xxxxxxxxxxxxxxxxxxx',
            competenciesCount: 0,
            competenciesList: [],
            totalHardskills: hardskills.length,
            totalSoftskills: softskills.length
        };

        if (maxProgram && programTitles[maxProgram]) {
            const chosenTitle = pickLongestLocalizedValue(programTitles[maxProgram]);
            result.programWithMostCompetencies = chosenTitle.value || 'Unknown Program';
            result.competenciesCount = maxCount;
            result.competenciesList = programCompetencies[maxProgram] || [];
        }

        return result;
    } catch (err) {
        console.error('Error getting program with most competencies:', err);
        throw err;
    }
};

/**
 * Get all example data at once
 */
exports.getAllExampleData = async function () {
    try {
        const [studentData, schoolData, programData, competenciesData] = await Promise.all([
            exports.getLongestStudentNameData(),
            exports.getLongestSchoolName(),
            exports.getLongestProgramName(),
            exports.getMostCompetenciesProgram()
        ]);

        // Additionally compute per-locale longest masked values (en/th)
        // Students
        const students = await StudentModel.find().select('studentID name').lean();
        let studentEn = { value: '', masked: '', studentID: '', length: 0 };
        let studentTh = { value: '', masked: '', studentID: '', length: 0 };
        for (const s of students) {
            if (s.name && Array.isArray(s.name)) {
                const en = s.name.find(n => n.key === 'en');
                const th = s.name.find(n => n.key === 'th');
                if (en && en.value) {
                    const v = String(en.value).trim();
                    if (v.length > studentEn.length) {
                        studentEn = { value: v, masked: maskStudentName(v, 'en'), studentID: maskStudentID(s.studentID || '', 'en'), length: v.length };
                    }
                }
                if (th && th.value) {
                    const v = String(th.value).trim();
                    if (v.length > studentTh.length) {
                        studentTh = { value: v, masked: maskStudentName(v, 'th'), studentID: maskStudentID(s.studentID || '', 'th'), length: v.length };
                    }
                }
            }
        }

        // Schools
        const schools = await SchoolModel.find().select('title').lean();
        let schoolEn = { value: '', masked: '', length: 0 };
        let schoolTh = { value: '', masked: '', length: 0 };
        for (const sch of schools) {
            if (sch.title && Array.isArray(sch.title)) {
                const en = sch.title.find(t => t.key === 'en');
                const th = sch.title.find(t => t.key === 'th');
                if (en && en.value) {
                    const v = String(en.value).trim();
                    if (v.length > schoolEn.length) schoolEn = { value: v, masked: maskSchoolName(v, 'en'), length: v.length };
                }
                if (th && th.value) {
                    const v = String(th.value).trim();
                    if (v.length > schoolTh.length) schoolTh = { value: v, masked: maskSchoolName(v, 'th'), length: v.length };
                }
            }
        }

        // Programs
        const programs = await ProgramModel.find().select('title').lean();
        let programEn = { value: '', masked: '', length: 0 };
        let programTh = { value: '', masked: '', length: 0 };
        for (const pr of programs) {
            if (pr.title && Array.isArray(pr.title)) {
                const en = pr.title.find(t => t.key === 'en');
                const th = pr.title.find(t => t.key === 'th');
                if (en && en.value) {
                    const v = String(en.value).trim();
                    if (v.length > programEn.length) programEn = { value: v, masked: maskProgramName(v, 'en'), length: v.length };
                }
                if (th && th.value) {
                    const v = String(th.value).trim();
                    if (v.length > programTh.length) programTh = { value: v, masked: maskProgramName(v, 'th'), length: v.length };
                }
            }
        }

        return {
            // fallback legacy fields (overall longest)
            studentName: studentData.longestName,
            studentID: studentData.studentID,
            studentNameLength: studentData.length,
            studentNameLang: studentData.lang,
            school: schoolData.longestSchoolName,
            program: programData.longestProgramName,
            competencies: competenciesData,
            academyYear: new Date().getFullYear().toString(),
            // per-locale fields for frontend to pick
            studentNameEn: studentEn.masked || '',
            studentNameTh: studentTh.masked || '',
            studentIDEn: studentEn.studentID || '',
            studentIDTh: studentTh.studentID || '',
            schoolEn: schoolEn.masked || '',
            schoolTh: schoolTh.masked || '',
            programEn: programEn.masked || '',
            programTh: programTh.masked || ''
        };
    } catch (err) {
        console.error('Error getting all example data:', err);
        throw err;
    }
};
