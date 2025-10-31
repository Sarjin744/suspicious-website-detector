// backend/utils/riskScorer.js
module.exports = function calculateRiskScore(details = {}) {
  let score = 0;
  const reasons = [];

  // 1️⃣ Domain age (older = safer)
  const created = details.domainsdb?.create_date;
  if (!created) {
    score += 20;
    reasons.push("No creation date info");
  } else {
    const ageYears = (Date.now() - new Date(created)) / (1000 * 60 * 60 * 24 * 365);
    if (ageYears < 1) {
      score += 40;
      reasons.push("Domain is less than 1 year old");
    } else if (ageYears < 3) {
      score += 20;
      reasons.push("Domain is 1–3 years old");
    }
  }

  // 2️⃣ HTTP status — errors indicate instability
  const status = details.http?.status;
  if (!status || status >= 400) {
    score += 20;
    reasons.push(`HTTP status ${status || "unknown"}`);
  }

  // 3️⃣ TLS validity — expired or short = risky
  const tls = details.tls || {};
  if (tls.validTo) {
    const expiry = new Date(tls.validTo);
    if (expiry < new Date()) {
      score += 30;
      reasons.push("TLS certificate expired");
    }
  } else {
    score += 10;
    reasons.push("No TLS info found");
  }

  // 4️⃣ Country check (optional heuristic)
  const country = details.geo?.country?.toLowerCase() || "";
  if (country && ["russia", "china", "iran", "unknown"].includes(country)) {
    score += 15;
    reasons.push(`Server in high-risk country: ${country}`);
  }

  // 5️⃣ PhishTank record
  const phish = details.phishtank;
  if (phish?.in_database && phish?.valid) {
    score += 50;
    reasons.push("Listed in PhishTank database");
  }

  // 6️⃣ Fallback or unknown domain
  if (details.fallbackUsed) {
    score += 10;
    reasons.push("Used fallback (subdomain failed)");
  }

  // Cap score at 100
  if (score > 100) score = 100;

  // Classification
  let level = "Safe";
  if (score > 60) level = "Dangerous";
  else if (score > 30) level = "Suspicious";

  return { score, level, reasons };
};
