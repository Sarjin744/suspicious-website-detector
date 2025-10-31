const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  updateProfile,
  getMyProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected Routes
router.get("/me", protect, getMyProfile);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
