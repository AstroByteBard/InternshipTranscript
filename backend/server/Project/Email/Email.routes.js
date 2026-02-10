const express = require('express');
const router = express.Router();

const Email = require("./service/email");

router.get("", Email.onQuerys);
router.post("/explorers", Email.onQuery);
router.post("", Email.onCreate);
router.put("", Email.onUpdate);
router.delete("", Email.onDelete);


module.exports = router;

