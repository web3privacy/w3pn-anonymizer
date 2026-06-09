# Mobilní UI redesign — detailní implementační plán

> W3PN Anonymizer · React/Vite · `src/mobile/*`  
> Referenční screenshoty: přiložené PNG v `.cursor/.../assets/`  
> Brand assety: `public/brand/`

---

## 0. Cíle a omezení

| Cíl | Detail |
|-----|--------|
| **Zachovat logiku** | Face detection, zóny, brush, batch, live camera, video pipeline, timed masks, frame snapshots — beze změny algoritmů |
| **Přestylovat mobil** | Černé pozadí `#000`, accent `#00FF78`, uppercase labely, kompaktní chrome |
| **Nerozbít desktop** | Desktop workspace, `video-controls-bar`, sidebar — beze změny chování |
| **Breakpoint** | `max-width: 1024px` (`useIsMobile`, `.app-shell-mobile`) |

---

## 1. Brand assety a design tokeny

### 1.1 Soubory (`public/brand/`)

| Soubor | Použití |
|--------|---------|
| `spiral-logo.png` | Home — rotující logo (~65–75 % šířky viewportu) |
| `anonymizer-wordmark.png` | Home — pod spirálou |
| `anonymizer-header.png` | `MobileTopBar`, About header |
| `w3pn-logo.png` | Home top-left, About footer |

### 1.2 CSS tokeny (`mobile-redesign.css`)

```css
--mobile-accent: #00ff78;
--mobile-panel-bg: rgba(8, 8, 8, 0.92);
--mobile-download-blue: #3b7ddd;
```

### 1.3 Typografie

- Wide sans-serif stack (Archivo-like bez CDN — systémový font + `letter-spacing`)
- Labely: `text-transform: uppercase`, `0.48–0.68rem`
- Safe area: `env(safe-area-inset-top/bottom)`

### 1.4 Stav implementace

- [x] Assety zkopírovány
- [x] `mobile-redesign.css` vytvořen
- [ ] Volitelně: self-hosted Archivo TTF později

---

## 2. Home screen (`MobileHomeDefault.tsx`)

### 2.1 Layout (dle `Home-Default.png`)

```
┌─────────────────────────────────────┐
│ [W3PN logo]          WHAT IS THIS?  │
│                                     │
│         [rotující spiral logo]      │
│            ANONYMIZER               │
│                                     │
│      [ TURN ON CAMERA ]  (green)    │
│      [ SELECT MEDIA   ]  (outline)  │
│           LOAD DEMO                 │
└─────────────────────────────────────┘
```

### 2.2 Komponenty

| Komponenta | Soubor | Chování |
|------------|--------|---------|
| Spiral logo | `MobileSpiralLogo.tsx` | `requestAnimationFrame`, idle 12°/s, hold → akcelerace až 360°/s, release → ease zpět |
| CTA | `MobileHomeDefault.tsx` | Live → `setMobileMode('live')`, Media → `openUnifiedPicker`, Demo → `loadDemoPhotos` |
| About link | header | `setAboutOpen(true)` |

### 2.3 Drag & drop

- Zachovat `isDragOver` třídu + overlay „Drop files here"

### 2.4 Stav

- [x] Implementováno

---

## 3. About screen (`MobileAbout.tsx`)

### 3.1 Mobilní full-screen modal

- Render: `isMobile && aboutOpen` v `App.tsx` (desktop stále používá starý `about-modal`)
- Header: library icon (disabled placeholder) | wordmark | X
- Scroll: intro, FEATURES grid 2×3, OPEN-SOURCE & LOCAL
- Footer: W3PN logo, CONTRIBUTE ON GIT, Give us Feedback

### 3.2 Stav

- [x] `MobileAbout.tsx` vytvořen
- [x] Podmíněný render v `App.tsx`

---

## 4. Shared topbar (`MobileTopBar.tsx`)

### 4.1 Sloty

| Kontext | Left | Center | Right |
|---------|------|--------|-------|
| Editor/video | `photo_library` | `anonymizer-header.png` → About | green LIVE pill |
| Live | library + red LIVE | wordmark | X |
| About | — | wordmark | X |

### 4.2 Callbacks (beze změny API)

- `onAbout`, `onOpenGallery`, `onLiveMode`, `onClose`

### 4.3 Stav

- [x] `mobile-topbar-v2` styly
- [x] Odstraněn starý SVG brand + chevron

---

## 5. Media/export toolbar (`MobileEditorToolbar.tsx`)

### 5.1 Řádek pod topbarem

```
[demo-1.webp (992×662) ▼]                    [⬇ blue]
```

### 5.2 Dropdown — obrázky

- Size W×H, format, quality, ~KB preview, OK → `commitMobileExportEdit`

### 5.3 Dropdown — video

- **Export format** select z `videoExportOptions` (disabled = unavailable)
- Metadata: duration, fps, pending edits count
- `<details>` Pipeline info (worker/WebCodecs)
- **Odstraněno z hlavního UI:** samostatný export format v `video-controls-bar` na mobilu

### 5.4 Download

- Modrý čtverec 36×36 → `exportActivePhoto` / `exportActiveVideo`

### 5.5 Stav

- [x] Unified toolbar pro image + video
- [x] Video export přesunut do dropdownu

---

## 6. Image editor (`MobileActionBar` + existující canvas)

### 6.1 Primary action row

```
[DRAW MASK]  [ANONYMIZE*]  [-][+]
```

- ANONYMIZE green jen když `activeZones.length > 0 && !zonesAnonymized`
- Zoom ± přes `stepMobileViewZoom`
- `MobileExportControls` odstraněn (nahrazen action bar)

### 6.2 Sliders (`MobileBottomToolbar`)

- STR vždy, SIZE když `!liveMode`
- Kategorie: FACE, BRUSH, CROP, BRIGH, DIST, PIXEL

### 6.3 Draw mask (`MobileDrawMaskPanel`)

- Aktivní když `imageMaskDrawActive`
- RECTANGLE / BRUSH toggle → `toolMode`
- CLEAR ALL → `clearZones`

### 6.4 Stav

- [x] `MobileActionBar.tsx`
- [x] `MobileDrawMaskPanel.tsx`
- [x] `imageMaskDrawActive` state v `App.tsx` + bindings
- [ ] Sync: `setImageMaskDrawActive(true)` → auto `setToolMode('zone')`

---

## 7. Video controls (`MobileActionBar` + skrytý desktop bar)

### 7.1 Skrytí desktop baru

```css
.video-controls-bar--hidden-mobile { display: none !important; }
```

### 7.2 Mobile action row

```
[◀] [DRAW MASK] [ANONYMIZE] [EDIT FRAME] [▶]
```

### 7.3 Bindings rozšíření (`bindings.ts`)

Nová pole v `AppMobileBindings`:

- `processActiveVideo`, `videoExportFormat`, `setVideoExportFormat`, `videoExportOptions`
- `videoProcessing`, `videoProgress`, `cancelVideoProcessing`
- `videoMaskDrawActive`, `setVideoMaskDrawActive`, `videoMaskRangeSec`, `setVideoMaskRangeSec`
- `stepActiveVideoFrame`, `openCurrentVideoFrameAsSnapshot`
- `applySnapshotToSourceVideo`, `jumpToSourceVideoFromSnapshot`, `sourceVideoPhoto`
- `activeVideoFrameOverrides`, `activeVideoTimedZones`, `clearVideoTimedZones`
- `activeVideoTime`, `hasPendingVideoEdits`, `videoPipelineCapabilities`

### 7.4 Draw mask (video)

- `DRAW MASK` → `setVideoMaskDrawActive`
- Panel: RECTANGLE + Range [N] s → `videoMaskRangeSec`
- RESET MASKS → `clearVideoTimedZones`
- Po nakreslení: existující `handleVideoMaskPointerUp` logika

### 7.5 Progress overlay

- Stávající `detecting-overlay` v `App.tsx` — funguje i na mobilu
- [ ] Volitelně: kompaktnější mobilní overlay

### 7.6 Stav

- [x] Bindings wired v `App.tsx`
- [x] Desktop bar skrytý na mobilu
- [x] Action bar pro video

---

## 8. Edit-frame flow

### 8.1 Detekce

```ts
activePhoto && !activePhoto.isVideo
  && activePhoto.derivedFromVideoId
  && activePhoto.derivedFromVideoTime != null
```

### 8.2 UI

- Action row: DRAW MASK | ANONYMIZE | **SAVE** (green outline)
- SAVE → `applySnapshotToSourceVideo`
- Toast: „Frame saved to source video" + action „Back to video"

### 8.3 Stav

- [x] SAVE tlačítko v `MobileActionBar`
- [x] Toast po uložení
- [ ] Frame ± v edit-frame módu (volitelné — vyžaduje step adjacent frame)

---

## 9. Live mode (`MobileLiveMode.tsx`)

### 9.1 Layout

- Topbar live variant (library + LIVE badge, X)
- Camera preview s letterboxing
- `MobileLiveFloatingControls`: aspect | shutter | torch
- STR slider + bottom tabs: FACE (badge), BRIGH, DIST, PIXEL

### 9.2 Effect drawer

- Title: **CHOOSE EFFECT**
- 3-column grid, uppercase labels
- Live: drawer zůstává otevřený po výběru
- Active: green border

### 9.3 Stav

- [x] Topbar live variant
- [x] CHOOSE EFFECT title + no auto-close v live
- [ ] Restyle floating controls (částečně existující CSS)

---

## 10. Effect settings drawer (`MobileDistortDrawer.tsx`)

### 10.1 Subview

- Header: ← | HALFTONE | X
- Sliders: Dot size, Contrast, Angle, Strength
- Live: okamžitý preview

### 10.2 Stav

- [x] Existující `DistortSettingsPanel` — funguje
- [ ] Restyle header dle screenshotu (back arrow + uppercase title)

---

## 11. Library drawer (`MobileGalleryDrawer.tsx`)

### 11.1 Layout

- Title: LIBRARY
- ADD FILES (green) | BATCH (outline)
- „N PHOTOS · SELECT" + grid/list toggle
- 2-column grid, green border selected, VIDEO badge
- Blue „Download all" footer

### 11.2 Stav

- [x] LIBRARY title, SELECT link, VIDEO badge
- [x] Green/blue button styly v CSS

---

## 12. Desktop logo (budoucí)

- [ ] Použít `spiral-logo.png` / wordmark v desktop topbar (`App.tsx` ~line 3620)
- Mimo scope aktuálního mobilního PR — připravit assety

---

## 13. Architektura souborů

```
src/mobile/
├── MobileShell.tsx          # Router: home | live | editor chrome
├── MobileHomeDefault.tsx    # Landing v2
├── MobileSpiralLogo.tsx     # Rotující logo
├── MobileAbout.tsx          # Full-screen about (mobile)
├── MobileTopBar.tsx         # Header v2
├── MobileEditorToolbar.tsx  # File + export dropdown
├── MobileActionBar.tsx      # DRAW MASK / ANONYMIZE / frame nav
├── MobileDrawMaskPanel.tsx  # Context panel pro mask drawing
├── MobileBottomToolbar.tsx  # Sliders + category tabs
├── MobileEditorLayout.tsx   # Chrome → canvas → bottom
├── bindings.ts              # App ↔ mobile bridge (+ video fields)
├── mobile.css               # Base mobile layout
├── mobile-redesign.css      # v2 visual tokens + components
└── drawers/
    └── MobileGalleryDrawer.tsx
```

---

## 14. Integrace v `App.tsx`

| Změna | Detail |
|-------|--------|
| `imageMaskDrawActive` | Nový state |
| `mobileBindings` | +20 video-related polí |
| `video-controls-bar` | `+ video-controls-bar--hidden-mobile` when `isMobile` |
| `MobileExportControls` | Odstraněn (nahrazen action bar) |
| `aboutOpen` | Mobile → `MobileAbout`, desktop → starý modal |
| `applySnapshotToSourceVideo` | Mobile toast s „Back to video" |

---

## 15. Testovací checklist

### Home
- [ ] Logo rotuje pomalu
- [ ] Hold zrychluje rotaci
- [ ] TURN ON CAMERA → live
- [ ] SELECT MEDIA → picker
- [ ] WHAT IS THIS → About

### Image
- [ ] Demo load, face boxes
- [ ] DRAW MASK → rectangle/brush panel
- [ ] ANONYMIZE (enabled jen se zónami)
- [ ] Export dropdown + download

### Video
- [ ] Žádný desktop video bar
- [ ] Export format v dropdownu
- [ ] Frame ±, DRAW MASK + Range, ANONYMIZE
- [ ] EDIT FRAME → snapshot
- [ ] SAVE → toast + back to video

### Live
- [ ] Camera, FACE toggle, effect drawer
- [ ] Capture → library

### Library
- [ ] ADD FILES, SELECT/batch, download all

### Desktop
- [ ] `npm run build` ✓
- [ ] Desktop flows beze změny

---

## 16. Pořadí implementace (dokončeno / zbývá)

| # | Fáze | Stav |
|---|------|------|
| 1 | Brand + tokeny | ✅ |
| 2 | Home redesign | ✅ |
| 3 | About redesign | ✅ |
| 4 | Topbar + media toolbar | ✅ |
| 5 | Video controls + hide desktop bar | ✅ |
| 6 | Edit-frame SAVE | ✅ |
| 7 | Drawers / live effects | 🔶 částečně |
| 8 | Library restyle | ✅ |
| 9 | Build + dev server | 🔶 build OK |

### Dokončený polish (2. vlna)

1. [x] Desktop typografické logo (`anonymizer-header.png`, bez spirály)
2. [x] `MobileDistortDrawer` settings header (← HALFTONE X)
3. [x] Frame ± v edit-frame módu (`stepEditFrameAdjacent`)
4. [x] Self-hosted Archivo (`@fontsource/archivo`)
5. [x] Kompaktní `MobileVideoProgress` overlay
6. [x] Glass chrome (topbar, toolbar, action bar, bottom bar, tool drawers)
7. [x] Solid panely pro Library + Batch (`mobile-drawer-side--solid`)
8. [x] Sjednocený padding `--mobile-pad-h: 14px`

---

## 17. Spuštění pro testování

```bash
npm run dev
# nebo
npm run dev:ipv4
```

Otevřít v prohlížeči s mobilním viewportem (390–430px) nebo DevTools device mode.
