# Ko-fi Autonomy Bridge

Minimal webhook receiver and first execution layer for the economic autonomy experiment.

## Current architecture

Ko-fi payment/event
→ /api/kofi-webhook
→ verified normalized event
→ /api/opportunity
→ product/job workflow
→ delivery
→ measurement
→ iteration

## Endpoints

- GET /api/health
- POST /api/kofi-webhook
- POST /api/opportunity

## Vercel environment variables

- KOFI_VERIFICATION_TOKEN — required; set this to the verification token shown by Ko-fi.
- AUTOMATION_TARGET_URL — optional HTTPS endpoint for forwarding verified events.

Never put secrets in GitHub or send them through chat.

## Current product hypothesis

Personalized digital pet portrait:
- €7.90
- digital delivery
- square + vertical formats
- one revision
- target turnaround: 48 hours

This is a test hypothesis, not a claim of validated demand.

## Deployment

Import this repository into Vercel and deploy. After deployment, configure the Ko-fi webhook to:

https://YOUR-VERCEL-DOMAIN.vercel.app/api/kofi-webhook

Then add the Ko-fi verification token as the Vercel environment variable.

## Next autonomous stages

1. Capture verified events.
2. Persist event/outcome data.
3. Test the product offer.
4. Automate intake and job creation.
5. Deliver the purchased asset.
6. Measure conversion, delivery time, refunds and feedback.
7. Generate the next opportunity hypothesis from the observed data.
