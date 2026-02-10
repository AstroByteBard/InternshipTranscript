const express = require('express');
const router = express.Router();

const Student = require("./service/student");
const Adviser = require("./service/adviser");

router.get("/adviser", Adviser.onQuerys);
router.post("/adviser/explorers", Adviser.onQuery);
router.post("/adviser", Adviser.onCreate);
router.put("/adviser", Adviser.onUpdate);
router.delete("/adviser", Adviser.onDelete);


router.get("/student", Student.onQuerys);
router.post("/student/explorers", Student.onQuery);
router.post("/student", Student.onCreate);
router.put("/student", Student.onUpdate);
router.delete("/student", Student.onDelete);


module.exports = router;

