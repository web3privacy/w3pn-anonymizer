# Native Capacitor Apps

The repository includes native wrappers for the same Vite application:

- iOS: `ios/App/App.xcodeproj`
- Android: `android/`

## Sync The App

```bash
npm run native:sync
```

This runs the web build and copies `dist` into each native project:

- iOS: `ios/App/App/public`
- Android: `android/app/src/main/assets/public`

Because Vite copies `public/` into `dist`, the native apps bundle the local ONNX, OCR, worklet, demo, icon, and custom-image assets at install time. No model download is required after installation for the bundled assets.

Before building native targets, you can check the local toolchain:

```bash
npm run native:doctor
npm run native:doctor -- android
npm run native:doctor -- ios
npm run native:doctor -- --json
```

The check returns a nonzero exit code for missing or incompatible tools. It discovers the SDK from `ANDROID_SDK_ROOT`, `ANDROID_HOME`, `android/local.properties`, or the platform default. It uses `JAVA_HOME`, a user-installed macOS Temurin 21 at `~/Library/Java/JavaVirtualMachines/temurin-21.jdk`, Android Studio's bundled JDK on macOS/Windows, or the macOS Homebrew JDK 21 location. This project's Android modules require Java 21 source support; the pinned Gradle 8.11.1 runtime supports Java through 23, so the check accepts 21–23. Android Studio Quail 4 includes JBR 25: keep that for the IDE, but select Temurin 21 for Gradle. See [Android JDK configuration](https://developer.android.com/build/jdks) and [Gradle compatibility](https://docs.gradle.org/current/userguide/compatibility.html).

The Android setup includes SDK platform 35, build-tools 35.0.0 and platform-tools. AGP 8.7.2 also installs its default build-tools 34.0.0 when building. Node 22 is the project baseline. Custom installations can set these environment variables explicitly. The Gradle distribution is pinned to its official SHA-256 in `android/gradle/wrapper/gradle-wrapper.properties`.

The iOS check also requires an available simulator runtime. Device signing is a separate check in Xcode. This checkout uses Swift Package Manager with local Capacitor/Cordova frameworks; CocoaPods is not needed. Build intermediates go into `release/ios/DerivedData` or `release/ios-simulator/DerivedData`; `NATIVE_DERIVED_DATA_DIR` overrides that location.

The deployment target is iOS 15, matching the minimum accepted by the installed Xcode 27. This does not establish support for every media feature on iOS 15; validate WebView capabilities on actual devices.

The current mobile release plan, device matrix, toolchain blockers and F-Droid prerequisites are in [the mobile release plan](MOBILE-RELEASE-PLAN-2026-09-30.md). Asset synchronization does not confirm a native build or successful device execution.

The tool installation and successful Android/iOS native build/start checks on this Mac are recorded in [the installation report](native-install-2026-09-30/README.md). In Xcode 27, graphical simulated devices are shown through Device Hub (`/Applications/Xcode.app/Contents/Applications/DeviceHub.app`).

## iPhone Test

```bash
npm run ios:sync
npm run ios:open
```

In Xcode, select a connected iPhone, choose a signing team, and press Run.

To verify the iOS wrapper from the terminal without code signing:

```bash
npm run ios:build:sim
```

To build a signed debug app for real iPhones:

```bash
npm run ios:build:device
```

To export a debug IPA for registered development devices:

```bash
npm run ios:debug:ipa
```

The debug IPA is written to `release/ios/W3PN-Anonymizer-debug.ipa`.

## Android Test

```bash
npm run android:sync
npm run android:open
```

Android Studio should import the `android/` project and sync Gradle. To build a debug APK from the terminal:

```bash
npm run android:debug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

## Device Resources

- Camera and microphone are enabled through native iOS `Info.plist` usage descriptions and Android `CAMERA` / `RECORD_AUDIO` permissions.
- CPU inference runs locally through ONNX Runtime Web + WASM.
- GPU acceleration is attempted through the browser/WebView runtime where WebGPU/WebGL is available; the app falls back to WASM when GPU execution is unavailable.
- The native wrappers bundle the web build and model assets for offline use. Android keeps the standard Capacitor `INTERNET` permission for WebView compatibility, but the production CSP keeps app/model/OCR fetches on the packaged same-origin assets.
- True NPU acceleration is not automatic in a Capacitor WebView. That should be a later native inference layer using Core ML on iOS and Android NNAPI / a mobile ONNX Runtime execution provider on Android.

Recommended native roadmap:

1. Keep the current Capacitor wrapper for fast offline testing, camera/mic access, file handling, and App Store / Play Store packaging.
2. Add a small native inference bridge only for the heavy models that benefit from device acceleration.
3. Convert or export the supported models for Core ML on iOS and NNAPI / mobile ONNX Runtime on Android.
4. Keep the web/WASM path as the compatibility fallback so the same UI still works everywhere.

## Release Notes

- A paid Apple Developer Program account is required for App Store / TestFlight distribution.
- A free Apple ID is usually enough for local iPhone testing from Xcode, but the installed app may expire.
- Store builds should be tested on real devices for WebGPU availability, memory pressure, video export, audio worklets, camera/mic permissions, and file export behavior.
