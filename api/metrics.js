const ALLOWED = new Set([
  "visit","qualified_visit","lead","demo_requested","pilot_started",
  "payment","delivery","refund","renewal","feedback","failure"
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const body = req.body || {};
  const type = String(body.type || "");
  if (!ALLOWED.has(type)) {
    return res.status(400).json({ ok: false, error: "unsupported_event_type" });
  }

  const event = {
    id: body.id || crypto.randomUUID(),
    type,
    experiment_id: body.experiment_id || "lead-response-agent",
    amount_eur: Number.isFinite(Number(body.amount_eur)) ? Number(body.amount_eur) : null,
    occurred_at: body.occurred_at || new Date().toISOString(),
    metadata: body.metadata || {}
  };

  const target = process.env.AUTOMATION_TARGET_URL;
  let forwarded = false;
  if (target && target.startsWith("https://")) {
    try {
      const r = await fetch(target, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event)
      });
      forwarded = r.ok;
    } catch {}
  }

  res.status(200).json({
    ok: true,
    event,
    persisted: false,
    forwarded,
    note: "Stateless endpoint: configure durable storage before treating metrics as authoritative."
  });
}
