const CANDIDATES = [
  {
    id: "lead-response-agent",
    name: "Lead Response & Appointment Recovery Agent",
    target: "service businesses with inbound leads and appointment-based sales",
    problem: "slow or inconsistent response to new enquiries causes lost opportunities",
    outcome: "capture, qualify, respond and route/book leads with human approval at sensitive steps",
    revenue_model: "setup_fee_plus_monthly",
    pilot_price_eur: 250,
    recurring_price_eur: 299,
    time_to_first_test: "days",
    automation_potential: "high",
    capital_required: "very_low"
  },
  {
    id: "document-workflow-agent",
    name: "Document Intake & Workflow Agent",
    target: "small professional firms with repetitive document intake",
    problem: "staff spend time extracting, classifying and routing incoming documents",
    outcome: "structured intake, validation checklist, routing and exception queue",
    revenue_model: "setup_fee_plus_monthly",
    pilot_price_eur: 500,
    recurring_price_eur: 399,
    time_to_first_test: "days",
    automation_potential: "high",
    capital_required: "very_low"
  },
  {
    id: "niche-digital-product",
    name: "Niche Digital Product",
    target: "a narrowly defined audience with a high-intent recurring problem",
    problem: "buyers need a ready-to-use solution rather than generic information",
    outcome: "downloadable toolkit/template/workflow",
    revenue_model: "one_time_or_bundle",
    pilot_price_eur: 29,
    recurring_price_eur: 0,
    time_to_first_test: "hours",
    automation_potential: "very_high",
    capital_required: "very_low"
  }
];

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  res.status(200).json({
    ok: true,
    mission: {
      name: "EVEREST",
      horizon_days: 180,
      stretch_target: "no_ceiling",
      stress_reference_eur: 1000000000,
      monetary_role: "scale_indicator_not_objective",
      primary_objective: "discover_and_build_the_maximum_demonstrable_economic_capability",
      operating_principle: "objective_over_procedure",
      truth_rule: "real_payments_and_measurable_outcomes_outrank_opinions"
    },
    selected_experiment: CANDIDATES[0],
    human_intervention: [
      "authorize third-party accounts when identity or payment verification is required",
      "approve customer-facing actions when required",
      "provide secrets only through secure service settings, never in chat"
    ],
    engine_loop: [
      "observe",
      "research",
      "discover",
      "formulate_offer",
      "build_minimum_version",
      "launch_test",
      "capture_real_signal",
      "fulfil",
      "measure",
      "iterate_or_kill",
      "automate",
      "scale_only_after_evidence",
      "search_for_the_next_constraint"
    ]
  });
}
