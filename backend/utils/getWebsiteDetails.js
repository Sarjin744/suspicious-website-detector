// backend/utils/getWebsiteDetails.js
// Requires: axios (npm i axios)
const axios = require("axios");
const dns = require("dns").promises;
const tls = require("tls");
const { URL } = require("url");
const https = require("https");

async function fetchHttpInfo(rawUrl, timeout = 8000) {
  const info = {
    status: null,
    finalUrl: null,
    redirects: [],
    headers: {},
    contentType: null,
    title: null,
    metaDescription: null,
    error: null,
  };

  try {
    const url = rawUrl.startsWith("http") ? rawUrl : "http://" + rawUrl;

    const resp = await axios.get(url, {
      timeout,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        // Pretend to be a real browser so websites don’t block the request
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    info.status = resp.status;
    info.finalUrl = resp.request?.res?.responseUrl || resp.config.url;
    info.headers = resp.headers || {};
    info.contentType = resp.headers["content-type"] || null;

    // Try to extract <title> and meta description
    const html = typeof resp.data === "string" ? resp.data : "";
    if (html && /<title>/i.test(html)) {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) info.title = titleMatch[1].trim();

      const metaDescMatch =
        html.match(
          /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
        ) ||
        html.match(
          /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i
        );
      if (metaDescMatch) info.metaDescription = metaDescMatch[1].trim();
    }
  } catch (err) {
    info.error = err.message || "Request failed";
  }

  return info;
}

function getTlsInfo(hostname, port = 443, timeout = 8000) {
  return new Promise((resolve) => {
    const result = {
      issuer: null,
      validFrom: null,
      validTo: null,
      raw: null,
      error: null,
    };

    try {
      const socket = tls.connect(
        { host: hostname, port, servername: hostname, rejectUnauthorized: false, timeout },
        () => {
          try {
            const cert = socket.getPeerCertificate && socket.getPeerCertificate(true);
            if (cert && Object.keys(cert).length) {
              result.issuer =
                (cert.issuer && cert.issuer.O) ||
                (cert.issuer && cert.issuer.CN) ||
                null;
              result.validFrom = cert.valid_from || cert.validFrom || null;
              result.validTo = cert.valid_to || cert.validTo || null;
              result.raw = cert;
            }
            socket.end();
            resolve(result);
          } catch (e) {
            socket.end();
            result.error = e.message;
            resolve(result);
          }
        }
      );

      socket.on("error", (e) => {
        result.error = e.message;
        resolve(result);
      });
      socket.on("timeout", () => {
        result.error = "TLS socket timeout";
        socket.end();
        resolve(result);
      });
    } catch (e) {
      result.error = e.message;
      resolve(result);
    }
  });
}

async function queryDomainsDB(domain) {
  try {
    const resp = await axios.get(
      `https://api.domainsdb.info/v1/domains/search?domain=${domain}`,
      { timeout: 7000 }
    );
    const d = resp.data.domains && resp.data.domains[0];
    return d || null;
  } catch (err) {
    return null;
  }
}

async function queryRDAP(domain) {
  try {
    const resp = await axios.get(`https://rdap.org/domain/${domain}`, {
      timeout: 7000,
      validateStatus: null,
    });
    if (resp.status === 200) return resp.data;
    return null;
  } catch (err) {
    return null;
  }
}

async function geoByIp(ip) {
  const result = {
    country: null,
    region: null,
    city: null,
    isp: null,
    provider: null,
    raw: null,
  };
  try {
    // ipwho.is
    const r1 = await axios.get(`https://ipwho.is/${ip}`, { timeout: 7000 });
    if (r1.data && r1.data.success) {
      result.country = r1.data.country || result.country;
      result.region = r1.data.region || result.region;
      result.city = r1.data.city || result.city;
      result.isp = r1.data.connection?.isp || result.isp;
      result.provider = "ipwho.is";
      result.raw = r1.data;
      return result;
    }
  } catch (e) {
    // ignore and try fallback
  }

  try {
    const r2 = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 7000 });
    if (r2.data) {
      result.country = r2.data.country_name || result.country;
      result.region = r2.data.region || result.region;
      result.city = r2.data.city || result.city;
      result.isp = r2.data.org || result.isp;
      result.provider = "ipapi.co";
      result.raw = r2.data;
    }
  } catch (e) {
    // ignore
  }

  return result;
}

async function checkPhishTankSimple(url) {
  try {
    const form = new URLSearchParams();
    form.append("url", url);
    form.append("format", "json");
    const r = await axios.post(
      "https://checkurl.phishtank.com/checkurl/",
      form.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 8000,
      }
    );
    return r.data.results || null;
  } catch (e) {
    return null;
  }
}

/**
 * Main aggregator function
 * @param {string} rawUrl - url or domain (e.g. "https://example.com" or "example.com")
 * @returns {object}
 */
async function getWebsiteDetails(rawUrl) {
  const out = {
    input: rawUrl,
    domain: null,
    resolvedIPs: [],
    http: null,
    tls: null,
    domainsdb: null,
    rdap: null,
    geo: null,
    phishtank: null,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  if (!rawUrl) {
    out.errors.push("No URL provided");
    return out;
  }

  // Normalize and extract hostname
  let hostname;
  try {
    hostname = new URL(rawUrl.startsWith("http") ? rawUrl : "http://" + rawUrl).hostname;
    out.domain = hostname;
  } catch (e) {
    out.errors.push("Invalid URL");
    return out;
  }

  // 1) HTTP info
  try {
    out.http = await fetchHttpInfo(rawUrl);
  } catch (e) {
    out.errors.push("HTTP fetch failed: " + e.message);
  }

  // 2) TLS info (if https)
  try {
    if (rawUrl.startsWith("https") || out.http?.finalUrl?.startsWith("https")) {
      out.tls = await getTlsInfo(hostname);
    } else {
      out.tls = { message: "No TLS (not https)" };
    }
  } catch (e) {
    out.errors.push("TLS fetch failed: " + e.message);
  }

  // 3) DNS resolution
  let ipList = [];
  try {
    const addrs = await dns.lookup(hostname, { all: true });
    ipList = addrs.map((a) => a.address);
    out.resolvedIPs = ipList;
  } catch (e) {
    try {
      const v4 = await dns.resolve4(hostname);
      ipList = v4;
      out.resolvedIPs = ipList;
    } catch (e2) {
      out.errors.push("DNS lookup failed: " + (e.message || e2.message));
    }
  }

  // 4) Geo info
  if (ipList.length) {
    try {
      out.geo = await geoByIp(ipList[0]);
    } catch (e) {
      out.errors.push("Geo lookup failed: " + e.message);
    }
  }

  // 5) DomainsDB info
  try {
    out.domainsdb = await queryDomainsDB(hostname);
  } catch (e) {
    out.errors.push("DomainsDB error: " + e.message);
  }

  // 6) RDAP info
  try {
    out.rdap = await queryRDAP(hostname);
  } catch (e) {
    out.errors.push("RDAP error: " + e.message);
  }

  // 7) PhishTank check
  try {
    out.phishtank = await checkPhishTankSimple(rawUrl);
  } catch (e) {
    // ignore
  }

  return out;
}

module.exports = { getWebsiteDetails };

