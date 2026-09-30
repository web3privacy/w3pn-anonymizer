# Ověření přípravy mobilních aplikací

Stav k 30. září 2026. Jde o přípravu existujících Capacitor projektů, nikoli o vydání instalovatelné aplikace.

Tento záznam zachovává původní kontrolu před instalací SDK. Následná instalace nástrojů odstranila zde uvedené blokery a obě nativní sestavení prošla; aktuální výsledky jsou v [záznamu instalace](../native-install-2026-09-30/README.md).

| Kontrola | Výsledek | Doklad |
| --- | --- | --- |
| Webový build a synchronizace Android assetů | Prošlo | `android-sync.log` |
| Synchronizace iOS assetů | Prošlo; kopie porovnána se stejným webovým buildem | `ios/App/App/public` |
| TypeScript/React lint | Prošlo | `lint.log` |
| Testy nativního export bridge, importu médií a video úložiště | 17 testů prošlo | `export-tests.log` |
| Syntaxe obou upravených Node skriptů | Prošlo přes `node --check` | `scripts/native-environment.mjs`, `scripts/run-native-command.mjs` |
| Android manifest a odstranění Google Services hooku | Statické kontroly prošly | Java/Gradle kompilace čeká na nástroje |
| Kontrola místního prostředí | Správně vrací exit 1, prostředí není kompletní | `environment.json` |
| iOS simulator build | Selhal před kompilací: chybějící systémový CoreSimulator framework | `ios-simulator-build.log` |
| Android APK build, iOS device build a funkce na telefonech | Zatím neověřené | Chybí Android nástroje; Xcode vyžaduje opravu komponent |

`asset-inventory.json` zachycuje verze a deklarované licence 20 přímých runtime závislostí, velikosti vybraných skupin assetů a SHA-256 čtyř souborů modelů. Nepotvrzuje licenční soulad jejich obsahu ani tranzitivních závislostí. Kopie webových souborů v obou nativních projektech byly porovnány pomocí SHA-256; `.DS_Store` se při synchronizaci záměrně vyřazuje.

Hlavní webový soubor zůstal `index-BVtrZM6j.js`. Tato příprava nemění produkční web ani dosavadní UI. Další kroky a požadavky jsou v [mobilním plánu](../MOBILE-RELEASE-PLAN-2026-09-30.md).
