import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// ===================================================
// 🔐 AUTHENTICATION
// ===================================================

// 🧩 Signup new user
export const signupUser = async (formData) => {
  const res = await axios.post(`${API_BASE_URL}/auth/signup`, formData);
  return res.data;
};

// 🔑 Login user
export const loginUser = async (formData) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, formData);
  return res.data;
};

// ===================================================
// 🌐 WEBSITE ANALYSIS
// ===================================================

// Analyze website details
export const analyzeWebsite = async (token, url) => {
  const res = await axios.post(
    `${API_BASE_URL}/websites/analyze`,
    { url },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

// Fetch user’s analysis history
export const getUserAnalyses = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/websites/my-analyses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ===================================================
// 👤 USER PROFILE
// ===================================================

// ✅ Get logged-in user profile
export const getMyProfile = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Update user name or profile info
export const updateMyProfile = async (token, payload) => {
  const res = await axios.put(`${API_BASE_URL}/auth/update-profile`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Change password
export const changeMyPassword = async (token, payload) => {
  const res = await axios.put(`${API_BASE_URL}/auth/change-password`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAdminData = async (token) => {
  const res = await axios.get("http://localhost:5000/api/admin/data", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

