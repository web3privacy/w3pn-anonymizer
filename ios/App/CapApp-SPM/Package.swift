// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [],
    targets: [
        .binaryTarget(
            name: "Capacitor",
            path: "Vendor/Capacitor.xcframework"
        ),
        .binaryTarget(
            name: "Cordova",
            path: "Vendor/Cordova.xcframework"
        ),
        .target(
            name: "CapApp-SPM",
            dependencies: [
                "Capacitor",
                "Cordova"
            ]
        )
    ]
)
