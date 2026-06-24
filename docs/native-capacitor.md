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
```

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
