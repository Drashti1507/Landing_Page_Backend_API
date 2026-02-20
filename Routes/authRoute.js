const router = require("express").Router();
const {
  registerUser,
  loginUser
} = require("../Controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;