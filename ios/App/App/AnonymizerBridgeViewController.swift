import UIKit
import WebKit
import Capacitor
import Photos

class AnonymizerBridgeViewController: CAPBridgeViewController {
    override var preferredStatusBarStyle: UIStatusBarStyle {
        .lightContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        edgesForExtendedLayout = .all
        extendedLayoutIncludesOpaqueBars = true
        configureFullscreenWebView()
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(NativeMediaLibraryPlugin())
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        configureFullscreenWebView()
    }

    private func configureFullscreenWebView() {
        view.backgroundColor = .black
        view.window?.backgroundColor = .black
        navigationController?.view.backgroundColor = .black
        view.tintColor = .white

        guard let webView = webView else { return }
        webView.frame = view.bounds
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.backgroundColor = .black
        webView.isOpaque = false

        let scrollView = webView.scrollView
        scrollView.backgroundColor = .black
        scrollView.bounces = false
        scrollView.alwaysBounceVertical = false
        scrollView.alwaysBounceHorizontal = false
        scrollView.contentInset = .zero
        scrollView.scrollIndicatorInsets = .zero
        scrollView.contentInsetAdjustmentBehavior = .never

        if #available(iOS 15.0, *) {
            scrollView.automaticallyAdjustsScrollIndicatorInsets = false
        }
    }
}

@objc(NativeMediaLibraryPlugin)
class NativeMediaLibraryPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "NativeMediaLibrary"
    let jsName = "NativeMediaLibrary"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "saveMedia", returnType: CAPPluginReturnPromise)
    ]

    @objc func saveMedia(_ call: CAPPluginCall) {
        guard let rawData = call.getString("data"), !rawData.isEmpty else {
            call.reject("Missing media data.")
            return
        }
        let mediaType = call.getString("mediaType") ?? "photo"
        guard mediaType == "photo" || mediaType == "video" else {
            call.reject("Unsupported media type.")
            return
        }
        let mimeType = call.getString("mimeType") ?? (mediaType == "video" ? "video/mp4" : "image/jpeg")
        let fileName = sanitizeFileName(call.getString("fileName"), mimeType: mimeType, mediaType: mediaType)
        let base64 = rawData.components(separatedBy: ",").last ?? rawData
        guard let data = Data(base64Encoded: base64) else {
            call.reject("Invalid media data.")
            return
        }

        requestAddOnlyPhotoAccess { [weak self] allowed in
            guard allowed else {
                call.reject("Photo library permission was denied.")
                return
            }
            self?.writeAndSave(data: data, fileName: fileName, mediaType: mediaType, call: call)
        }
    }

    private func requestAddOnlyPhotoAccess(_ completion: @escaping (Bool) -> Void) {
        if #available(iOS 14, *) {
            let status = PHPhotoLibrary.authorizationStatus(for: .addOnly)
            if status == .authorized || status == .limited {
                completion(true)
            } else if status == .notDetermined {
                PHPhotoLibrary.requestAuthorization(for: .addOnly) { next in
                    completion(next == .authorized || next == .limited)
                }
            } else {
                completion(false)
            }
        } else {
            let status = PHPhotoLibrary.authorizationStatus()
            if status == .authorized {
                completion(true)
            } else if status == .notDetermined {
                PHPhotoLibrary.requestAuthorization { next in
                    completion(next == .authorized)
                }
            } else {
                completion(false)
            }
        }
    }

    private func writeAndSave(data: Data, fileName: String, mediaType: String, call: CAPPluginCall) {
        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension((fileName as NSString).pathExtension)
        do {
            try data.write(to: tempURL, options: .atomic)
        } catch {
            call.reject("Could not prepare media for saving: \(error.localizedDescription)")
            return
        }

        let options = PHAssetResourceCreationOptions()
        options.originalFilename = fileName
        let resourceType: PHAssetResourceType = mediaType == "video" ? .video : .photo

        PHPhotoLibrary.shared().performChanges({
            let request = PHAssetCreationRequest.forAsset()
            request.addResource(with: resourceType, fileURL: tempURL, options: options)
        }, completionHandler: { success, error in
            try? FileManager.default.removeItem(at: tempURL)
            DispatchQueue.main.async {
                if success {
                    call.resolve(["uri": tempURL.lastPathComponent])
                } else {
                    call.reject(error?.localizedDescription ?? "Could not save media to the photo library.")
                }
            }
        })
    }

    private func sanitizeFileName(_ fileName: String?, mimeType: String, mediaType: String) -> String {
        let fallbackExt: String
        if mimeType.contains("webm") {
            fallbackExt = "webm"
        } else if mimeType.contains("quicktime") {
            fallbackExt = "mov"
        } else if mimeType.contains("png") {
            fallbackExt = "png"
        } else if mimeType.contains("webp") {
            fallbackExt = "webp"
        } else {
            fallbackExt = mediaType == "video" ? "mp4" : "jpg"
        }

        let raw = (fileName?.isEmpty == false ? fileName! : "w3pn-capture.\(fallbackExt)")
            .components(separatedBy: "/")
            .last ?? "w3pn-capture.\(fallbackExt)"
        let allowed = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: ".-_"))
        let cleaned = raw.unicodeScalars.map { allowed.contains($0) ? Character($0) : "-" }
        let name = String(cleaned).trimmingCharacters(in: CharacterSet(charactersIn: "-"))
        return (name as NSString).pathExtension.isEmpty ? "\(name).\(fallbackExt)" : name
    }
}
