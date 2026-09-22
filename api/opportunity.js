const PRODUCT = {
  id: "pet-portrait-v1",
  name: "Personalized Pet Portrait",
  price_eur: 7.90,
  delivery: "digital",
  turnaround_hours: 48,
  deliverables: ["square", "vertical"],
  revisions: 1
};

function scoreSignal(event) {
  const amount = Number(event?.amount);
  const currency = String(event?.currency || "").toUpperCase();
  if (!Number.isFinite(amount) || amount <= 0) return { value: 0, reason: "no_positive_payment_signal" };
  if (currency && currency !== "EUR") return { value: 1, reason: "positive_payment_non_eur" };
  return { value: 1, reason: "positive_payment" };
}

function createJobSpec(event) {
  return {
    job_type: "pet_portrait",
    product_id: PRODUCT.id,
    customer: {
      name: event?.from_name ?? null,
      email: event?.email ?? null
    },
    payment: {
      amount: event?.amount ?? null,
      currency: event?.currency ?? null,
      message_id: event?.message_id ?? null
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

  const event = req.body || {};
  const signal = scoreSignal(event);
  const job = signal.value ? createJobSpec(event) : null;

  return res.status(200).json({
    ok: true,
    stage: signal.value ? "payment_signal_to_job_spec" : "opportunity_signal_pending",
    signal,
    product: PRODUCT,
    job,
    next_actions: signal.value
      ? [
          "verify_event",
          "confirm_payment",
          "collect_required_customer_input",
          "create_or_assign_artwork_job",
          "deliver_digital_asset",
          "request_feedback",
          "record_outcome"
        ]
      : [
          "continue_measurement",
          "test_offer",
          "wait_for_real_signal"
        ]
  });
}
