# Instalace mobilního vývojového prostředí

K 30. září 2026 jsou na tomto Macu připravené nástroje pro Android a iOS. Prošly kontroly prostředí, sestavení obou nativních aplikací a základní instalace a spuštění ve virtuálních telefonech. Kompletní mediální workflow a skutečné telefony tím zatím nejsou ověřené.

**Následná oprava téhož dne:** původní iOS kontrola zaznamenala vytvoření procesu, ale neověřila jeho další běh. Uživatel následně reprodukoval okamžitý pád; crash report ukázal chybějící UIKit scene lifecycle. Wrapper byl opraven a nová ověření jsou v [záznamu opravy spuštění](../ios-startup-2026-09-30/README.md). Níže uvedené původní výsledky jsou historický záznam instalace.

## Nainstalované nástroje

| Nástroj | Stav |
| --- | --- |
| Android Studio | Quail 4 2026.1.4 Patch 1 v `/Applications/Android Studio.app`; úvodní průvodce dokončený, statistiky používání odmítnuté. |
| Java pro sestavení | Otevřené Temurin JDK 21.0.12.1+1 v `~/Library/Java/JavaVirtualMachines/temurin-21.jdk`. |
| Android SDK | Platform 35, Build Tools 34.0.0 a 35.0.0, Platform Tools 37.0.1, Command-line Tools 22.0. |
| Gradle | Projektová verze 8.11.1, oficiální SHA-256 připnuté ve wrapperu. |
| Android Emulator | 37.1.11.0, ARM64 Android 15 API 35 bez Play služeb; hardwarová akcelerace Hypervisor.Framework ověřená. |
| Xcode | Existující 27.0 27A266a; chybějící systémové komponenty úspěšně doplněné přes oficiální first-launch instalaci. |
| iOS runtime | iOS 27.0 24A434 ARM64 úspěšně stažený a nainstalovaný. |
| Node a Git | Existující Node 22.23.3, npm 10.9.9 a Git 2.54.0 ověřené; nebylo potřeba další instalace. |

Samostatné JDK 21 je záměrné: Studio používá vlastní JBR 25 pro IDE, zatímco starší Gradle tohoto projektu používá Temurin 21. Projektové lokální nastavení je v `android/.gradle/config.properties` a `android/.idea/gradle.xml`, bez absolutní cesty v přenositelných Gradle souborech. [Volba JDK v Android Studiu](https://developer.android.com/build/jdks), [kompatibilita Gradle](https://docs.gradle.org/current/userguide/compatibility.html).

Cesty pro nové terminály nastavuje `~/.config/anonymizer/native-env.zsh`, načítaný z `.zprofile`. Předchozí profil byl zachovaný v soukromé záloze pod `~/.config/anonymizer/native-setup-backups/`. Není uložený v projektu. Homebrew, CocoaPods ani další mobilní framework nejsou pro tento checkout potřeba.

## Ověřené výsledky

- `native:doctor` pro obě platformy vrací úspěch a `ready: true`; doklad `environment.json`.
- Android build skončil `BUILD SUCCESSFUL`. Debug APK je v `android/app/build/outputs/apk/debug/app-debug.apk`, přibližně 106 MiB. Instalace do `Anonymizer_API_35` vrátila `Success`; spuštění `MainActivity` vrátilo `Status: ok` a proces dále běžel. Nativní `NativeMediaLibrary` se zaregistrovala. Doklady: `android-build.log`, `android-startup.log`.
- iOS simulator build skončil `BUILD SUCCEEDED`. Výstup je v `release/ios-simulator/DerivedData/Build/Products/Debug-iphonesimulator/App.app`. Instalace na testovací iPhone 17 Pro a spuštění bundle `info.web3privacy.anonymizer` prošly. Byl vytvořen také profil iPadu 10, jeho běh ani tabletové UI ještě nejsou otestované. Doklady: `ios-build.log`, `ios-devices.json`, `installed-tools.json`.
- Xcode 27 odmítal původní target iOS 14; App a jeho SPM balíček nyní používají iOS 15. Záloha původních souborů je v `backups/20260930-native-install/`.
- Ručně stažené Android Studio, command-line tools, Temurin a Gradle byly ověřené vůči oficiálním kontrolním součtům. Identifikace downloadů je v `downloads.json`. Licenční podmínky potřebných Android komponent byly přijaty po výslovném souhlasu uživatele. Xcode licence už byla v systému potvrzená před instalací.

Testovací emulátory se po ověření vypínají, jejich profily zůstávají pro další práci. Android Studio bylo ověřené i přes grafický úvodní průvodce. Nástroj Computer Use při kontrole grafického Device Hubu skončil serverovým timeoutem; nejde o výsledek testu samotné aplikace. Vizuální kontrolu iOS UI proto nepovažujeme za provedenou.

V Xcode 27 se simulátory zobrazují přes `DeviceHub.app` v `/Applications/Xcode.app/Contents/Applications/`, nikoli ve starší samostatné `Simulator.app`. Použít lze Xcode → Open Developer Tool → Device Hub. [Apple popis běhu na zařízeních](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices).

## Další testování

Pro fyzický iPhone a iPad je potřeba zvolit vlastní Signing Team v Xcode, připojit zařízení a zapnout Developer Mode. Pro Redmi zapnout USB debugging a potvrdit důvěru počítači. Podpis pro distribuci, TestFlight/App Store a veřejný F-Droid release nejsou součástí této instalace.

Další krok je kompletní foto smyčka na skutečných zařízeních, pak dokumenty, audio, video, oprávnění a úklid souborů. GrapheneOS stále potřebuje fyzické testovací zařízení. Přijetí do F-Droidu také vyžaduje dokončení licencí, původu modelů a ověřitelného build receptu; instalace SDK tento audit nenahrazuje. Podrobnosti jsou v [mobilním plánu](../MOBILE-RELEASE-PLAN-2026-09-30.md).
