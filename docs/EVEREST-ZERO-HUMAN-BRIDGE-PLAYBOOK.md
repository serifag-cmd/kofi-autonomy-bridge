# EVEREST ZERO — Human Bridge Playbook v1

## Purpose

Use the human operator's access to external AI systems as a temporary capability bridge. The operator does not need to solve the mission; they transfer the same project context and return the evidence.

## Minimal cycle

1. Upload the current EVEREST ZERO ZIP to an external AI.
2. Give it exactly one mission from the Mission Board.
3. Ask it to work from evidence, not optimism.
4. Save/export its complete result.
5. Return the result, files, screenshots and URLs to the central EVEREST ZERO project.
6. Repeat with a different AI and a different mission.
7. The Director compares outputs without assuming any agent is correct.

## Recommended first external-AI allocation

### AI A — Market
Mission M01: find five adjacent high-intent problems and the smallest test for each.

### AI B — Product
Mission M02: attack the current product and free tools for conversion-relevant gaps.

### AI C — Red Team
Mission M03: attempt to disprove the business model.

### AI D — Acquisition
Mission M04: find organic distribution opportunities without spam or paid ads.

### AI E — Automation
Mission M05: map manual work and remove it where technically and contractually possible.

### AI F — Economics
Mission M06: compare price/economics scenarios and required evidence.

### AI G — UX
Mission M07: perform a mobile-first usability audit.

## Rules for the human bridge

- Never give all agents the previous agents' conclusions unless the mission explicitly requires review. This reduces anchoring.
- Do not paraphrase findings before returning them; preserve original outputs.
- Include screenshots for visual claims.
- Include URLs for market claims.
- Include generated files as files, not screenshots alone, whenever possible.
- Mark whether the external AI actually changed/builds files or only proposed changes.
- Record approximately how many minutes the human bridge required for each mission.
- Never paste API keys, passwords, payment details or private credentials into prompts or uploads.
- Never ask an external agent to violate a site's terms or bypass authentication/controls.
- Never count a simulated transaction as revenue.

## Exact mission wrapper

Use this before the mission-specific prompt:

“You are one specialist inside an economic experimentation system called EVEREST ZERO. Your job is not to agree with the project. Your job is to produce useful, falsifiable evidence. Work only on the assigned mission. Distinguish VERIFIED, OBSERVED, EXPERIMENTAL, HYPOTHETICAL and BLOCKED. Do not invent users, sales, traffic, statistics or demand. Identify disconfirming evidence. Return your work using this format:

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

Also report what you could not inspect because of access, environment or tool limits.”

## Human-only gates

The human operator should be used mainly for:
- authentication/re-authentication;
- file transfer between disconnected AI systems;
- physical-device testing;
- platform actions that explicitly require a human;
- irreversible economic or legal confirmations.

Everything else should remain a candidate for automation.

## Success criterion of the bridge

The goal is not “more AI answers”.

The goal is to increase:
- independent useful evidence per human minute;
- implemented improvements per human minute;
- real economic experiments per human minute;
- repeatability of the process.

## Suggested order

Run M03 Red Team early enough to prevent wasted building, then M01/M04 for acquisition, M02/M07 for product/UX, M05/M06 for automation/economics.

## Return packet

When bringing results back, attach:
1. original AI output;
2. any files it created;
3. screenshots of relevant UI;
4. URLs it relied upon;
5. a one-line note with human minutes spent transferring/retrieving the result.
