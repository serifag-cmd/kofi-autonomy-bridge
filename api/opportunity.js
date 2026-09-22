const PRODUCT = {
  id: "pet-portrait-v1",
  name: "Personalized Pet Portrait",
  price_eur: 7.90,
  delivery: "digital",
  turnaround_hours: 48
};

function scoreSignal(event) {
  const amount = Number(event?.amount);
  if (!Number.isFinite(amount)) return 0;
  return amount > 0 ? 1 : 0;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const event = req.body || {};
  const signal = scoreSignal(event);

  return res.status(200).json({
    ok: true,
    stage: "opportunity_to_execution",
    signal,
    product: PRODUCT,
    next_actions: [
      "verify_event",
      "confirm_payment",
      "collect_required_customer_input",
      "create_or_assign_artwork_job",
      "deliver_digital_asset",
      "request_feedback",
      "record_outcome"
    ]
  });
}
