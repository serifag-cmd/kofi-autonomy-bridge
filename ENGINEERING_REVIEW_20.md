# EVEREST 2D→3D — Revisión estructurada de 20 disciplinas
Fecha: 2026-09-29
Versión objetivo: 1.1.0

Esta revisión cubre la ruta Android autónoma, la conversión 2D→3D por heightfield, importación múltiple y exportación organizada.

1. Arquitectura Android — PASS: proyecto Gradle Android nativo, minSdk 24, targetSdk 35.
2. Build/Gradle — PASS: compilación reproducible mediante GitHub Actions.
3. Release engineering — PASS: release separado de debug; zipalign + apksigner.
4. Integridad APK — PASS: unzip test + apksigner verify + SHA-256.
5. Instalación — GATE: el APK release está firmado; la instalación física en un dispositivo real debe verificarse después de descargarlo.
6. UI/UX — PASS: selección 2D, control de profundidad, exploración táctil y exportación visible.
7. Importación — PASS: ACTION_OPEN_DOCUMENT y selección múltiple mediante EXTRA_ALLOW_MULTIPLE.
8. Almacenamiento Android — PASS: ACTION_CREATE_DOCUMENT permite elegir ubicación de salida sin permisos de almacenamiento global.
9. Procesamiento de imagen — PASS: escala controlada a 1024px y cálculo de luminancia.
10. Generación 3D — PASS CON LIMITACIÓN: malla 64×64 basada en heightfield; es 2.5D/relieve, no reconstrucción volumétrica AI.
11. Render OpenGL — PASS: GLES2, profundidad, textura y cámara rotatoria.
12. Exportación ZIP — PASS: múltiples assets agrupados en un único ZIP.
13. Organización de assets — PASS: assets/asset_001/, asset_002/..., cada uno con original.png, depth_map.png y metadata.json.
14. Metadatos — PASS: dimensiones origen/salida, profundidad, método, versión y convención de coordenadas.
15. Portabilidad — PASS: PNG + JSON + ZIP sin dependencia de servidor.
16. QA estático — PASS: workflow comprueba archivos, selección múltiple, ZipOutputStream y metadata.
17. QA de compilación — REQUIRED: release workflow debe completar assembleRelease.
18. QA criptográfico — REQUIRED: apksigner verify y SHA-256.
19. Distribución — PASS: GitHub Actions conserva APK, hashes, source ZIP y bundle.
20. Riesgo de producto — IMPORTANT: la conversión actual es un intermediario 2D→depth/3D; para calidad de producción EVEREST se debe incorporar posteriormente un modelo de reconstrucción 3D más avanzado y exportación GLB/OBJ/texturas.

DECISIÓN:
La arquitectura de exportación ya queda preparada para batch assets y metadatos. No se debe llamar a esta versión "3D fotogramétrico" ni "mesh AI" porque técnicamente no lo es. El objetivo de esta build es demostrar una cadena Android instalable y un pipeline organizado, verificable y exportable.

Criterio de cierre de esta iteración:
- release APK firmado y validado por CI
- source ZIP reproducible
- batch ZIP organizado
- metadata por asset
- sin debug-only delivery

Siguiente escalón técnico:
- reconstrucción 3D de mayor fidelidad
- exportación GLB/OBJ + textures + manifest
- validación en dispositivo físico
- integración de assets con EVEREST/DALMA.
