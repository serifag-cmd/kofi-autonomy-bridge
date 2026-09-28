# DALMA 3D / ANIMATION / CINEMATIC PRODUCTION BRIEF

## Objective
Build a production-grade real-time 3D character and cinematic system for DALMA. The target is not decorative motion but a coherent animation language that can support a globally scalable game.

## Required source asset
A real 3D DALMA production asset is the preferred input:
- high-quality mesh;
- clean topology;
- UVs;
- physically based materials;
- Dalmatian spots authored as texture/mask, not regenerated randomly;
- amber eyes;
- canonical ear marking;
- canonical single chest heart;
- proportions and silhouette matching the reference.

Preferred formats:
GLB/GLTF for runtime interchange; FBX or equivalent for DCC pipelines; source scene retained separately.

## Rig
Minimum:
- full body rig;
- spine/chest;
- neck/head;
- jaw;
- ears;
- tail;
- four-leg locomotion;
- paw/foot controls;
- IK/FK where useful.

Premium:
- facial rig;
- eye aim;
- eyelids;
- brows where anatomically appropriate;
- squash/stretch controls used sparingly;
- secondary controls for ears, tail and accessories.

## Animation library
Required base states:
1. Idle calm
2. Idle alert
3. Walk
4. Run
5. Turn
6. Stop
7. Anticipation
8. Dice interaction
9. Roll reaction
10. Movement/travel
11. Landing
12. Reward anticipation
13. Reward celebration
14. Chest open reaction
15. Construction observation
16. Construction celebration
17. Attack preparation
18. Raid impact
19. Shield activation
20. Hit/stagger
21. Victory
22. World transition
23. Collection reveal
24. Rare-item reveal
25. Event/risk reaction

All clips require consistent root motion or a clearly defined in-place contract. The runtime must never mix locomotion conventions unpredictably.

## Animation language
Every major action follows:
anticipation → action → impact → settle → next state.

Timing must be readable before spectacular.
Weight must be communicated through:
- acceleration/deceleration;
- foot contact;
- body mass;
- head follow-through;
- ears/tail secondary motion;
- camera response;
- sound;
- particles;
- haptics.

Avoid generic constant-speed tweens.

## Dice sequence
Production sequence target:
- camera establishes play space;
- DALMA focus;
- tactile preparation;
- dice appear;
- dice shake;
- throw;
- readable result;
- world/board responds;
- movement begins;
- route markers animate;
- landing contact;
- cell effect;
- reward/decision cinematic.

The player should understand what happened without reading text.

## Board movement
The character should visibly traverse the path when the design calls for it. Movement can use authored splines/waypoints with:
- controlled easing;
- footstep synchronization;
- banking;
- head orientation;
- contextual camera;
- predictable end state.

Never teleport the character for a major visible move unless the world fiction explicitly makes teleportation the mechanic.

## Construction cinematics
Construction is an authored event, not a number increment:
- materials arrive;
- foundation changes;
- structure assembles;
- effects activate;
- final illumination;
- camera reveal;
- reward confirmation.

Each building type gets its own visual grammar and sound identity.

## Raid cinematics
Raid presentation:
- target selection;
- threat read;
- attack preparation;
- launch/impact;
- destruction or extraction;
- loot reveal;
- defensive response if relevant;
- result state.

The player must feel agency, even where underlying probability remains.

## World transitions
Each world transition should establish:
- unique color/light environment;
- environmental motion;
- sound motif;
- architecture;
- scale;
- material identity;
- creature/ecosystem signature.

Transitions are not interchangeable wipes or fades.

## Camera system
Use a camera rig with:
- gameplay;
- close character;
- reward;
- build;
- raid;
- collection reveal;
- world reveal;
- transition.

Camera should respond to action hierarchy, not shake constantly.

Motion principles:
- small camera movement for UI;
- medium movement for gameplay impact;
- strong movement only for major cinematic events;
- settle back into gameplay quickly.

## VFX
VFX should communicate:
- reward;
- rarity;
- energy;
- shields;
- impact;
- construction;
- environment;
- world-specific physics.

Prefer a reusable effect library driven by parameters so content scales without bespoke code for every event.

## Audio
Every animation milestone may have an associated:
- sound;
- musical accent;
- ambience;
- haptic event.

Create event-driven audio IDs rather than hardcoding filenames into gameplay.

## Runtime performance
Mobile target:
- stable frame pacing;
- predictable memory usage;
- pooled VFX;
- pooled projectiles;
- texture atlasing where appropriate;
- LODs;
- baked/static lighting where possible;
- limited real-time lights;
- compressed textures;
- animation compression;
- additive content delivery.

Profile on representative low/mid/high Android devices. Do not optimize only on desktop hardware.

## Architecture
Recommended separation:
- CharacterController
- CharacterAnimationController
- CameraDirector
- CinematicDirector
- VFXDirector
- AudioDirector
- HapticsDirector
- RewardPresentation
- BuildPresentation
- RaidPresentation
- WorldPresentation.

Gameplay logic should emit events. Presentation layers subscribe and remain replaceable.

## Data-driven clips
Animation states and presentation events should be configurable data:
- clip name;
- blend duration;
- priority;
- interrupt rules;
- camera preset;
- VFX preset;
- audio event;
- haptic pattern;
- gameplay lock;
- cooldown.

## QA checklist
For each animation/cinematic:
- starts correctly;
- exits correctly;
- interrupt rules work;
- no foot sliding beyond accepted threshold;
- no visible penetration;
- no camera clipping;
- no UI overlap;
- audio starts/stops correctly;
- haptic timing is correct;
- frame pacing remains stable;
- memory does not grow indefinitely;
- orientation/rotation states recover;
- app background/foreground recovery works.

## Canonical DALMA gate
Reject any 3D asset or animation that:
- alters the canonical dog identity;
- invents spots;
- mirrors the canonical ear marking;
- duplicates the chest heart;
- changes anatomy for convenience;
- introduces human hands/fingers/limbs;
- makes accessories hide the defining identity unnecessarily.

## Required future inputs
For the final 3D production pass, the strongest input would be one of:
1. an approved rigged DALMA GLB/GLTF;
2. an approved unrigged high-quality DALMA mesh plus texture set;
3. a multi-angle clean reference package sufficient for a 3D artist/modeling pipeline.

No user upload is required for the current engineering work. A true production-grade DALMA 3D character, however, cannot be honestly manufactured from a low-resolution 2D crop alone without relaxing the identity/quality standard.

## Delivery gate
Do not label the system “3D production-ready” until:
- the rig is present;
- the animation library runs;
- the camera/cinematic system is integrated;
- performance is profiled;
- clean Android build passes;
- real device/emulator smoke tests pass;
- cinematic states do not break gameplay.

## Golden principle
The best animation is not the most movement.
It is the clearest, most satisfying expression of the game system, executed with enough craft that the player wants to see it again.
