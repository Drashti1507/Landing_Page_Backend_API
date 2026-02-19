const express = require("express");
const userController = require("../Controllers/userController");
const { auth, authorize } = require("../Middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", userController.register);

// Login
router.post("/login", userController.login);

// User only route
router.get("/user-profile", auth, authorize(["user", "admin"]), userController.getProfile);

// Admin only route
router.get("/admin-dashboard", auth, authorize(["admin"]), userController.getAdminDashboard);

module.exports = router;
