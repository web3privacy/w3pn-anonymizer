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
        CAPPluginMethod(name: "beginExport", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "appendExport", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishExport", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelExport", returnType: CAPPluginReturnPromise)
    ]
    private struct Export { let url: URL; let name: String; let type: String }
    private var exports: [String: Export] = [:]
    private let exportRoot = FileManager.default.temporaryDirectory.appendingPathComponent("anonymizer-exports", isDirectory: true)

    override func load() {
        try? FileManager.default.removeItem(at: exportRoot)
        try? FileManager.default.createDirectory(at: exportRoot, withIntermediateDirectories: true)
    }

    @objc func beginExport(_ call: CAPPluginCall) {
        let id = UUID().uuidString
        let type = call.getString("mediaType") ?? "file"
        let name = sanitizeFileName(call.getString("fileName"), mimeType: call.getString("mimeType") ?? "application/octet-stream", mediaType: type)
        let dir = exportRoot.appendingPathComponent(id, isDirectory: true)
        let url = dir.appendingPathComponent(name)
        do {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            try Data().write(to: url, options: .completeFileProtection)
            exports[id] = Export(url: url, name: name, type: type)
            call.resolve(["id": id])
        } catch { call.reject("Could not prepare export: \(error.localizedDescription)") }
    }

    @objc func appendExport(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), let entry = exports[id],
              let raw = call.getString("data"), raw.count <= 350000,
              let data = Data(base64Encoded: raw) else { call.reject("Invalid export chunk."); return }
        do {
            let handle = try FileHandle(forWritingTo: entry.url)
            defer { try? handle.close() }
            try handle.seekToEnd()
            try handle.write(contentsOf: data)
            call.resolve()
        } catch { call.reject("Could not write export: \(error.localizedDescription)") }
    }

    @objc func cancelExport(_ call: CAPPluginCall) {
        if let id = call.getString("id"), let entry = exports.removeValue(forKey: id) {
            try? FileManager.default.removeItem(at: entry.url.deletingLastPathComponent())
        }
        call.resolve()
    }

    @objc func finishExport(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), let entry = exports[id] else { call.reject("Export expired."); return }
        if entry.type == "file" {
            DispatchQueue.main.async { [weak self] in
                guard let self = self, let presenter = self.bridge?.viewController else { call.reject("Share sheet unavailable."); return }
                let sheet = UIActivityViewController(activityItems: [entry.url], applicationActivities: nil)
                if let popover = sheet.popoverPresentationController {
                    popover.sourceView = presenter.view
                    popover.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.midY, width: 1, height: 1)
                }
                sheet.completionWithItemsHandler = { _, completed, _, error in
                    if let error = error { call.reject(error.localizedDescription) }
                    else if !completed { call.reject("Export cancelled.") }
                    else { call.resolve() }
                }
                presenter.present(sheet, animated: true)
            }
            return
        }
        requestAddOnlyPhotoAccess { [weak self] allowed in
            guard allowed else { call.reject("Photo library permission was denied."); return }
            self?.saveFile(entry: entry, call: call)
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

    private func saveFile(entry: Export, call: CAPPluginCall) {
        let tempURL = entry.url
        let fileName = entry.name
        let mediaType = entry.type
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
