# DALMA Genesis 3D Runtime

This is the production-oriented 3D runtime track for DALMA.

It is deliberately separate from the current Expo shell. It exists to move the experience toward:
- real-time 3D board presentation;
- spline/waypoint character travel;
- cinematic camera control;
- reusable presentation directors;
- world-specific rendering;
- production rigged DALMA character integration.

The current marker is a technical previsualization only. It is not the final DALMA 3D character and must never be presented as such.

## Target
Godot 4.7.x stable line.

## Final character gate
The final runtime requires an approved DALMA GLB/GLTF or equivalent high-quality rigged character asset. The low-resolution 2D hero in the Expo shell is not considered a substitute.

## Architecture
Gameplay emits events. Presentation consumes them through:
- CharacterAnimationController
- CameraDirector
- CinematicDirector
- VFXDirector
- AudioDirector
- HapticsDirector
- RewardPresentation
- BuildPresentation
- RaidPresentation

## Android
Godot supports Android export through official export templates and the command line. Use a reproducible pinned engine version and matching export templates.
