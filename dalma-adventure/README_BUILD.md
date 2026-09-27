# DALMA Adventure — Android build

This branch contains the Expo/React Native source of DALMA Adventure and a GitHub Actions pipeline that generates an installable Android debug APK outside Replit.

The source is based on DALMA_ADVENTURE_GAME_v0_1_SOURCE.zip from Dropbox. The original image references were removed from the build target because the archive exposes the image filenames but the connector does not provide their binary contents to the build pipeline; the gameplay UI remains functional and offline-first.

Build result:
- Android package: com.opencacnlabs.dalmaadventure
- Version: 0.1.0
- APK type: signed debug APK for direct device installation
- Build engine: Expo prebuild + Android Gradle Plugin on GitHub Actions
