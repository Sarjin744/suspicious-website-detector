const User = require("../models/User");

// Try to import Analysis model safely (optional)
let Analysis;
try {
  Analysis = require("../models/Analysis");
} catch (err) {
  console.warn("⚠️ Analysis model not found — continuing without it.");
}

// 📊 GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    // Case-insensitive counts
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({
      role: { $regex: /^admin$/i },
    });
    const userCount = await User.countDocuments({
      role: { $regex: /^user$/i },
    });

    // 🧠 Optional: count analyses if model exists
    let totalAnalyses = 0;
    if (Analysis) {
      try {
        totalAnalyses = await Analysis.countDocuments();
      } catch (err) {
        console.warn("⚠️ Could not count analyses:", err.message);
        totalAnalyses = 0;
      }
    }

    const users = await User.find().select("-password");

    res.status(200).json({
      stats: { totalUsers, adminCount, userCount, totalAnalyses },
      users,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

// ➕ POST /api/admin/users
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Normalize role capitalization
    const validRoles = ["Admin", "User"];
    const assignedRole = validRoles.includes(
      role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase()
    )
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "User";

    const newUser = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ message: "Failed to add user" });
  }
};

// ✏️ PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only valid fields
    if (name) user.name = name;
    if (role && ["Admin", "User", "admin", "user"].includes(role)) {
      user.role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }

    await user.save();
    res.status(200).json({ message: "✅ User updated successfully" });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// 🗑 DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// 👁️ View a user’s search/analysis history
exports.getUserAnalyses = async (req, res) => {
  try {
    const userId = req.params.id;
    const analyses = await Analysis.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    if (!analyses || analyses.length === 0) {
      return res.status(404).json({ message: "No analysis history found for this user" });
    }

    res.json(analyses);
  } catch (err) {
    console.error("Get User Analyses Error:", err);
    res.status(500).json({ message: "Failed to fetch analysis history" });
  }
};
