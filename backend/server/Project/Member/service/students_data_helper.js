const mongo = require('mongodb');
const StudentModel = require('../models/students.model');
const HardskillModel = require('../../Competencies/models/hardskill.model');
const SoftskillModel = require('../../Competencies/models/softskill.model');
const SchoolModel = require('../../Academic/models/school.model');
const ProgramModel = require('../../Academic/models/program.model');

// Helper functions for masking sensitive data
const maskStudentName = (name, lang = 'en') => {
    if (!name) return 'Name';
    if (lang === 'th') {
        const prefix = 'Name';
        const xCount = Math.max(0, name.length - prefix.length);
        return prefix + 'x'.repeat(xCount);
    } else {
        const prefix = 'Name ';
        const xCount = Math.max(0, name.length - prefix.length);
        return prefix + 'x'.repeat(xCount);
    }
};

const maskStudentID = (id) => {
    if (!id || id.length < 9) return 'Student ID';
    const xCount = Math.max(1, id.length - 9);
    return 'Student ID ' + 'x'.repeat(xCount);
};

const maskSchoolName = (name) => {
    if (!name || name.length < 6) return 'School';
    const xCount = Math.max(1, name.length - 6);
    return 'School ' + 'x'.repeat(xCount);
};

const maskProgramName = (name) => {
    if (!name || name.length < 5) return 'Major';
    const xCount = Math.max(1, name.length - 5);
    return 'Major ' + 'x'.repeat(xCount);
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
            if (student.name && Array.isArray(student.name)) {
                const englishName = student.name.find(n => n.key === 'en');
                // consider both English and Thai name entries and pick the longest
                const candidates = [];
                if (englishName && englishName.value) candidates.push({ val: englishName.value, lang: 'en' });
                const thaiName = student.name.find(n => n.key === 'th');
                if (thaiName && thaiName.value) candidates.push({ val: thaiName.value, lang: 'th' });

                for (const c of candidates) {
                    const nameLength = c.val.length;
                    if (nameLength > longest.length) {
                        longest = {
                            longestName: maskStudentName(c.val, c.lang),
                            length: nameLength,
                            studentID: maskStudentID(student.studentID || ''),
                            lang: c.lang
                        };
                    }
                }
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
            if (school.title && Array.isArray(school.title)) {
                const englishTitle = school.title.find(t => t.key === 'en');
                if (englishTitle && englishTitle.value) {
                    const titleLength = englishTitle.value.length;
                    if (titleLength > longest.length) {
                        longest = {
                            longestSchoolName: maskSchoolName(englishTitle.value),
                            length: titleLength
                        };
                    }
                }
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
            if (program.title && Array.isArray(program.title)) {
                const englishTitle = program.title.find(t => t.key === 'en');
                if (englishTitle && englishTitle.value) {
                    const titleLength = englishTitle.value.length;
                    if (titleLength > longest.length) {
                        longest = {
                            longestProgramName: maskProgramName(englishTitle.value),
                            length: titleLength
                        };
                    }
                }
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
            const titleEn = programTitles[maxProgram].find(t => t.key === 'en');
            result.programWithMostCompetencies = titleEn ? titleEn.value : 'Unknown Program';
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

        return {
            studentName: studentData.longestName,
            studentID: studentData.studentID,
            studentNameLength: studentData.length,
            studentNameLang: studentData.lang,
            school: schoolData.longestSchoolName,
            program: programData.longestProgramName,
            competencies: competenciesData,
            academyYear: new Date().getFullYear().toString()
        };
    } catch (err) {
        console.error('Error getting all example data:', err);
        throw err;
    }
};
