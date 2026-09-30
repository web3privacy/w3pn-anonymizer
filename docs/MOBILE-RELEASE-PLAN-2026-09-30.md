# Mobilní aplikace W3PN Anonymizer

Plán a stav přípravy k 30. září 2026. Doporučuji pokračovat se společným React UI v existujících obalech Capacitoru. Tím zachováme současný vzhled, efekty a ovládání. Nativní části mají zajistit práci se soubory, kamerou a životním cyklem aplikace; těžké zpracování přesuneme do nativní vrstvy pouze tam, kde měření prokáže přínos.

Android a GrapheneOS budou používat stejný Android projekt. F-Droid je distribuční cesta pro Android. Vývojové nástroje už jsou nainstalované, obě nativní sestavení prošla a aplikace se nainstalovala a spustila na Android emulátoru a iPhone simulátoru. Existuje testovací APK pro Redmi; na fyzických telefonech ani iPadu zatím aplikace ověřená není. Podrobnosti a omezení jsou v [záznamu instalace](native-install-2026-09-30/README.md).

## Co je připravené

- Existují projekty `android/` a `ios/App/App.xcodeproj`, identifikátor `info.web3privacy.anonymizer`, Capacitor 7.6.7. Obaly načítají přibalenou aplikaci a lokální modely.
- Aktuální webová verze včetně Prism efektu byla synchronizována do obou obalů. Zachovává se současný design a načítání detektorů až podle potřeby.
- Sdílený export už přenáší data do nativních dočasných souborů po 256 KiB. Android má FileProvider a MediaStore, iOS systémové sdílení a ukládání do Fotek. Implementace existuje; systémová oprávnění, sdílení a úklid musíme ověřit na telefonech.
- Odstraněn nepoužívaný Gradle hook Google Services a nepotřebné Android oprávnění `WRITE_EXTERNAL_STORAGE`. To samo o sobě není kompletní audit závislostí pro F-Droid.
- Kontrola `native:doctor` umí rozlišit platformy a vrací neúspěch při chybějících nástrojích. Build adresáře jsou uvnitř projektu.
- Prošly webový build, lint a 17 automatických testů exportu, práce s médii a dočasným video úložištěm. Tyto testy nenahrazují kompilaci Java/Swift ani testování systémových dialogů.
- Záloha upravovaných souborů je v `backups/20260930-native-preparation/source-before.tar.gz`. Výsledky kontrol jsou v `docs/native-readiness-2026-09-30/`.

## Prostředí a účty

| Oblast | Ověřený stav na tomto Macu | Co doplnit |
| --- | --- | --- |
| Společný základ | Node 22.23.3, npm 10.9.9, webové závislosti přítomné | Pro nový checkout použít Node 22 a `npm ci` s uzamčenými závislostmi. |
| Android | Android Studio, Temurin JDK 21, SDK 35, Build Tools 34/35 a Platform Tools nainstalované; sestavení prošlo | Redmi připojit kabelem, zapnout USB debugging a potvrdit důvěru počítači. |
| iOS a iPadOS | Xcode 27.0 opravené systémové komponenty, iOS 27 simulator runtime přítomný; sestavení a start na iPhone simulátoru prošly | Pro fyzická zařízení vybrat vlastní Signing Team, připojit zařízení a zapnout Developer Mode. Grafické simulátory v tomto Xcode používají Device Hub. |
| F-Droid | Veřejný repozitář existuje; mobilní build recept zatím není ověřený | Dokončit licence, původ balených souborů a sestavení Androidu z konkrétního veřejného zdrojového commitu. |

Projektové požadavky Java 21 a SDK 35 vycházejí z aktuálních Gradle souborů, nikoli z tvrzení o nejnovější podporované verzi Androidu. Obecné požadavky prostředí popisuje [Capacitor 7](https://capacitorjs.com/docs/v7/getting-started/environment-setup).

Pro první APK nepotřebujeme účet Google Play. Pro vlastní testování na iPhonu lze použít osobní Apple účet; TestFlight a App Store vyžadují členství Apple Developer Program. Účet a podpis nastavíš přímo v Xcode, přihlašovací údaje neposílej. V projektu je přednastavený tým, jehož dostupnost pro tvůj účet není ověřená. [Apple účet](https://developer.apple.com/help/account/basics/about-your-developer-account), [distribuce aplikací](https://developer.apple.com/programs/whats-included/).

První pokus o iOS sestavení selhal kvůli chybějícímu CoreSimulatoru. Následná instalace tento problém odstranila; poté se minimum projektu zvedlo na iOS 15 podle požadavku Xcode 27. Vznikla simulator `.app` i Android debug `.apk`. Podepsaná device `.ipa` zatím nevznikla. Android licence byly přijaty po výslovném souhlasu uživatele, Xcode licence už byla potvrzená. Distribuční účty se neregistrovaly.

## Postup vývoje

1. **První instalovatelná foto aplikace.** Doplnit nástroje, sestavit debug APK a iOS aplikaci. Na zařízeních projít import → automatické detekce → ruční štětec a zóny → změna síly všech efektů → export do systémových souborů/Fotek. Ověřit první načtení, návrat z pozadí, opakovaný export a offline režim. Zvlášť změřit demo se stovkami obličejů a velkou vlastní fotografii. První zaměření na foto nesmí způsobit načítání všech video/OCR balíčků při startu; ostatní moduly zůstávají součástí aplikace, jejich podporu zatím nepovažujeme za ověřenou.
2. **Dokumenty, audio, video a Live Mode.** Ověřit PDF redakci bez skryté původní textové vrstvy, TXT export a audio. U videa nejprve změřit dostupnost WebCodecs, OPFS a fallbacku uvnitř skutečné WKWebView/Android WebView. Potom ověřit řídké i frame-by-frame průchody, dodatečnou analýzu, timeline nejistoty, všechny efekty, upravený zvuk a export. Nepodporovaná funkce musí mít jasný stav před dlouhým zpracováním; selhání nesmí vrátit neanonymizovaný originál jako hotový výsledek.
3. **Výkon podle měření.** Zaznamenat čas do použitelného menu, první detekci, odezvu slideru, špičkovou paměť, pracovní disk, dobu exportu a úklid po zrušení. Navržený cíl slideru je souvislá reakce během tažení s dočasně levnějším náhledem a přesným výsledkem po uvolnění. Konkrétní rozpočet stanovíme po prvním měření na Redmi. Limity front a diskové kvóty zachovat; vypnutí všech ochranných limitů by nezvýšilo dostupnou paměť telefonu. Nativní enkodér nebo inference bridge navrhnout pro naměřené problémy, se stejným UI a lokálním zpracováním.
4. **Distribuce.** Vydat interní podepsané buildy; doplnit ikony, accessibility, privacy manifest/údaje pro obchody a release dokumentaci. Následně TestFlight, podepsané Android APK a žádost o F-Droid. Přijetí do obchodu či F-Droidu není předem zaručené. Google Play lze přidat později podle potřeby.

## Testovací zařízení a podmínky dokončení

| Zařízení od uživatele | Hlavní ověření | Dosud chybí |
| --- | --- | --- |
| iPhone 17 Pro | Kamera, HEIC/MOV, orientace, výřez obrazovky, povolení Fotek, export a video | Verze systému a skutečné měření. |
| iPad 10 | Tabletový layout, tři sloupce efektů, změna orientace, Split View, ukotvení share sheetu | Verze systému a skutečné měření. |
| Xiaomi Redmi 11 | Studený start, velké foto/demo, odezva efektů, paměť, přerušení a disk | Přesná varianta telefonu, RAM, verze Androidu/WebView a skutečné měření. |
| Telefon s GrapheneOS | Stejný APK bez Play služeb, kamera/soubory při zamítnutých oprávněních | Testovací zařízení zatím není k dispozici. |

Před veřejnou betou musí na každém dostupném zařízení projít hlavní foto smyčka, zamítnutá oprávnění, zrušení exportu a návrat po uspání. Výsledek musí odpovídat náhledu, s zachovanými ručními maskami. Prověřit velikost/obsah metadata exportu, zejména GPS a EXIF; platformní převody nesmějí znovu přibalit soukromá metadata. Při sdílení se dočasný soubor nesmí smazat dřív, než jej cílová aplikace přečte.

Pro video přidat malý klip, dlouhý klip, nízké volné místo a opakované zrušení. HDR, proměnlivé FPS a kodeky telefonu otestovat samostatně. Opakovaný import/export nesmí postupně zvětšovat pracovní disk ani držet staré mediální objekty. Testovat i Android Back, paměťový tlak, accessibility/VoiceOver/TalkBack a velké systémové písmo. Běh bez sítě ověřit po čisté instalaci, nikoli až po stažení modelů v předchozí relaci.

Deklarované minimum Android 23 a iOS 15 v projektech není důkazem podpory všech mediálních funkcí na těchto systémech. Podporované minimum pro release stanovíme podle měření a dostupných API.

## Velikost aplikace a licence pro F Droid

Současný synchronizovaný webový obsah zabírá přibližně 172 MiB podle diskové alokace. Není to velikost výsledného APK/IPA ani spotřeba RAM. Největší skupiny tvoří ONNX runtime varianty, modely, OCR a obrázkové presety/dema. Návrh: dohledat skutečně používané WASM varianty, odstranit ověřené duplicity a omezit nepotřebná demonstrační média. YuNet a potřebné enginy zachovat pro základní offline funkce. Volitelné modely nesmějí být podmínkou otevření menu; jejich případná samostatná instalace potřebuje verze, kontrolní součty a jasný souhlas uživatele.

Repozitář [web3privacy/w3pn-anonymizer](https://github.com/web3privacy/w3pn-anonymizer) a lokální README deklarují MIT. Tuto licenci zachováme. Při původní kontrole chyběl úplný kořenový soubor licence; při přípravě zdrojového balíčku 30. září byl doplněn soubor `LICENSE` se zachovanou MIT licencí pro projektový kód. Dále není doložen původ a licence obou přibalených YOLO ONNX vah; metadata tříd tyto informace nenahrazují. V assetech je také pomocný `yolo11n.pt`, jehož nutnost pro runtime je potřeba prověřit před zmenšením balíčku. Nevyvozujeme licenci konkrétních vah pouze z názvu YOLO. OCR data mají popis stahování, ale potřebují připnout zdrojovou revizi a doložit licence. Totéž prověřit u fontů, obrázkových presetů, demonstračních médií a WASM knihoven. Základní inventář verzí přímých závislostí, velikostí skupin assetů a hashů modelů je v `docs/native-readiness-2026-09-30/asset-inventory.json`; není to dokončený licenční audit.

F-Droid vyžaduje svobodný kód, doložené licence a sestavení z veřejných zdrojů; kontroluje také závislosti a nepřipouští proprietární tracking SDK. Nativní funkce současného obalu musíme doložit skutečným testem. [Podmínky zařazení](https://f-droid.org/docs/Inclusion_Policy/).

Před žádostí ověřit držitele práv v doplněné MIT licenci, dokončit inventář třetích stran a původ modelů včetně hashů. Připravit build recept s uzamčenými npm/Gradle závislostmi a konkrétním zdrojovým commitem. Lokální pracovní složka nemá Git metadata, takže dnes nelze přiřadit release k ověřenému veřejnému commitu. Před žádostí zveřejnit odpovídající zdroje v uvedeném repozitáři. Scanner neobcházet plošným ignorováním všech WASM/ONNX souborů. [Build metadata F-Droidu](https://f-droid.org/docs/Build_Metadata_Reference/).

Před veřejným Android releasem zvolit podpisovou politiku: standardní podpis F-Droidu, nebo ověřování reprodukovatelného developer-signed buildu podle podporovaného postupu. Rozdílně podepsané instalace stejného application ID nelze běžně vzájemně aktualizovat. Podpisový klíč musí mít bezpečnou zálohu; v této přípravě se release klíče negenerují. [Reprodukovatelné buildy a podpisy](https://f-droid.org/docs/Reproducible_Builds/).

## První sestavení po doplnění nástrojů

Příkazy spouštět z kořene projektu. `sync` kopíruje assety, `debug/build` teprve sestavuje nativní aplikaci.

```bash
npm run native:doctor -- android
npm run android:debug
# Výstup: android/app/build/outputs/apk/debug/app-debug.apk

npm run native:doctor -- ios
npm run ios:build:sim
npm run ios:open
# V Xcode vybrat vlastní tým a připojený iPhone nebo iPad, poté Run.
```

Technické podrobnosti a další příkazy jsou v [návodu k obalům](native-capacitor.md). Nástroje, sestavení a základní testovací start už prošly; potvrzení podpory všech mobilních funkcí přijde až s mediálními testy na skutečných zařízeních.
