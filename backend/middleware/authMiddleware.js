const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🧠 Authenticate user
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user)
        return res.status(404).json({ message: "User not found" });

      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

// 🛡️ Restrict to Admin
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};
