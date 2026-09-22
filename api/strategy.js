const MODELS = [
  {
    id: "ai_microservice_b2b",
    name: "AI micro-service for a narrow business workflow",
    monetization: "subscription_or_setup_fee",
    startup_cost: "low",
    scalability: "high",
    automation_potential: "high",
    validation_speed: "fast",
    key_risk: "finding a painful problem with paying customers",
    first_test: "sell one narrowly defined outcome before building a full SaaS"
  },
  {
    id: "digital_product",
    name: "Niche digital product",
    monetization: "one_time_or_bundle",
    startup_cost: "very_low",
    scalability: "high",
    automation_potential: "high",
    validation_speed: "fast",
    key_risk: "distribution and differentiation",
    first_test: "publish a specific product and measure qualified visits to purchase"
  },
  {
    id: "content_affiliate",
    name: "Original research/content + affiliate or commerce",
    monetization: "affiliate_sponsorship_subscription",
    startup_cost: "low",
    scalability: "high",
    automation_potential: "medium_high",
    validation_speed: "medium",
    key_risk: "audience acquisition and platform dependence",
    first_test: "publish a small original content series around a high-intent problem"
  },
  {
    id: "youtube_original",
    name: "Original AI-assisted YouTube channel",
    monetization: "ads_affiliate_sponsorship_products",
    startup_cost: "low",
    scalability: "high",
    automation_potential: "medium_high",
    validation_speed: "slow",
    key_risk: "audience growth and platform monetization rules",
    first_test: "produce a small set of genuinely original videos around one narrow topic"
  },
  {
    id: "dropshipping",
    name: "Niche dropshipping/ecommerce",
    monetization: "product_margin",
    startup_cost: "low_medium",
    scalability: "medium_high",
    automation_potential: "medium",
    validation_speed: "medium",
    key_risk: "customer acquisition, supplier quality, returns, compliance and margin",
    first_test: "validate demand and landed economics before buying inventory"
  },
  {
    id: "pet_vertical",
    name: "Pet-owner digital/service platform",
    monetization: "subscription_leads_affiliate_services",
    startup_cost: "low_medium",
    scalability: "high",
    automation_potential: "high",
    validation_speed: "medium",
    key_risk: "distribution, trust and marketplace liquidity",
    first_test: "launch one narrow utility with measurable repeat usage"
  },
  {
    id: "active_investing",
    name: "Crypto/stocks trading",
    monetization: "capital_gain",
    startup_cost: "capital_required",
    scalability: "capital_dependent",
    automation_potential: "medium",
    validation_speed: "immediate_but_noisy",
    key_risk: "loss of capital, volatility, fees, execution and model risk",
    first_test: "paper-trade or backtest a rule before risking capital"
  }
];

function opportunityScore(m) {
  const weights = {
    startup_cost: { very_low: 5, low: 4, low_medium: 3, medium: 2, capital_required: 1 },
    scalability: { high: 5, medium_high: 4, medium: 3, capital_dependent: 2 },
    automation_potential: { high: 5, medium_high: 4, medium: 3 },
    validation_speed: { fast: 5, medium: 3, slow: 2, immediate_but_noisy: 1 }
  };
  return ["startup_cost", "scalability", "automation_potential", "validation_speed"]
    .reduce((sum, k) => sum + (weights[k][m[k]] || 0), 0);
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const opportunities = MODELS.map(m => ({
    ...m,
    experiment_score: opportunityScore(m)
  }));

  return res.status(200).json({
    ok: true,
    purpose: "compare business hypotheses before committing resources",
    important_note: "Scores are experiment-design heuristics, not forecasts of profit or success.",
    opportunities,
    decision_rule: [
      "Prefer evidence over assumptions.",
      "Test demand before building heavily.",
      "Protect capital from experiments that can be run without it.",
      "Replace weak hypotheses when real-world evidence is negative."
    ]
  });
}
