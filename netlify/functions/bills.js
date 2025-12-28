// netlify/functions/bill.js

export async function handler(event) {
  try {
    const token = (event.queryStringParameters?.token || "").trim();
    if (!token) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing token" }) };
    }

    const STA_BASE = process.env.STA_BASE_URL; // e.g. https://sta.freshthreadslaundry.co.in
    const SECRET = process.env.FT_INTERNAL_SECRET;

    if (!STA_BASE || !SECRET) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server not configured" }) };
    }

    const url = `${STA_BASE.replace(/\/$/, "")}/api/bill-info/${encodeURIComponent(token)}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "X-FT-SECRET": SECRET,
        "Accept": "application/json",
      },
    });

    const text = await resp.text();
    return {
      statusCode: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: text,
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Unknown error" }) };
  }
}
