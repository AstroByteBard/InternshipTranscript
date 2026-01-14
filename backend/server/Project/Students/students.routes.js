const express = require('express');
const router = express.Router();

const students = require("./service/students");

router.get("", students.onQuerys);
router.post("/explorers", students.onQuery);
router.post("", students.onCreate);
router.put( "", students.onUpdate);
router.delete( "", students.onDelete);

module.exports = router;

