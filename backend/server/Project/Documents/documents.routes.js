const express = require('express');
const router = express.Router();

const documents = require("./service/documents");

router.get("/", documents.onQuerys);
router.get("/:id", documents.onQuery);
router.post("/", documents.onCreate);
router.put("/:id", documents.onUpdate);
router.put("/", documents.onUpdate);
router.delete("/:id", documents.onDelete);
router.delete("/", documents.onDelete);

module.exports = router;
