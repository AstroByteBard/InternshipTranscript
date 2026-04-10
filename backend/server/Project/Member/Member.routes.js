const express = require('express');
const router = express.Router();

const students = require("./service/students");
const advisors = require("./service/advisors");

router.get("/students", students.onQuerys);
router.post("/students/explore", students.onQuery)
router.post("/students", students.onCreate);
router.put("/students", students.onUpdate);
router.delete("/students", students.onDelete);

// Example data endpoints for document placeholder values
router.get("/example-data", students.getExampleData);
router.get("/longest-name", students.getLongestNameData);
router.get("/longest-school", students.getLongestSchoolName);
router.get("/longest-program", students.getLongestProgramName);
router.get("/most-competencies", students.getMostCompetenciesProgram);

router.get("/advisors", advisors.onQuerys);
router.post("/advisors", advisors.onCreate);
router.put("/advisors", advisors.onUpdate);
router.delete("/advisors", advisors.onDelete);

module.exports = router;


