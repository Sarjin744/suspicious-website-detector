const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAdminDashboard,
  addUser,
  updateUser,
  deleteUser,
  getUserAnalyses, // ✅ Make sure this is imported
} = require("../controllers/adminController");

// Existing admin routes
router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.post("/users", protect, adminOnly, addUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// ✅ NEW ROUTE for viewing one user’s analyses
router.get("/users/:id/analyses", protect, adminOnly, getUserAnalyses);

module.exports = router;
