import crypto from "node:crypto";
import { persistEvent } from "./_lib/persist.js";

const EXPECTED_ITEMS = new Set([
  "freelancer rescue kit — quote, scope & cashflow pack",
  "freelancer rescue kit — pack de presupuestos, alcance y caja"
]);

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function parsePayload(req) {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); }
    catch { body = Object.fromEntries(new URLSearchParams(body)); }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  // Ko-fi commonly posts application/x-www-form-urlencoded with a JSON "data" field.
  if (typeof body.data === "string") {
    try { return JSON.parse(body.data); } catch { return null; }
  }
  return body;
}

function stableUuid(messageId) {
  const value = String(messageId || "").trim();
  const uuid = value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  if (uuid) return value.toLowerCase();

  const digest = crypto.createHash("sha256").update("kofi:" + value).digest("hex").slice(0, 32).split("");
  digest[12] = "5";
  digest[16] = ((parseInt(digest[16], 16) & 0x3) | 0x8).toString(16);
  const hex = digest.join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function parseShopItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {}
  }
  return [];
}

function matchingItem(items) {
  return items.find(item => {
    const name = String(item?.item_name ?? item?.name ?? "").trim().toLowerCase();
    const quantity = Number(item?.quantity ?? 1);
    return EXPECTED_ITEMS.has(name) && Number.isInteger(quantity) && quantity > 0;
  }) || null;
}

function normalizedTimestamp(value) {
  const timestamp = value ? new Date(value) : new Date();
  return Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const payload = parsePayload(req);
  if (!payload) return res.status(400).json({ ok: false, error: "invalid_kofi_payload" });

  const expected = process.env.KOFI_VERIFICATION_TOKEN;
  if (!expected) return res.status(503).json({ ok: false, error: "missing_verification_token" });
  const supplied = payload.verification_token ?? payload.VerificationToken ?? "";
  if (!safeEqual(supplied, expected)) {
    return res.status(401).json({ ok: false, error: "invalid_verification_token" });
  }

  // Ko-fi sends webhooks for tips, memberships and other payments too.
  // Only this precise digital Shop Order can be attributed to the Rescue Kit.
  const kofiType = String(payload.Type ?? payload.type ?? "").trim().toLowerCase();
  if (kofiType !== "shop order") {
    return res.status(200).json({ ok: true, received: true, ignored: true, reason: "not_a_shop_order" });
  }

  const items = parseShopItems(payload.ShopItems ?? payload.shop_items);
  const item = matchingItem(items);
  if (!item) {
    return res.status(200).json({ ok: true, received: true, ignored: true, reason: "not_the_rescue_kit_product" });
  }

  const currency = String(payload.Currency ?? payload.currency ?? "").trim().toUpperCase();
  const amount = Number(payload.Amount ?? payload.amount);
  const messageId = String(payload.MessageID ?? payload.message_id ?? "").trim();
  if (currency !== "EUR" || !Number.isFinite(amount) || amount <= 0 || !messageId) {
    return res.status(200).json({ ok: true, received: true, ignored: true, reason: "incomplete_or_non_eur_order_signal" });
  }

  const event = {
    id: stableUuid(messageId),
    type: "payment",
    experiment_id: "everest-zero-rescue-kit",
    amount_eur: amount,
    occurred_at: normalizedTimestamp(payload.Timestamp ?? payload.timestamp),
    metadata: {
      provider: "kofi",
      kofi_type: "Shop Order",
      message_id: messageId,
      item_name: String(item.item_name ?? item.name),
      quantity: Number(item.quantity ?? 1),
      currency: "EUR",
      evidence_status: "provider_webhook_received_pending_provider_reconciliation"
    }
  };

  const storage = await persistEvent(event, "kofi");
  if (!storage.persisted) {
    return res.status(503).json({
      ok: false,
      error: storage.configured ? "durable_storage_failed" : "durable_storage_not_configured",
      retryable: true
    });
  }

  const target = process.env.AUTOMATION_TARGET_URL;
  if (target) {
    let targetUrl;
    try { targetUrl = new URL(target); }
    catch { return res.status(503).json({ ok: false, error: "automation_target_invalid", persisted: true }); }
    if (targetUrl.protocol !== "https:" || targetUrl.username || targetUrl.password) {
      return res.status(503).json({ ok: false, error: "automation_target_must_be_trusted_https", persisted: true });
    }
    try {
      const forwarded = await fetch(targetUrl.toString(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event)
      });
      if (!forwarded.ok) {
        return res.status(503).json({ ok: false, error: "automation_target_failed", persisted: true, retryable: true });
      }
    } catch {
      return res.status(503).json({ ok: false, error: "automation_target_unreachable", persisted: true, retryable: true });
    }
  }

  // This webhook is an event source, not the final revenue ledger. Reconcile
  // the same MessageID against PayPal/Stripe before declaring a verified sale.
  return res.status(200).json({
    ok: true,
    received: true,
    persisted: true,
    event_id: event.id,
    evidence_status: "provider_webhook_received_pending_provider_reconciliation"
  });
}
