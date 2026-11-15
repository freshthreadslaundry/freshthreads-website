export async function handler(event) {
  const response = (statusCode, data, cache = "no-store") => ({
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store",
      "Netlify-CDN-Cache-Control": cache },
    body: JSON.stringify(data),
  });
  if (event.httpMethod !== "GET") return response(405, { error: "GET required" });
  const { STA_BASE_URL, FT_WEBSITE_PRICES_SECRET, FT_PRICES_PREVIEW } = process.env;
  if (!STA_BASE_URL || !FT_WEBSITE_PRICES_SECRET) return response(503, { error: "Prices unavailable" });
  try {
    const url = new URL("/api/website-prices", STA_BASE_URL);
    if (url.protocol !== "https:" && !(FT_PRICES_PREVIEW === "1" && url.hostname === "127.0.0.1")) {
      return response(503, { error: "Prices unavailable" });
    }
    const upstream = await fetch(url, {
      headers: { "X-FT-Prices-Secret": FT_WEBSITE_PRICES_SECRET },
      redirect: "error",
      signal: AbortSignal.timeout(4000),
    });
    if (!upstream.ok) throw new Error("Upstream unavailable");
    const body = await upstream.json();
    if (!Array.isArray(body.rates) || body.rates.length > 5000 || !body.rates.every(r =>
      typeof r?.category === "string" && typeof r.item_name === "string" &&
      Number.isInteger(r.rate_order) && r.rate_order > 0 && typeof r.display_rate === "string")) {
      throw new Error("Invalid price catalogue");
    }
    return response(200, body, FT_PRICES_PREVIEW === "1" ? "no-store" : "public, s-maxage=120");
  } catch {
    return response(503, { error: "Prices unavailable" });
  }
}
