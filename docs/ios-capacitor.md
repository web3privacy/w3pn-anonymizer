# iOS Capacitor Wrapper

This project includes a Capacitor iOS wrapper around the existing Vite app.

For the shared iOS + Android sync flow, offline model packaging, and device-resource notes, see [`native-capacitor.md`](./native-capacitor.md).

## Local Device Test

1. Install Xcode from the Mac App Store.
2. If `xcodebuild` still points to Command Line Tools, run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

3. Connect the iPhone by cable and trust the Mac on the phone.
4. Run:

```bash
npm run ios:sync
npm run ios:open
```

5. In Xcode, select the connected iPhone as the run target.
6. In `Signing & Capabilities`, choose your Apple ID team.
7. If Xcode asks for a unique bundle identifier, temporarily change `info.web3privacy.anonymizer` to something unique for local testing.
8. Press Run.

## Notes

- A paid Apple Developer Program account is required for App Store and TestFlight distribution.
- A free Apple ID is usually enough for local on-device testing from Xcode, but the app may expire and need to be reinstalled.
- The wrapper uses the local `dist` build, so run `npm run ios:sync` after frontend changes.
- The current project uses the Capacitor SPM iOS template to avoid requiring CocoaPods for the first device test.
- Camera, microphone, photo library, model loading, WebAssembly, and memory usage should be tested on real devices before any store submission.
- Optional YOLO/OCR assets load only after their target is enabled; test these flows separately from the face-only startup path.
- The iOS wrapper uses the same blackout document defaults, local feedback endpoint, button system, and responsive editor as the web build.
- See [`DEPENDENCIES.md`](./DEPENDENCIES.md) for the full Capacitor and browser-runtime inventory.
