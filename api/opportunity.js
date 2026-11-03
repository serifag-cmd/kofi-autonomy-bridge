import crypto from "node:crypto";

const PRODUCT = {
  id: "pet-portrait-v1",
  name: "Personalized Pet Portrait",
  price_eur: 7.90,
  delivery: "digital",
  turnaround_hours: 48,
  deliverables: ["square", "vertical"],
  revisions: 1
};

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function bearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || "";
  return typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : "";
}

function createJobSpec(event) {
  return {
    job_type: "pet_portrait",
    product_id: PRODUCT.id,
    customer: { name: event.from_name ?? null, email: event.email ?? null },
    payment: {
      payment_id: event.payment_id,
      status: "succeeded",
      amount: Number(event.amount),
      currency: "EUR"
    },
    required_input: [
      { key: "pet_photo", required: true, description: "One clear photo of the pet." },
      { key: "style_preference", required: false, description: "Optional style preference." }
    ],
    deliverables: PRODUCT.deliverables,
    max_revisions: PRODUCT.revisions,
    target_turnaround_hours: PRODUCT.turnaround_hours
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  const expected = process.env.EVEREST_VERIFIED_PAYMENT_TOKEN;
  if (!expected) return res.status(503).json({ ok: false, error: "trusted_payment_ingest_not_configured" });
  if (!safeEqual(bearerToken(req), expected)) {
    return res.status(401).json({ ok: false, error: "unauthorized_trusted_ingest" });
  }

  const event = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const amount = Number(event.amount);
  const paymentId = typeof event.payment_id === "string" ? event.payment_id.trim() : "";
  if (
    event.payment_status !== "succeeded" ||
    event.test !== false ||
    event.product_id !== PRODUCT.id ||
    !paymentId || paymentId.length > 200 ||
    !Number.isFinite(amount) || amount <= 0 ||
    String(event.currency || "").toUpperCase() !== "EUR"
  ) {
    return res.status(422).json({ ok: false, error: "verified_payment_event_required" });
  }

  return res.status(200).json({
    ok: true,
    stage: "verified_payment_to_job_spec",
    signal: { value: 1, reason: "trusted_source_confirmed_successful_payment" },
    payment_verified: true,
    product: PRODUCT,
    job: createJobSpec(event),
    next_actions: [
      "verify_provider_transaction_against_payment_id",
      "collect_required_customer_input",
      "create_or_assign_artwork_job",
      "deliver_digital_asset",
      "request_feedback",
      "record_outcome"
    ]
  });
}
