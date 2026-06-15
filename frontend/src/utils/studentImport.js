import * as XLSX from 'xlsx';

export const HEADER_SYNONYMS = {
  studentID: ['ID'],
  nameThai: ['Name-Surname(TH)'],
  nameEnglish: ['Name-Surname(EN)'],
  programName: ['Programe(EN)'],
  schoolName: ['School(EN)'],
  organizationName: ['Organisation Name(EN)'],
  courseName: ['Course(EN)'],
  semesterEn: ['Semester(EN)'],
  yearEn: ['Year(EN)'],
  semesterTh: ['Semester(TH)'],
  yearTh: ['Year(TH)']
};

export const normalizeHeader = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFKC')
  .replace(/[\u200b-\u200d\ufeff]/g, '')
  .replace(/[\s\-_().,/\\|]+/g, '')
  .trim();

export const getHeaderIndex = (headers, aliases) => {
  const normalizedAliases = aliases.map(normalizeHeader);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeHeader(header)));
};

export const getCellValue = (headers, row, aliases) => {
  const index = getHeaderIndex(headers, aliases);
  if (index === -1) return null;
  const value = row[index];
  return value === undefined || value === null || value === '' ? null : value;
};

export const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFKC')
  .replace(/[\u200b-\u200d\ufeff]/g, '')
  .replace(/[\s\-_().,/\\|]+/g, '')
  .trim();

export const getLocalizedTitleValues = (item) => {
  if (!item) return [];

  if (Array.isArray(item.title)) {
    return item.title.map((entry) => entry && entry.value).filter(Boolean);
  }

  if (Array.isArray(item.name)) {
    return item.name.map((entry) => entry && entry.value).filter(Boolean);
  }

  if (typeof item.title === 'string') return [item.title];
  if (typeof item.name === 'string') return [item.name];
  return [];
};

export const findAcademicRecord = (items, importedValue) => {
  const target = normalizeText(importedValue);
  if (!target || !Array.isArray(items)) return null;

  return items.find((item) =>
    getLocalizedTitleValues(item).some((value) => normalizeText(value) === target)
  ) || null;
};

export const buildStudentImportPayload = (row, headers, stores = {}) => {
  const studentID = getCellValue(headers, row, HEADER_SYNONYMS.studentID);
  if (!studentID) return null;

  const nameThai = getCellValue(headers, row, HEADER_SYNONYMS.nameThai);
  const nameEnglish = getCellValue(headers, row, HEADER_SYNONYMS.nameEnglish);
  const programName = getCellValue(headers, row, HEADER_SYNONYMS.programName);
  const schoolName = getCellValue(headers, row, HEADER_SYNONYMS.schoolName);
  const organizationName = getCellValue(headers, row, HEADER_SYNONYMS.organizationName);
  const courseName = getCellValue(headers, row, HEADER_SYNONYMS.courseName);
    const semesterEn = getCellValue(headers, row, HEADER_SYNONYMS.semesterEn);
    const semesterTh = getCellValue(headers, row, HEADER_SYNONYMS.semesterTh);
    const yearEn = getCellValue(headers, row, HEADER_SYNONYMS.yearEn);
    const yearTh = getCellValue(headers, row, HEADER_SYNONYMS.yearTh);
    const email = getCellValue(headers, row, ['email', 'อีเมล']);

  const foundProgram = findAcademicRecord(stores.programs || [], programName);
  const foundSchool = findAcademicRecord(stores.schools || [], schoolName);
  const foundCourse = findAcademicRecord(stores.courses || [], courseName);
  const foundSemester = findAcademicRecord(stores.semesters || [], semesterEn || semesterTh);

  return {
    studentID: String(studentID).trim(),
    name: [
      { key: 'th', value: nameThai ? String(nameThai).trim() : '' },
      { key: 'en', value: nameEnglish ? String(nameEnglish).trim() : '' }
    ],
    email: email ? String(email).trim() : `${String(studentID).trim()}@lamduan.mfu.ac.th`,
    company: organizationName ? String(organizationName).trim() : null,
    info: {
      semester: foundSemester ? foundSemester._id : null,
      program: foundProgram ? foundProgram._id : null,
      programName: programName ? String(programName).trim() : null,
      school: foundSchool ? foundSchool._id : null,
      schoolName: schoolName ? String(schoolName).trim() : null,
      course: foundCourse ? foundCourse._id : null,
      courseName: courseName ? String(courseName).trim() : null,
      year: [
        yearEn ? { key: 'en', value: String(yearEn).trim() } : null,
        yearTh ? { key: 'th', value: String(yearTh).trim() } : null
      ].filter(Boolean)
    }
  };
};

export const extractStudentImportPayloadFromWorkbook = (workbook, stores = {}) => {
  const sheetNames = Array.isArray(workbook?.SheetNames) ? workbook.SheetNames : [];
  const payload = [];

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook?.Sheets?.[sheetName];
    if (!worksheet) return;

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    if (!Array.isArray(jsonData) || jsonData.length < 2) return;

    const headers = (jsonData[0] || []).map((h) => (h === undefined || h === null) ? '' : String(h));
    const rows = jsonData.slice(1);

    rows.forEach((row) => {
      if (!Array.isArray(row) || row.length === 0) return;
      const studentData = buildStudentImportPayload(row, headers, stores);
      if (studentData) {
        payload.push({
          ...studentData,
          _sheetName: sheetName
        });
      }
    });
  });

  return {
    sheetCount: sheetNames.length,
    payload
  };
};

export default {
  HEADER_SYNONYMS,
  normalizeHeader,
  getHeaderIndex,
  getCellValue,
  findAcademicRecord,
  buildStudentImportPayload,
  extractStudentImportPayloadFromWorkbook
};
