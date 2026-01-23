const express = require('express');
const router = express.Router();

const major = require("./service/major");
const school = require("./service/school");

router.get("/major", major.onQuerys);
router.post("/major/sendmail", major.onSendEmail);
router.post("/major", major.onCreate);
router.put("/major", major.onUpdate);
router.delete("/major", major.onDelete);

router.get("/school", school.onQuerys);
router.post("/school/explorers", school.onQuery);
router.post("/school", school.onCreate);
router.put("/school", school.onUpdate);
router.delete("/school", school.onDelete);

module.exports = router;

