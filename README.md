# Ko-fi Autonomy Bridge

Minimal webhook receiver for the economic autonomy experiment.

## Endpoints
- GET /api/health
- POST /api/kofi-webhook

## Vercel environment variables
- KOFI_VERIFICATION_TOKEN — required; set this to the verification token shown by Ko-fi.
- AUTOMATION_TARGET_URL — optional HTTPS endpoint for forwarding verified events.

Never put secrets in GitHub or send them through chat.

## Deployment
Import this repository into Vercel and deploy. The Ko-fi webhook URL will be:
https://YOUR-VERCEL-DOMAIN.vercel.app/api/kofi-webhook

Then configure the Ko-fi webhook with that URL and its verification token.

## Next stage
Capture verified payment events, create an event log, connect the event to a product/opportunity workflow, deliver the purchased asset, measure conversion, and iterate.
