export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "kofi-autonomy-bridge",
    version: "0.2.0",
    capabilities: [
      "kofi_webhook_verification",
      "normalized_payment_events",
      "opportunity_signal",
      "job_spec_generation"
    ]
  });
}
