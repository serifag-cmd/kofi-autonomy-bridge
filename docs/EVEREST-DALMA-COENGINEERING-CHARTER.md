# EVEREST × DALMA — CO-ENGINEERING CHARTER

## Mission
EVEREST is the operating layer for DALMA Adventure: a human–AI co-engineering system whose job is to maximize real player value, technical quality, creative differentiation and long-term commercial durability.

The objective is not to imitate any single genre leader. The reference set is broader: social casino/board progression, collection games, live-service games, narrative adventures, premium mobile 3D and systems-driven games. The benchmark is the experience we can actually build and validate.

## The human–AI boundary
Human direction defines mission, values, IP ownership, risk tolerance and final product decisions.
AI contributes analysis, alternatives, implementation, testing, optimization, content-system design and evidence synthesis.
The AI collaboration layer may automate repository work, builds, tests and analysis, but it does not modify the underlying assistant model, hidden system instructions or safety controls.

## Everest operating loop
OBSERVE → MODEL → BUILD → TEST → MEASURE → COMPARE → KEEP / REWORK → REPEAT.

Every cycle must either:
- increase player value;
- reduce technical/product uncertainty;
- increase content-production capacity;
- increase evidence quality;
- or prevent a future failure.

## Product north star
DALMA should be capable of years of meaningful play because the system continually creates new combinations of:
- worlds;
- routes;
- builds;
- raids;
- events;
- collections;
- modifiers;
- social interactions;
- seasons;
- narrative discoveries;
- cosmetic identity;
- mastery and strategy.

The design must avoid relying on coercive dark patterns. Long-term engagement should come from curiosity, mastery, collection, surprise, agency, social meaning and high-quality feedback.

## Quality envelope

### Gameplay
- tactile dice interaction;
- readable causal feedback;
- meaningful decisions;
- visible construction;
- attacks and raids with risk/reward;
- collection with permanent utility;
- world progression;
- daily/seasonal/event hooks;
- comeback and catch-up systems;
- sufficient procedural/data-driven variation.

### 3D and presentation
- production-grade DALMA character when the approved asset exists;
- real 3D traversal rather than major-motion teleports;
- authored anticipation → action → impact → settle sequences;
- cinematic camera modes;
- world-specific geometry/material/light/VFX/audio grammar;
- mobile Vulkan renderer and scalable quality;
- LOD, pooling and bandwidth-conscious assets.

### Systems
- offline-first core;
- persistent local save;
- server-authoritative boundary for competitive/economic operations;
- analytics event taxonomy;
- remote configuration;
- live-ops compatibility;
- secure identity and integrity hooks;
- data-driven content so new worlds need minimal code change.

### Evidence
No build is called final merely because it compiles or installs.
The exact artifact delivered must be the exact artifact validated.
Unknowns remain explicitly unknown.

## Current technical direction
Godot 4.7.2 is the pinned engine for this product track. The Mobile renderer is the intended Android renderer because Godot documents it as the mobile-oriented Vulkan renderer. Android builds target the current Google Play requirement of API 36 for new apps and updates after 31 August 2026.

Play Integrity remains an integration boundary for production protection of sensitive online operations. It requires a linked Google Cloud project and Play Console configuration; those credentials/authorizations remain external deployment inputs.

## Non-negotiable gates
G0 reproducible build
G1 clean install
G2 stable launch
G3 first-session usability
G4 core loop
G5 persistence/offline recovery
G6 DALMA identity
G7 differentiated worlds
G8 premium presentation
G9 economy/security boundary
G10 content extensibility
G11 Android artifact integrity
G12 real-device/runtime evidence
G13 live-ops readiness
G14 production release readiness

## Definition of Everest-complete
Everest-complete means the current release candidate has the strongest evidence available for the capabilities implemented, the artifact is reproducible, the main game loop is genuinely playable, the presentation is integrated, the remaining external inputs are named, and no known critical blocker is hidden behind optimistic language.
