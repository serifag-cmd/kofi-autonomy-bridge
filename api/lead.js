export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 200);
    const business = String(body.business || "").trim().slice(0, 160);
    const problem = String(body.problem || "").trim().slice(0, 2000);

    if (!name || !email || !business || !problem) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const event = {
      type: "lead",
      received_at: new Date().toISOString(),
      name,
      email,
      business,
      problem,
      source: "everest_landing_page"
    };

    const target = process.env.AUTOMATION_TARGET_URL;
    if (target) {
      if (!target.startsWith("https://")) {
        return res.status(500).json({ ok: false, error: "automation_target_must_use_https" });
      }
      const forwarded = await fetch(target, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event)
      });
      if (!forwarded.ok) {
        return res.status(502).json({ ok: false, error: "automation_target_failed" });
      }
    }

    return res.status(200).json({ ok: true, received: true });
  } catch {
    return res.status(500).json({ ok: false, error: "lead_processing_failed" });
  }
}
