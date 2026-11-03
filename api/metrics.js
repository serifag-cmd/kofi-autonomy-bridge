import { randomUUID } from "node:crypto";
import { persistEvent } from "./_lib/persist.js";

const CLIENT_EVENT_TYPES = new Set(["visit", "qualified_visit"]);

function safeText(value, max, pattern) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= max && pattern.test(text) ? text : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: "invalid_body" });
  }
  if (JSON.stringify(body).length > 8192) {
    return res.status(413).json({ ok: false, error: "payload_too_large" });
  }
  const type = typeof body.type === "string" ? body.type : "";
  if (!CLIENT_EVENT_TYPES.has(type)) {
    return res.status(403).json({ ok: false, error: "event_type_requires_trusted_server_source" });
  }

  const input = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata) ? body.metadata : {};
  const metadata = {};
  const page = safeText(input.page, 80, /^[a-z0-9/_-]+$/i);
  const language = safeText(input.language, 16, /^[a-z]{2,3}(?:-[a-z]{2,8})?$/i);
  if (page) metadata.page = page.toLowerCase();
  if (language) metadata.language = language.toLowerCase();

  // Client telemetry cannot assert a payment, delivery, refund or revenue.
  // Identity, experiment and time are assigned on the server.
  const event = {
    id: randomUUID(),
    type,
    experiment_id: "everest-zero-rescue-kit",
    occurred_at: new Date().toISOString(),
    metadata
  };
  const storage = await persistEvent(event, "public_telemetry");
  if (!storage.configured) return res.status(503).json({ ok: false, error: "durable_storage_not_configured" });
  if (!storage.persisted) return res.status(503).json({ ok: false, error: "durable_storage_unavailable" });
  return res.status(202).json({ ok: true, persisted: true, event_id: event.id, type: event.type });
}
