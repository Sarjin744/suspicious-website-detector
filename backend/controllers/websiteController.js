const calculateRiskScore = require("../utils/riskScorer");
const { getWebsiteDetails } = require("../utils/getWebsiteDetails");
const Website = require("../models/Website");
const Analysis = require("../models/Analysis"); // ✅ new import

// Helper function to safely remove circular references
function safeSerialize(obj) {
  const seen = new WeakSet();

  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // Avoid circular refs
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return undefined;
        seen.add(value);
      }

      // Avoid storing huge raw TLS data
      if (key === "raw" && typeof value === "object") return undefined;
      if (key === "socket" || key === "request" || key === "res") return undefined;

      return value;
    })
  );
}

// 🧠 Analyze Website Controller
exports.analyzeWebsite = async (req, res) => {
  const { url } = req.body;
  const userId = req.user?.id || null;

  if (!url) return res.status(400).json({ message: "URL required" });

  try {
    console.log("🟢 Received analysis request for:", url);

    // 🔍 Get website details
    let details = await getWebsiteDetails(url);
    let fallbackUsed = false;

    const noData =
      !details.domain &&
      !details.http?.status &&
      !details.geo?.country &&
      !details.tls?.issuer;

    // Retry base domain if subdomain blocked
    if (noData) {
      const baseDomain = url
        .replace(/^https?:\/\//, "")
        .split("/")[0]
        .split(".")
        .slice(-2)
        .join(".");
      console.warn(`⚠️ Subdomain failed, retrying with base domain: ${baseDomain}`);
      details = await getWebsiteDetails(baseDomain);
      fallbackUsed = true;
      details.fallbackUsed = true;
      details.originalUrl = url;
    }

    // 🧠 Compute Suspicious Score using AI/ML logic
    const risk = calculateRiskScore(details);
    details.risk = risk;

    // 🧹 Clean object to prevent circular structures
    const cleanDetails = safeSerialize(details);

    // 💾 Save full record to Website model (for user’s history)
    const savedWebsite = await Website.create({
      url: cleanDetails.domain || url,
      create_date:
        cleanDetails.domainsdb?.create_date ||
        cleanDetails.rdap?.events?.find((e) => e.eventAction === "registration")
          ?.eventDate ||
        null,
      update_date: cleanDetails.domainsdb?.update_date || null,
      country:
        cleanDetails.geo?.country ||
        cleanDetails.domainsdb?.country ||
        cleanDetails.rdap?.entities?.[0]?.country ||
        null,
      analyzedBy: userId,
      riskScore: risk.score,
      riskLevel: risk.level,
      riskReasons: risk.reasons,
      details: cleanDetails,
    });

    // ✅ Also Save Summary Record to Analysis model (for admin stats)
    await Analysis.create({
      user: userId,
      url: savedWebsite.url,
      country: savedWebsite.country,
      risk: {
        score: risk.score,
        level: risk.level,
        reasons: risk.reasons,
      },
    });

    console.log(
      fallbackUsed
        ? `✅ Fallback successful for ${url}`
        : `✅ Analysis successful for ${url}`
    );

    return res.json(cleanDetails);
  } catch (err) {
    console.error("❌ Analysis failed:", err.message);
    res.status(200).json({
      input: url,
      message: "Partial analysis: some lookups failed",
      error: err.message,
    });
  }
};

