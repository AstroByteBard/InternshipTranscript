const express = require('express');
const router = express.Router();

const message = require("./service/message");
const status = require("./service/status");
const group = require("./service/group")
const verification = require("./service/verification");
const province = require("./service/province")
const semester = require("./service/semester")
const general = require("./service/general")
const mockAuth = require("./service/mockAuth");
const realAuth = require("./service/realAuth");
// const auth_message = require("./service/auth_message");
// const Authen_Type = require("../Accounts/service/authen_type");

router.get("/province", province.onQuerys);
router.post("/province", province.onCreate);
router.put("/province", province.onUpdate);
router.delete("/province", province.onDelete);

router.get("/message", message.onQuerys);
router.post("/message", message.onCreate);
router.put("/message", message.onUpdate);
router.delete("/message", message.onDelete);

router.get("/status", status.onQuerys);
router.post("/status", status.onCreate);
router.put("/status", status.onUpdate);
router.delete("/status", status.onDelete);

router.get("/group", group.onQuerys)
router.post("/group", group.onCreate)
router.put("/group", group.onUpdate)
router.delete("/group", group.onDelete)

router.get("/semester", semester.onQuerys);
router.post("/semester", semester.onCreate);
router.put("/semester", semester.onUpdate);
router.delete("/semester", semester.onDelete);

router.get("/general", general.onGetSettings);
router.post("/general", general.onUpdateSettings);
router.put("/general", general.onUpdateSettings);

// router.get("/levels", level.onQuerys);
// router.post("/levels/explorers", level.onCreate);
// router.post("/levels", level.onCreate);
// router.put("/levels", level.onUpdate);
// router.delete("/levels", level.onDelete);

router.get("/verification", verification.onQuerys);
router.post("/verification/explorers", verification.onCreate);
router.post("/verification", verification.onCreate);
router.put("/verification", verification.onUpdate);
router.delete("/verification", verification.onDelete);


// authen service

// router.get("/auth/message", auth_message.onQuerys);
// router.post("/auth/message/explorers", auth_message.onCreate);
// router.post("/auth/message", auth_message.onCreate);
// router.put("/auth/message", auth_message.onUpdate);
// router.delete("/auth/message", auth_message.onDelete);

// router.get("/authen/type", Authen_Type.onQuerys);
// router.post("/authen/type", Authen_Type.onCreate);
// router.put("/authen/type", Authen_Type.onUpdate);
// router.delete("/authen/type", Authen_Type.onDelete);

/**
 * Mock Authentication Routes (Development/Testing Only)
 */
router.post("/auth/mock-login", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        const result = await mockAuth.mockLogin(email);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Mock login error:', err);
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// Real login using database lookup
router.post('/auth/login', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email required' });
        const result = await realAuth.loginByEmail(String(email).trim());
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Real login error:', err.message || err);
        return res.status(400).json({ success: false, message: err.message || 'Login failed' });
    }
});

router.get("/auth/mock-users", async (req, res) => {
    try {
        const users = await mockAuth.getAllMockUsers();
        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
