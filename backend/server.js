const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { protect, adminOnly } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));


// ✅ ROOT TEST
app.get("/", (req, res) => {
  res.send("🌐 Suspicious Website Detector API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
