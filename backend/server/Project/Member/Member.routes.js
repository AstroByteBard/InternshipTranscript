const express = require('express');
const router = express.Router();

const students = require("./service/students");
const advisors = require("./service/advisors");

router.get("/students", students.onQuerys);
router.post("/students", students.onCreate);
router.put("/students", students.onUpdate);
router.delete("/students", students.onDelete);

router.get("/advisors", advisors.onQuerys);
router.post("/advisors", advisors.onCreate);
router.put("/advisors", advisors.onUpdate);
router.delete("/advisors", advisors.onDelete);

module.exports = router;

