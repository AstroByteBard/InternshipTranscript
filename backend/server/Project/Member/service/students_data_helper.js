const mongo = require('mongodb');
const StudentModel = require('../models/students.model');
const HardskillModel = require('../../Competencies/models/hardskill.model');
const SoftskillModel = require('../../Competencies/models/softskill.model');

// Helper functions for masking sensitive data
const maskStudentName = (name) => {
    if (!name || name.length < 4) return 'Name';
    const xCount = Math.max(1, name.length - 4);
    return 'Name ' + 'X'.repeat(xCount);
};

const maskStudentID = (id) => {
    if (!id || id.length < 9) return 'Student ID';
    const xCount = Math.max(1, id.length - 9);
    return 'Student ID ' + 'X'.repeat(xCount);
};

const maskSchoolName = (name) => {
    if (!name || name.length < 6) return 'School';
    const xCount = Math.max(1, name.length - 6);
    return 'School ' + 'X'.repeat(xCount);
};

const maskProgramName = (name) => {
    if (!name || name.length < 5) return 'Major';
    const xCount = Math.max(1, name.length - 5);
    return 'Major ' + 'X'.repeat(xCount);
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
            longestStudentName: 'Name',
            length: 0,
            studentID: 'Student ID'
        };

        for (const student of students) {
            if (student.name && Array.isArray(student.name)) {
                const englishName = student.name.find(n => n.key === 'en');
                if (englishName && englishName.value) {
                    const nameLength = englishName.value.length;
                    if (nameLength > longest.length) {
                        longest = {
                            longestName: maskStudentName(englishName.value),
                            length: nameLength,
                            studentID: maskStudentID(student.studentID || '')
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
        const schools = await StudentModel.find()
            .populate({
                path: 'info.school',
                select: 'title',
                model: 'Academic_School'
            })
            .select('info.school')
            .lean();

        let longest = {
            longestSchoolName: 'School',
            length: 0
        };

        for (const student of schools) {
            if (student.info && student.info.school) {
                const schoolData = student.info.school;
                if (schoolData.title && Array.isArray(schoolData.title)) {
                    const englishTitle = schoolData.title.find(t => t.key === 'en');
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
        const students = await StudentModel.find()
            .populate({
                path: 'info.program',
                select: 'title',
                model: 'Academic_Program'
            })
            .select('info.program')
            .lean();

        let longest = {
            longestProgramName: 'Major',
            length: 0
        };

        for (const student of students) {
            if (student.info && student.info.program) {
                const programData = student.info.program;
                if (programData.title && Array.isArray(programData.title)) {
                    const englishTitle = programData.title.find(t => t.key === 'en');
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
            programWithMostCompetencies: 'Major XXXXXXXXXXXXXXXXXXX',
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
