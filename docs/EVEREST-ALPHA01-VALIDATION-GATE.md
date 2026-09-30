# EVEREST Alpha 01 — Experimental Validation Gate

## Purpose

This gate separates **"the server runs"** from **"the simulated world is behaving as intended"**.

A release may claim Alpha 01 validation only when the same configuration can be reproduced from a recorded seed and produces the same canonical state/replay digest.

## Test matrix

| Gate | Test | PASS condition |
|---|---|---|
| V01 | Deterministic replay | Same seed + config + tick budget => identical replay digest |
| V02 | Seed isolation | Two distinct seeds produce distinct world digests while both remain finite/valid |
| V03 | State invariants | Money, prices, population, inventories and company counts remain finite and within declared bounds |
| V04 | Conservation/accounting | Every transfer has a source and destination; unexplained money creation/destruction is zero or explicitly classified |
| V05 | Event causality | Every material state transition has an event ID and parent/trigger where applicable |
| V06 | Snapshot restore | Restore from snapshot N and continue for K ticks => same digest as uninterrupted run from N |
| V07 | Parallel-world isolation | Experiment A cannot mutate state, RNG or event history of experiment B |
| V08 | Shock response | Declared shock changes at least one pre-registered metric and produces an attributable event chain |
| V09 | Recovery/termination | Crisis runs terminate in a finite state; no NaN/Infinity/deadlock |
| V10 | API consistency | REST snapshot and WebSocket stream agree on world/version/tick identifiers |
| V11 | Replay completeness | Replay contains enough information to reconstruct the tested run without hidden UI state |
| V12 | Performance | Benchmark records agents, companies, markets, ticks/sec, p95 tick latency and peak memory |

## Required evidence

Each run must emit:

```
run_id
engine_version
world_version
seed
configuration_hash
rules_hash
tick_start
tick_end
population
companies
markets
events
snapshot_hash
replay_hash
state_hash
metrics
performance
pass_fail
failure_reasons
```

## Experimental discipline

1. Register hypotheses **before** running the intervention.
2. Record the baseline with identical seed/configuration except for the declared intervention.
3. Never change the metric definition after seeing the result.
4. Repeat stochastic experiments across a declared seed set.
5. Preserve raw evidence; summaries are not substitutes for raw runs.
6. Distinguish model failure, implementation failure and unexpected-but-valid behaviour.
7. A visually convincing dashboard is never evidence by itself.

## Minimum Alpha 01 acceptance

The Alpha 01 world is **validated** only when V01–V11 pass and V12 has a recorded benchmark.

If a gate cannot be executed because the runtime is unavailable, its status is **BLOCKED**, not PASS.

## First controlled experiment

**Hypothesis H01 — energy shock propagation**

Baseline:
- fixed seed set S
- identical world/configuration
- no external shock

Intervention:
- identical world/configuration
- declared energy-supply shock at tick T

Pre-registered observations:
- energy price
- production cost
- output
- consumer price index
- employment
- bankruptcies
- event-chain length

Expected result is deliberately **not** hard-coded. The test asks whether the observed changes are reproducible and causally attributable to the shock, not whether they match a desired economic narrative.

## Stop conditions

Fail the release gate if any of the following occurs:
- non-finite economic state;
- unexplained accounting discrepancy;
- replay divergence;
- cross-world state leakage;
- missing causal/event evidence for a claimed intervention;
- benchmark evidence cannot be reproduced from the recorded manifest.

## Status

This document is a validation contract, not a claim that all gates have already passed.
