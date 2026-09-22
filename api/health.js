export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "kofi-autonomy-bridge",
    version: "0.3.0",
    mission: "EVEREST",
    capabilities: [
      "kofi_webhook_verification",
      "normalized_payment_events",
      "opportunity_signal",
      "job_spec_generation",
      "economic_experiment_selection",
      "funnel_event_schema"
    ]
  });
}
