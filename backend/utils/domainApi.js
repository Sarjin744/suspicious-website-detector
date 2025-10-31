const axios = require("axios");
const dns = require("dns").promises;

exports.getDomainInfo = async (domain) => {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];
    let info = { create_date: "Unknown", update_date: "Unknown", country: "Unknown", city: "Unknown", isp: "Unknown" };

    // Try DomainsDB for creation/updated dates
    try {
      const res = await axios.get(`https://api.domainsdb.info/v1/domains/search?domain=${cleanDomain}`);
      const d = res.data.domains?.[0];
      if (d) {
        info.create_date = d.create_date || "Unknown";
        info.update_date = d.update_date || "Unknown";
        info.country = d.country || "Unknown";
      }
    } catch (err) {
      console.log("DomainsDB failed:", err.message);
    }

    // Get IP address for domain
    let ipAddress;
    try {
      const result = await dns.lookup(cleanDomain);
      ipAddress = result.address;
      console.log(`Resolved ${cleanDomain} → ${ipAddress}`);
    } catch (err) {
      console.log(`DNS lookup failed for ${cleanDomain}:`, err.message);
    }

    // If we have an IP, use ipwho.is for geolocation
    if (ipAddress) {
      try {
        const ipRes = await axios.get(`https://ipwho.is/${ipAddress}`);
        if (ipRes.data.success) {
          info.country = ipRes.data.country || info.country;
          info.city = ipRes.data.city || "Unknown";
          info.region = ipRes.data.region || "Unknown";
          info.isp = ipRes.data.connection?.isp || "Unknown";
        }
      } catch (err) {
        console.log("ipwho.is failed:", err.message);
      }
    }

    return info;
  } catch (err) {
    console.error("getDomainInfo error:", err.message);
    return { create_date: "Unknown", update_date: "Unknown", country: "Unknown" };
  }
};
