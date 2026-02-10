const express = require('express');
const router = express.Router();

const Hardskill = require("./service/hardskill");
const Softskill = require("./service/softskill");
const Suggestions = require("./service/suggestions");

router.get("/hardskill", Hardskill.onQuerys);
router.post("/hardskill", Hardskill.onCreate);
router.put("/hardskill", Hardskill.onUpdate);
router.delete("/hardskill", Hardskill.onDelete);

router.get("/softskill", Softskill.onQuerys);
router.post("/softskill", Softskill.onCreate);
router.put("/softskill", Softskill.onUpdate);
router.delete("/softskill", Softskill.onDelete);

router.get("/suggestions", Suggestions.onQuerys);
router.post("/suggestions", Suggestions.onCreate);
router.put("/suggestions", Suggestions.onUpdate);
router.delete("/suggestions", Suggestions.onDelete);

module.exports = router;

