# Custom image libraries

This guide explains how bundled **Custom Image** preset libraries work and how to add a new one to W3PN Anonymizer.

Custom images replace detected face regions with PNG patches from a library (or user uploads). All preset assets ship under `public/custom-images/` and load at runtime via `manifest.json` — no API calls in production.

---

## Folder layout

Each library is a directory with square PNGs and a manifest:

```
public/custom-images/{folder}/
  manifest.json
  {folder}-001.png
  {folder}-002.png
  …
  {folder}-100.png
```

### `manifest.json` schema

```json
{
  "name": "my-library",
  "count": 100,
  "size": 256,
  "files": [
    "my-library-001.png",
    "my-library-002.png"
  ]
}
```

| Field | Description |
|-------|-------------|
| `name` | Slug matching the folder name |
| `count` | Number of images (informational) |
| `size` | Target edge length in pixels (256 recommended) |
| `files` | Ordered list of PNG filenames |

### Image requirements

- **Format:** PNG (RGBA or RGB)
- **Size:** 256×256 px recommended (app normalizes via build scripts)
- **Naming:** `{slug}-NNN.png` with zero-padded 3-digit index
- **Count:** Up to 100 images loaded per library (first 100 in manifest)
- **Content:** Square crop; faces/objects centered work best

---

## Add a new bundled library (checklist)

### 1. Add assets

Create `public/custom-images/my-library/` with PNGs + `manifest.json`.

Normalize existing PNGs:

```bash
node scripts/download-preset-icons.mjs --normalize-existing
```

Or use the download script pattern in `scripts/download-preset-icons.mjs` for automated fetching.

### 2. Register in code

Edit **`src/lib/custom-image-presets.ts`** — add one entry:

```ts
{
  id: 'my-library',      // CustomImageSource id
  folder: 'my-library',  // public/custom-images/{folder}
  label: 'My Library',     // UI label
  description: 'Short description',
  source: 'optional attribution',
},
```

### 3. Extend the TypeScript union

In **`src/types.ts`**, add `'my-library'` to `CustomImageSource`:

```ts
export type CustomImageSource =
  | 'custom'
  | 'ui-faces-human'
  | …
  | 'my-library'
```

### 4. Build & verify

```bash
npm run build
npm run dev
```

Open **Effects → Custom Image**, pick **My Library**, confirm thumbnails load. On desktop, verify horizontal touchpad/wheel scrolling while the pointer is directly over a thumbnail; mobile keeps native touch scrolling.

---

## Existing bundled libraries

| ID | Folder | Label | Source |
|----|--------|-------|--------|
| `ui-faces-human` | `human` | UI Faces | randomuser.me |
| `ui-faces-abstract` | `abstract` | Abstract | DiceBear |
| `cryptopunks` | `punks` | CryptoPunks | Larva Labs |
| `aavegotchi` | `aavegotchi` | Aavegotchi | Goldsky / Polygon |
| `celebrities` | `celebrities` | Celebrities | Wikimedia Commons |

Refresh preset PNGs:

```bash
npm run icons:download          # all default sets
npm run icons:download:new      # aavegotchi + celebrities
node scripts/download-preset-icons.mjs --only=aavegotchi --count=100
```

---

## User uploads (`custom`)

Users can upload their own images in-app (**Custom uploads**). These are kept in memory for the session and are not committed to `public/`.

---

## Future: registry-only UI

The central registry (`src/lib/custom-image-presets.ts`) is the single source of truth for labels and folder mapping on desktop and mobile. New libraries only need:

1. Assets in `public/custom-images/`
2. One registry entry + type union entry

No changes to `loadCustomImagePreset` folder maps are required.
