# EVEREST ZERO — Multi-Agent Laboratory Protocol v1.0

## Purpose

Use multiple AI systems as parallel specialists around the same economic objective, while keeping one common evidence standard and a single decision layer.

## Roles

### DIRECTOR
Maintains the objective, experiment registry, evidence standard and next-action decision.

### MARKET
Finds real customer problems, competing products, pricing, demand signals, distribution surfaces and gaps.

### PRODUCT
Turns validated problems into the smallest usable product and proposes technical/product improvements.

### ACQUISITION
Optimises landing pages, SEO, positioning, activation, sharing and free-to-paid conversion.

### RED TEAM
Attempts to falsify the current hypothesis: saturation, weak willingness to pay, bad economics, platform risk, technical fragility, retention failure.

### AUTOMATION
Finds ways to remove human labour from research, build, launch, fulfilment and measurement without violating platform rules.

### ECONOMICS
Measures revenue, direct costs, human minutes, contribution and repeatability.

### UX
Audits mobile usability, comprehension, interaction friction and user outcome quality.

## Human bridge

The human operator may provide access to external AI systems, upload/download files, authenticate services, publish where human consent is required, and physically perform actions unavailable to the connected toolchain.

Human effort must be logged as a measurable resource, not treated as invisible overhead.

## Mission packet

Every external agent receives:
1. Objective
2. Current evidence
3. Constraints
4. Exact mission
5. Required output format
6. Deadline/stop condition when relevant

## Required return format

OBJETIVO
HIPÓTESIS
QUÉ HICE
QUÉ ENCONTRÉ
QUÉ CONSTRUÍ
EVIDENCIA
QUÉ FALLÓ
QUÉ NO PUDE VERIFICAR
RECOMENDACIÓN
ARCHIVOS / RESULTADOS

## Evidence classes

- VERIFIED: directly observed, tested or paid.
- OBSERVED: real external evidence but not independently reproduced.
- EXPERIMENTAL: implementation exists but economic result is not yet demonstrated.
- HYPOTHETICAL: proposal only.
- BLOCKED: cannot be executed under current access/terms/resources.

## Decision rule

No agent gets authority to declare an experiment successful.

The Director consolidates evidence from all agents and records:
CONTINUE / ITERATE / PIVOT / KILL / BLOCKED.

## Anti-bias rule

Agents must explicitly report disconfirming evidence and unresolved uncertainty.

Do not reward confidence. Reward verified evidence.

## Parallel experiment rule

Give different agents different questions instead of asking every agent for a full copy of the same project.

Example parallel missions:
- Find the fastest route to the first real €10.
- Attack why the current €9.90 product might not sell.
- Build a zero-cost alternative acquisition wedge.
- Find an adjacent problem using the same engine.
- Find automation opportunities.
- Find technical failure points.

## Economic scoreboard

Primary:
- real revenue
- direct experiment cost
- net economic value
- human minutes
- net value per human minute
- time to first public test
- repeatability of acquisition and fulfilment

Secondary:
- visits
- qualified actions
- completed core actions
- copied/shared results
- product clicks
- checkout starts
- payments
- refunds
- repeat usage

## Non-negotiables

- No simulated sales.
- No fake traffic.
- No fake testimonials.
- No fake scarcity.
- No invented demand.
- No unverified deployment counted as live.
- No forecast counted as revenue.
- No secret keys in prompts, repositories or reports.
- Respect terms of service and payment-provider rules.

## Human-in-the-loop boundary

Human intervention is appropriate where:
- authentication/re-authentication is required;
- physical device actions are required;
- legal consent is required;
- a platform explicitly requires manual publication;
- a payment or other irreversible real-world action requires confirmation.

Otherwise prefer automation or delegated agents.

## Goal

Progressively reduce human minutes per unit of verified economic value while increasing repeatability.
