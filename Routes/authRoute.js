const router = require("express").Router();
const {
  registerUser,
  loginUser,
  getMe
} = require("../Controllers/authController");

const { protect } = require("../Middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;