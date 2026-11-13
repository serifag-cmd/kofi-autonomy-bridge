function asText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const name = asText(body.name, 120);
    const email = asText(body.email, 200);
    const business = asText(body.business, 160);
    const problem = asText(body.problem, 2000);
    if (!name || !email || !business || !problem) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    const target = process.env.AUTOMATION_TARGET_URL;
    if (!target) return res.status(503).json({ ok: false, error: "lead_storage_not_configured" });
    let targetUrl;
    try { targetUrl = new URL(target); }
    catch { return res.status(503).json({ ok: false, error: "automation_target_invalid" }); }
    if (targetUrl.protocol !== "https:" || targetUrl.username || targetUrl.password) {
      return res.status(503).json({ ok: false, error: "automation_target_must_be_trusted_https" });
    }

    const event = {
      type: "lead",
      received_at: new Date().toISOString(),
      name, email, business, problem,
      source: "everest_landing_page"
    };
    const forwarded = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event)
    });
    if (!forwarded.ok) return res.status(502).json({ ok: false, error: "lead_storage_failed" });
    return res.status(202).json({ ok: true, received: true });
  } catch {
    return res.status(500).json({ ok: false, error: "lead_processing_failed" });
  }
}
