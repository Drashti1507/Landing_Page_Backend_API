const router = require("express").Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  updateProfile,
  getNotifications,
  markNotificationAsRead
} = require("../Controllers/authController");

const { protect } = require("../Middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id/read", protect, markNotificationAsRead);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-token/:token", verifyResetToken);

module.exports = router;