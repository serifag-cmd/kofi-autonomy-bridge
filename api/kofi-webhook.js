import crypto from "node:crypto";

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const raw = typeof req.body === "string" ? req.body : "";
  if (!raw) return {};
  try { return JSON.parse(raw); } catch {}
  return Object.fromEntries(new URLSearchParams(raw));
}

function normalize(payload) {
  return {
    received_at: new Date().toISOString(),
    message_id: payload.MessageID ?? payload.message_id ?? null,
    timestamp: payload.Timestamp ?? payload.timestamp ?? null,
    type: payload.Type ?? payload.type ?? null,
    from_name: payload.From ?? payload.from_name ?? null,
    email: payload.Email ?? payload.email ?? null,
    amount: payload.Amount ?? payload.amount ?? null,
    currency: payload.Currency ?? payload.currency ?? null,
    url: payload.URL ?? payload.url ?? null,
    shop_items: payload.ShopItems ?? payload.shop_items ?? null,
    raw: payload
  };
}

async function forward(target, event) {
  if (!target) return { attempted: false, ok: true };
  if (!target.startsWith("https://")) {
    return { attempted: true, ok: false, error: "automation_target_must_use_https" };
  }
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event)
    });
    return { attempted: true, ok: response.ok, status: response.status };
  } catch {
    return { attempted: true, ok: false, error: "automation_target_unreachable" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const payload = parseBody(req);
  const expected = process.env.KOFI_VERIFICATION_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: "missing_verification_token" });

  const supplied = payload.verification_token ?? payload.VerificationToken ?? "";
  if (!safeEqual(supplied, expected)) {
    return res.status(401).json({ ok: false, error: "invalid_verification_token" });
  }

  const event = normalize(payload);
  const forwarding = await forward(process.env.AUTOMATION_TARGET_URL, event);

  if (!forwarding.ok) {
    return res.status(502).json({ ok: false, error: forwarding.error || "automation_target_failed", status: forwarding.status });
  }

  return res.status(200).json({
    ok: true,
    received: true,
    forwarded: forwarding.attempted,
    event
  });
}
