# Ko-fi Autonomy Bridge

Minimal execution layer for an economic autonomy experiment.

## Architecture

Payment/event
→ verified normalized event
→ opportunity analysis
→ job specification
→ delivery
→ measurement
→ next experiment

## Endpoints

- GET /api/health
- POST /api/kofi-webhook
- POST /api/opportunity
- GET /api/strategy

## Current business hypothesis

The initial paid-product hypothesis is a €7.90 personalized digital pet portrait. It is deliberately treated as an experiment, not as the final business.

The system now also exposes a multi-model strategy layer covering:
- narrow AI/B2B services
- digital products
- original content + affiliate/commerce
- original AI-assisted YouTube
- niche ecommerce/dropshipping
- pet-owner digital/service utilities
- active investing

The purpose is not to assume one model wins. It is to run cheap, measurable tests and reallocate effort according to evidence.

## Capital rule

Investment capital is not required for the first phase. Do not provide exchange passwords, seed phrases, private keys, API secrets, or account credentials through chat.

If investing is later evaluated, start with research, paper trading/backtesting and explicit risk limits before considering real capital.

## Vercel environment variables

- KOFI_VERIFICATION_TOKEN — required for Ko-fi webhook verification.
- AUTOMATION_TARGET_URL — optional HTTPS endpoint for forwarding verified events.

Never put secrets in GitHub or send them through chat.

## Next stages

1. Add durable event/outcome storage.
2. Add experiment and funnel metrics.
3. Build a small real-world validation surface.
4. Measure demand.
5. Compare hypotheses using observed evidence.
6. Automate fulfillment where economically justified.
7. Replace weak hypotheses instead of defending them.
