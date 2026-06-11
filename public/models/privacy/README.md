# Privacy detection ONNX models

Place optional YOLO ONNX models in this directory. Metadata JSON files are bundled; `.onnx` files are **not** committed (large).

| File | Purpose |
|------|---------|
| `yolo-coco.onnx` | COCO person + screen-like classes + book→document |
| `yolo-license-plate.onnx` | License plates / SPZ |
| `yolo-privacy-custom.onnx` | Tattoo, sign, document, screen |

If a model file is missing, the app skips that detector and shows **model missing** in Privacy targets UI. Face detection uses YuNet at `public/models/face_detection_yunet_2023mar.onnx`.

All inference runs locally in the browser. No cloud APIs.
