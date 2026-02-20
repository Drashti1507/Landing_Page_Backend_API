const router = require("express").Router();
const {
  createQuote,
  getMyQuotes,
  getAllQuotes
} = require("../Controllers/quoteController");

const { protect, authorize } = require("../Middleware/authMiddleware");

router.post("/", protect, authorize("user"), createQuote);
router.get("/my", protect, authorize("user"), getMyQuotes);
router.get("/", protect, authorize("admin"), getAllQuotes);

module.exports = router;