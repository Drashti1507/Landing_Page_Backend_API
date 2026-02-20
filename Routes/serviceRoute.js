const router = require("express").Router();
const {
  getServices,
  createService,
  updateService,
  deleteService
} = require("../Controllers/serviceController");

const { protect, authorize } = require("../Middleware/authMiddleware");

// Public
router.get("/", getServices);

// Admin Only
router.post("/", protect, authorize("admin"), createService);
router.put("/:id", protect, authorize("admin"), updateService);
router.delete("/:id", protect, authorize("admin"), deleteService);

module.exports = router;