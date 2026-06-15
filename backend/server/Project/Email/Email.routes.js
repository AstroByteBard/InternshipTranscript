const express = require('express');
const router = express.Router();

const Student = require("./service/student");
const Adviser = require("./service/adviser");
const EmailTransactionAdvisor = require("./service/transaction/adviser");
const EmailTransactionStudent = require("./service/transaction/student");

router.get("/adviser", Adviser.onQuerys);
router.post("/adviser/explorers", Adviser.onQuery);
router.post("/adviser", Adviser.onCreate);
router.post("/adviser/send", Adviser.onSend);
router.put("/adviser", Adviser.onUpdate);
router.delete("/adviser", Adviser.onDelete);


router.get("/student", Student.onQuerys);
router.post("/student/explorers", Student.onQuery);
router.post("/student", Student.onCreate);
router.post("/student/send", Student.onSend);
router.put("/student", Student.onUpdate);
router.delete("/student", Student.onDelete);


router.get("/transaction/adviser", EmailTransactionAdvisor.onQuerys);
router.post("/transaction/adviser/explorers", EmailTransactionAdvisor.onQuery);
router.post("/transaction/adviser", EmailTransactionAdvisor.onCreate);
router.put("/transaction/adviser", EmailTransactionAdvisor.onUpdate);
router.delete("/transaction/adviser", EmailTransactionAdvisor.onDelete);

router.get("/transaction/student", EmailTransactionStudent.onQuerys);
router.post("/transaction/student/explorers", EmailTransactionStudent.onQuery);
router.post("/transaction/student", EmailTransactionStudent.onCreate);
router.put("/transaction/student", EmailTransactionStudent.onUpdate);
router.delete("/transaction/student", EmailTransactionStudent.onDelete);

module.exports = router;

