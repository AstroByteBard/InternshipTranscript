const express = require('express');
const router = express.Router();

const program = require("./service/program");
const school = require("./service/school");
const course = require("./service/course");

router.get("/program", program.onQuerys);
router.post("/program", program.onCreate);
router.put("/program", program.onUpdate);
router.delete("/program", program.onDelete);

router.get("/school", school.onQuerys);
router.post("/school", school.onCreate);
router.put("/school", school.onUpdate);
router.delete("/school", school.onDelete);

router.get("/course", course.onQuerys);
router.post("/course", course.onCreate);
router.put("/course", course.onUpdate);
router.delete("/course", course.onDelete);

module.exports = router;

