const router = require("express").Router();
const {
  createContact,
  getContacts,
  getMyContacts
} = require("../Controllers/contactController");

const { protect, authorize } = require("../Middleware/authMiddleware");

// Public route to submit contact form
router.post("/", createContact);

// User route to see their own messages
router.get("/my", protect, authorize("user"), getMyContacts);

// Admin route to view all contact messages
router.get("/", protect, authorize("admin"), getContacts);

module.exports = router;
