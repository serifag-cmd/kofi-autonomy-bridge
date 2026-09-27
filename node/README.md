# EVEREST Node Core

A minimal, safe-by-default control-plane prototype for EVEREST ZERO.

## Current state

- Mission: build verifiable economic capability while reducing human intervention per unit of value.
- Primary experiment: Freelancer Rescue Kit first-sale experiment.
- Verified revenue: EUR 0 until a real payment event is recorded.
- Safe mode: enabled by default.
- External side effects: disabled in this core.
- Persistent external database: not configured.
- Payment adapter: not configured.
- Browser automation adapter: not configured.
- Secrets: never embedded in the UI.

## Control model

Observe -> research -> hypothesize -> build -> publish -> measure -> decide.

Every action should remain auditable with:
1. what was proposed
2. why it was proposed
3. whether it executed
4. result/evidence
5. cost
6. human intervention required

## Human bridge

Human-only actions remain explicit for authentication, secrets, legal consent, and irreversible or real-money actions.

## Promotion path

1. Verify the static core.
2. Give it a persistent runtime.
3. Add authenticated memory/storage.
4. Add read-only external adapters.
5. Add low-risk write actions with audit logging.
6. Add commercial/payment actions only with explicit controls.
7. Compare human+AI versus increasingly autonomous operation using real economic evidence.

This prototype deliberately stops before external side effects.
